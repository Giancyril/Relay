from fastapi import APIRouter, HTTPException, status
from app.api.schemas import (
    ChatRequest, ChatResponse,
    IngestRequest, IngestResponse,
    HealthResponse
)
from app.config import settings
from app.core.chromadb_client import ChromaDBClient

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """System health check endpoint."""
    chroma_status = "disconnected"
    doc_count = 0
    try:
        client = ChromaDBClient().client
        col = ChromaDBClient().get_or_create_collection()
        doc_count = col.count()
        chroma_status = "connected"
    except Exception as e:
        chroma_status = f"error: {str(e)}"

    gemini_configured = bool(settings.gemini_api_key and settings.gemini_api_key != "mock_key_for_dev")

    return HealthResponse(
        status="healthy",
        environment=settings.environment,
        chromadb_status=chroma_status,
        chromadb_doc_count=doc_count,
        gemini_api_configured=gemini_configured
    )


@router.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_endpoint(request: ChatRequest):
    """Placeholder chat endpoint - RAG & Escalation logic will be connected in Steps 3 & 4."""
    return ChatResponse(
        answer="Hello! Customer support AI agent scaffolding is active. RAG pipeline arriving in Step 3.",
        escalated=False,
        confidence_score=1.0,
        sources=[],
        session_id=request.session_id
    )


@router.post("/ingest", response_model=IngestResponse, tags=["Ingestion"])
async def ingest_endpoint(request: IngestRequest):
    """Placeholder ingest endpoint - Ingestion pipeline will be connected in Step 2."""
    return IngestResponse(
        status="success",
        chunks_ingested=len(request.documents),
        total_documents=len(request.documents)
    )
