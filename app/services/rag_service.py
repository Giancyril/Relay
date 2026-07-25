"""
RAG (Retrieval-Augmented Generation) service.

Orchestrates the full pipeline:
  1. Embed the user's question.
  2. Query ChromaDB for the top-k most relevant chunks.
  3. Build a grounded prompt with the retrieved context.
  4. Call the Gemini LLM and return the structured result.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from app.config import settings
from app.core.chromadb_client import get_collection
from app.core.embeddings import get_embeddings
from app.core.gemini_client import generate_answer
from app.services.escalation_logger import escalation_logger

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """You are a helpful customer support assistant. Answer the user's
question ONLY using the provided context snippets. If the context does not contain
enough information to answer confidently, say exactly:
"I don't have enough information to answer that confidently."
Do NOT make up information or answer from general knowledge.

Context:
{context}
"""

_ESCALATION_PHRASE = "I don't have enough information to answer that confidently."


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------


@dataclass
class RetrievedChunk:
    """A single retrieved document chunk with its similarity score."""

    text: str
    source: str
    distance: float  # cosine distance; lower = more similar


@dataclass
class RAGResult:
    """The full output of a RAG query."""

    answer: str
    retrieved_chunks: list[RetrievedChunk] = field(default_factory=list)
    should_escalate: bool = False
    top_distance: float = 1.0  # worst-case default


# ---------------------------------------------------------------------------
# Core service function
# ---------------------------------------------------------------------------


def query_rag(question: str, top_k: int | None = None) -> RAGResult:
    """
    Run the full RAG pipeline for a given user question.

    Args:
        question: The user's natural-language question.
        top_k: How many chunks to retrieve. Defaults to settings.retrieval_top_k.

    Returns:
        A RAGResult with the answer, retrieved chunks, and escalation flag.
    """
    if top_k is None:
        top_k = settings.retrieval_top_k

    # -- Step 1: Embed the question ------------------------------------------
    logger.info("Embedding user question (%d chars)", len(question))
    question_embedding = get_embeddings([question])[0]

    # -- Step 2: Query ChromaDB ----------------------------------------------
    collection = get_collection()
    results: dict[str, Any] = collection.query(
        query_embeddings=[question_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    # Unpack ChromaDB's nested-list response
    raw_docs: list[str] = results.get("documents", [[]])[0]
    raw_metas: list[dict] = results.get("metadatas", [[]])[0]
    raw_distances: list[float] = results.get("distances", [[]])[0]

    chunks: list[RetrievedChunk] = []
    for doc, meta, dist in zip(raw_docs, raw_metas, raw_distances):
        chunks.append(
            RetrievedChunk(
                text=doc,
                source=meta.get("source", "unknown"),
                distance=dist,
            )
        )
        logger.debug("Chunk source=%s distance=%.4f", meta.get("source"), dist)

    top_distance = chunks[0].distance if chunks else 1.0

    # -- Step 3: Build grounded prompt ---------------------------------------
    context_block = "\n\n---\n\n".join(
        f"[Source: {c.source}]\n{c.text}" for c in chunks
    )
    full_prompt = (
        _SYSTEM_PROMPT.format(context=context_block)
        + f"\nUser question: {question}"
    )

    # -- Step 4: Generate answer via LLM ------------------------------------
    logger.info("Sending prompt to LLM (top_distance=%.4f)", top_distance)
    answer = generate_answer(full_prompt)

    # -- Step 5: Determine escalation flag ----------------------------------
    # Escalate if:
    #   (a) The LLM itself said it isn't confident, OR
    #   (b) The closest chunk distance exceeds our threshold
    distance_too_far = top_distance > settings.escalation_distance_threshold
    llm_uncertain = _ESCALATION_PHRASE.lower() in answer.lower()
    should_escalate = distance_too_far or llm_uncertain

    logger.info(
        "RAG complete: escalate=%s (distance_flag=%s, llm_flag=%s)",
        should_escalate,
        distance_too_far,
        llm_uncertain,
    )

    # -- Step 6: Log escalations for human review ---------------------------
    if should_escalate:
        confidence_score = max(0.0, round(1.0 - top_distance, 4))
        escalation_logger.log(
            question=question,
            top_distance=top_distance,
            confidence_score=confidence_score,
            answer=answer,
            distance_triggered=distance_too_far,
            llm_triggered=llm_uncertain,
        )

    return RAGResult(
        answer=answer,
        retrieved_chunks=chunks,
        should_escalate=should_escalate,
        top_distance=top_distance,
    )
