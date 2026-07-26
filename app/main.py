from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse
from app.config import settings
from app.api.router import router as api_router
import os

# ---------------------------------------------------------------------------
# OpenAPI tag metadata — descriptions shown in the Swagger UI sidebar
# ---------------------------------------------------------------------------
openapi_tags = [
    {
        "name": "Health",
        "description": "Server liveness and dependency status checks (ChromaDB, Gemini API).",
    },
    {
        "name": "Chat",
        "description": (
            "Submit a natural-language customer support question. "
            "The agent retrieves relevant knowledge-base chunks, generates a grounded answer "
            "via Gemini, and returns an escalation flag when confidence is low."
        ),
    },
    {
        "name": "Ingestion",
        "description": (
            "Load and index product documentation or FAQ documents into ChromaDB. "
            "Supports custom document sets or the built-in sample FAQ dataset."
        ),
    },
    {
        "name": "Escalations",
        "description": (
            "Retrieve the log of unanswered or low-confidence queries. "
            "Use this to identify knowledge-base gaps and improve coverage over time."
        ),
    },
]

# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Relay Support AI",
    version="1.0.0",
    description=(
        "**Relay Support AI** is a Retrieval-Augmented Generation (RAG) customer support agent "
        "built on FastAPI, ChromaDB, and Google Gemini.\n\n"
        "It answers product questions by searching a vector knowledge base and generating "
        "grounded responses. Queries that fall outside the knowledge base are automatically "
        "flagged for human escalation and logged for review."
    ),
    openapi_tags=openapi_tags,
    swagger_ui_parameters={
        "docExpansion": "list",
        "syntaxHighlight.theme": "monokai",
        "tryItOutEnabled": True,
    },
    docs_url=None,   # disable default; we serve a custom-themed version below
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# Static files (Swagger CSS override, future frontend assets)
# ---------------------------------------------------------------------------
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# ---------------------------------------------------------------------------
# Custom Swagger UI — inject brand CSS override
# ---------------------------------------------------------------------------
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui():
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="Relay Support AI — API Reference",
        swagger_css_url="/static/swagger-theme.css",
        swagger_ui_parameters={
            "docExpansion": "list",
            "syntaxHighlight.theme": "monokai",
            "tryItOutEnabled": True,
        },
    )

# ---------------------------------------------------------------------------
# CORS — allow all origins so the React frontend (port 5173) can talk to the API
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# API Router
# ---------------------------------------------------------------------------
app.include_router(api_router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "Relay Support AI",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
