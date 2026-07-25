import logging

from fastapi import APIRouter, HTTPException, status

from app.api.schemas import (
    ChatRequest, ChatResponse, RetrievedSource,
    IngestRequest, IngestResponse,
    HealthResponse
)
from app.config import settings
from app.core.chromadb_client import ChromaDBClient
from app.services.ingestion_service import ingestion_service
from app.services.rag_service import query_rag

logger = logging.getLogger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """System health check — reports ChromaDB connectivity and document count."""
    chroma_status = "disconnected"
    doc_count = 0
    try:
        ChromaDBClient().client  # ensure client is alive
        col = ChromaDBClient().get_or_create_collection()
        doc_count = col.count()
        chroma_status = "connected"
    except Exception as exc:
        chroma_status = f"error: {exc}"

    gemini_configured = bool(
        settings.gemini_api_key and settings.gemini_api_key != "mock_key_for_dev"
    )

    return HealthResponse(
        status="healthy",
        environment=settings.environment,
        chromadb_status=chroma_status,
        chromadb_doc_count=doc_count,
        gemini_api_configured=gemini_configured,
    )


# ---------------------------------------------------------------------------
# Chat  (Step 3: RAG pipeline wired in)
# ---------------------------------------------------------------------------

@router.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_endpoint(request: ChatRequest):
    """
    Answer a customer support question using RAG.

    - Embeds the question and retrieves the top-k most relevant knowledge-base chunks.
    - Passes context + question to the Gemini LLM for a grounded answer.
    - Returns an escalation flag when the agent isn't confident.
    """
    if not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Question must not be empty.",
        )

    try:
        result = query_rag(request.question)
    except Exception as exc:
        logger.exception("RAG pipeline error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG pipeline error: {exc}",
        )

    # Map top_distance → confidence score (0 = bad, 1 = perfect cosine match)
    confidence = max(0.0, round(1.0 - result.top_distance, 4))

    sources = [
        RetrievedSource(
            doc_id=chunk.source,
            snippet=chunk.text[:200],  # return first 200 chars as preview
            distance=round(chunk.distance, 4),
        )
        for chunk in result.retrieved_chunks
    ]

    return ChatResponse(
        answer=result.answer,
        escalated=result.should_escalate,
        confidence_score=confidence,
        sources=sources,
        session_id=request.session_id,
    )


# ---------------------------------------------------------------------------
# Ingestion
# ---------------------------------------------------------------------------

@router.post("/ingest", response_model=IngestResponse, tags=["Ingestion"])
async def ingest_endpoint(request: IngestRequest):
    """
    Ingest product knowledge-base documents into ChromaDB.

    If `documents` is empty, automatically loads sample FAQs from
    `data/sample_faqs.json`.
    """
    try:
        chunks_count, doc_count = ingestion_service.ingest_documents(
            documents=request.documents,
            reset_collection=request.reset_collection,
        )
        return IngestResponse(
            status="success",
            chunks_ingested=chunks_count,
            total_documents=doc_count,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingestion failed: {exc}",
        )
