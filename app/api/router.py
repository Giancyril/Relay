import json
import logging
import os

from fastapi import APIRouter, HTTPException, status

from app.api.schemas import (
    ChatRequest, ChatResponse, RetrievedSource,
    IngestRequest, IngestResponse,
    HealthResponse, AnalyticsSummaryResponse, TopSourceCount,
    DocumentSummary, DocumentListResponse,
    FeedbackRequest, FeedbackSummaryResponse
)
from app.config import settings
from app.core.chromadb_client import ChromaDBClient
from app.services.ingestion_service import ingestion_service
from app.services.rag_service import query_rag
from app.services.escalation_logger import escalation_logger
from app.services.feedback_logger import feedback_logger
from app.services.memory_store import memory_store

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
    Answer a customer support question using RAG with session conversation memory.

    - Loads recent conversation history for session_id if provided.
    - Embeds the question and retrieves top-k knowledge-base chunks.
    - Passes context + conversation history + question to Gemini LLM.
    - Appends turn to session memory store.
    - Returns answer and escalation flag.
    """
    if not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Question must not be empty.",
        )

    session_id = request.session_id

    # Retrieve history if session_id present
    history = memory_store.get_history(session_id) if session_id else []

    try:
        result = query_rag(request.question, history=history)
    except Exception as exc:
        logger.exception("RAG pipeline error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG pipeline error: {exc}",
        )

    # Append question and answer to session memory
    if session_id:
        memory_store.append_turn(session_id, role="user", text=request.question)
        memory_store.append_turn(session_id, role="assistant", text=result.answer)

    sources = [
        RetrievedSource(doc_id=c.source, snippet=c.text, distance=c.distance)
        for c in result.retrieved_chunks
    ]

    confidence_score = max(0.0, round(1.0 - result.top_distance, 4))

    return ChatResponse(
        answer=result.answer,
        escalated=result.should_escalate,
        confidence_score=confidence_score,
        sources=sources,
        session_id=session_id,
        sentiment=result.sentiment,
        urgency=result.urgency,
    )


@router.delete("/chat/history/{session_id}", tags=["Chat"])
async def clear_chat_history(session_id: str):
    """
    Clear conversation memory for the given session ID.
    """
    memory_store.clear_session(session_id)
    return {"status": "success", "session_id": session_id, "message": "History cleared."}



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


@router.get("/documents", response_model=DocumentListResponse, tags=["Ingestion"])
async def list_documents():
    """
    Return a summary list of all unique documents currently indexed in ChromaDB.
    """
    try:
        col = ChromaDBClient().get_or_create_collection()
        total_chunks = col.count()
        if total_chunks == 0:
            return DocumentListResponse(total_documents=0, total_chunks=0, documents=[])

        all_data = col.get(include=["metadatas", "documents"])
        metadatas = all_data.get("metadatas", [])
        documents = all_data.get("documents", [])

        # Group by doc_id
        grouped: dict[str, dict] = {}
        for meta, doc_text in zip(metadatas, documents):
            if not meta:
                continue
            doc_id = meta.get("doc_id") or meta.get("source", "unknown")
            title = meta.get("title", doc_id)

            if doc_id not in grouped:
                grouped[doc_id] = {
                    "doc_id": doc_id,
                    "title": title,
                    "chunk_count": 0,
                    "snippet": doc_text[:150] + "..." if len(doc_text) > 150 else doc_text,
                }
            grouped[doc_id]["chunk_count"] += 1

        doc_summaries = [DocumentSummary(**v) for v in grouped.values()]
        return DocumentListResponse(
            total_documents=len(doc_summaries),
            total_chunks=total_chunks,
            documents=doc_summaries,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list documents: {exc}",
        )


@router.delete("/documents/{doc_id}", tags=["Ingestion"])
async def delete_document(doc_id: str):
    """
    Delete all vector chunks belonging to the specified doc_id from ChromaDB.
    """
    try:
        col = ChromaDBClient().get_or_create_collection()
        # Find all chunk IDs matching doc_id metadata
        matched = col.get(where={"doc_id": doc_id}, include=[])
        chunk_ids = matched.get("ids", [])

        if not chunk_ids:
            # Try fallback query with 'source' metadata
            matched = col.get(where={"source": doc_id}, include=[])
            chunk_ids = matched.get("ids", [])

        if not chunk_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with doc_id '{doc_id}' not found.",
            )

        col.delete(ids=chunk_ids)
        return {
            "status": "success",
            "doc_id": doc_id,
            "deleted_chunks": len(chunk_ids),
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {exc}",
        )



# ---------------------------------------------------------------------------
# Escalations & Analytics  (Step 4 + Step 7: inspect & analyze escalation log)
# ---------------------------------------------------------------------------

@router.get("/escalations", tags=["Escalations"])
async def list_escalations(
    limit: int = 50,
    search: str | None = None,
    trigger_type: str | None = None,
):
    """
    Return the most recent escalated queries from the escalation log with optional filtering.

    Args:
        limit: Max number of records to return (newest first). Default 50.
        search: Optional search substring to filter questions.
        trigger_type: Filter by 'distance' (high vector distance) or 'llm' (LLM uncertainty phrase).
    """
    log_path = escalation_logger._log_path

    if not os.path.exists(log_path):
        return {"total": 0, "records": []}

    try:
        with open(log_path, "r", encoding="utf-8") as fh:
            lines = [ln.strip() for ln in fh if ln.strip()]

        records = [json.loads(line) for line in lines]
        records.reverse()  # newest first

        # Apply search filter
        if search:
            q_lower = search.lower()
            records = [r for r in records if q_lower in r.get("question", "").lower()]

        # Apply trigger_type filter
        if trigger_type == "distance":
            records = [r for r in records if r.get("distance_triggered")]
        elif trigger_type == "llm":
            records = [r for r in records if r.get("llm_triggered")]

        return {"total": len(records), "records": records[:limit]}

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read escalation log: {exc}",
        )


@router.get("/analytics/summary", response_model=AnalyticsSummaryResponse, tags=["Escalations"])
async def analytics_summary():
    """
    Return aggregated analytics summary metrics across all logged escalations.
    """
    log_path = escalation_logger._log_path

    if not os.path.exists(log_path):
        return AnalyticsSummaryResponse(
            total_escalations=0,
            distance_triggered_count=0,
            llm_triggered_count=0,
            avg_confidence_score=0.0,
            top_escalated_sources=[],
        )

    try:
        with open(log_path, "r", encoding="utf-8") as fh:
            lines = [ln.strip() for ln in fh if ln.strip()]

        records = [json.loads(line) for line in lines]
        if not records:
            return AnalyticsSummaryResponse(
                total_escalations=0,
                distance_triggered_count=0,
                llm_triggered_count=0,
                avg_confidence_score=0.0,
                top_escalated_sources=[],
            )

        total = len(records)
        dist_count = sum(1 for r in records if r.get("distance_triggered"))
        llm_count = sum(1 for r in records if r.get("llm_triggered"))
        avg_conf = round(sum(r.get("confidence_score", 0.0) for r in records) / total, 4)

        return AnalyticsSummaryResponse(
            total_escalations=total,
            distance_triggered_count=dist_count,
            llm_triggered_count=llm_count,
            avg_confidence_score=avg_conf,
            top_escalated_sources=[],
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compute analytics summary: {exc}",
        )


# ---------------------------------------------------------------------------
# User Feedback  (Step 8: ratings & CSAT reporting)
# ---------------------------------------------------------------------------

@router.post("/feedback", tags=["Feedback"])
async def submit_feedback(request: FeedbackRequest):
    """
    Submit user feedback (thumbs up / thumbs down + optional comment) for an answer.
    """
    if request.rating not in ("up", "down"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Rating must be 'up' or 'down'.",
        )

    try:
        record = feedback_logger.log(
            rating=request.rating,
            question=request.question,
            answer=request.answer,
            comment=request.comment,
            session_id=request.session_id,
        )
        return {"status": "success", "message": "Feedback submitted successfully.", "record": record}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log feedback: {exc}",
        )


@router.get("/feedback", response_model=FeedbackSummaryResponse, tags=["Feedback"])
async def get_feedback_summary(limit: int = 50):
    """
    Retrieve logged feedback and CSAT metrics summary.
    """
    log_path = feedback_logger._log_path

    if not os.path.exists(log_path):
        return FeedbackSummaryResponse(
            total_feedback=0,
            positive_count=0,
            negative_count=0,
            csat_score=100.0,
            records=[],
        )

    try:
        with open(log_path, "r", encoding="utf-8") as fh:
            lines = [ln.strip() for ln in fh if ln.strip()]

        records = [json.loads(line) for line in lines]
        if not records:
            return FeedbackSummaryResponse(
                total_feedback=0,
                positive_count=0,
                negative_count=0,
                csat_score=100.0,
                records=[],
            )

        total = len(records)
        pos = sum(1 for r in records if r.get("rating") == "up")
        neg = sum(1 for r in records if r.get("rating") == "down")
        csat = round((pos / total) * 100, 1) if total > 0 else 100.0

        records.reverse()  # newest first
        return FeedbackSummaryResponse(
            total_feedback=total,
            positive_count=pos,
            negative_count=neg,
            csat_score=csat,
            records=records[:limit],
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read feedback log: {exc}",
        )


