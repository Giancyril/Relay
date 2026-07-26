from typing import List, Optional
from pydantic import BaseModel, Field


# Chat Schemas
class ChatRequest(BaseModel):
    question: str = Field(
        ...,
        description="Customer support question",
        json_schema_extra={"example": "What is your return policy?"}
    )
    session_id: Optional[str] = Field(
        None,
        description="Optional session ID for memory in future versions",
        json_schema_extra={"example": "sess-12345"}
    )


class RetrievedSource(BaseModel):
    doc_id: str
    snippet: str
    distance: float


class ChatResponse(BaseModel):
    answer: str
    escalated: bool
    confidence_score: float
    sources: List[RetrievedSource] = []
    session_id: Optional[str] = None


# Ingestion Schemas
class DocumentInput(BaseModel):
    doc_id: str = Field(..., json_schema_extra={"example": "faq_returns_01"})
    title: str = Field(..., json_schema_extra={"example": "Return Policy"})
    content: str = Field(
        ...,
        json_schema_extra={"example": "Products can be returned within 30 days of purchase for a full refund."}
    )


class IngestRequest(BaseModel):
    documents: List[DocumentInput]
    reset_collection: bool = Field(False, description="If true, clears existing vector DB before ingestion")


class IngestResponse(BaseModel):
    status: str
    chunks_ingested: int
    total_documents: int


# Health Check Schema
class HealthResponse(BaseModel):
    status: str
    environment: str
    chromadb_status: str
    chromadb_doc_count: int
    gemini_api_configured: bool


# Analytics Schemas
class TopSourceCount(BaseModel):
    source: str
    count: int


class AnalyticsSummaryResponse(BaseModel):
    total_escalations: int
    distance_triggered_count: int
    llm_triggered_count: int
    avg_confidence_score: float
    top_escalated_sources: List[TopSourceCount] = []


# KB Document Management Schemas
class DocumentSummary(BaseModel):
    doc_id: str
    title: str
    chunk_count: int
    snippet: str


class DocumentListResponse(BaseModel):
    total_documents: int
    total_chunks: int
    documents: List[DocumentSummary]

