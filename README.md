# AI Customer Support Agent

An end-to-end AI-powered Customer Support Agent built with **FastAPI**, **Google Gemini API**, and **ChromaDB**.

The agent uses Retrieval-Augmented Generation (RAG) to answer product questions accurately based strictly on company knowledge base documents. When the agent is uncertain or the query is out of scope, it automatically flags the response for human escalation and logs the query.

---

## 🎯 Architecture Overview

```
User Question
    │
    ▼
FastAPI Router (/chat)
    │
    ├── 1. Embed question (Google Gemini text-embedding-004)
    │
    ├── 2. Vector Search (ChromaDB - Cosine Similarity Top-K)
    │
    ├── 3. Build Grounded System Prompt with retrieved context
    │
    ├── 4. Generate Response (Google Gemini LLM)
    │
    └── 5. Hybrid Confidence & Escalation Evaluation
            ├── Distance Threshold Check (> 0.50 triggers escalation)
            └── LLM Uncertainty Phrase Check ("I don't have enough information...")
            │
            ├── IF ESCALATED: Log record to escalations.jsonl
            └── RETURN ChatResponse (answer, confidence_score, escalated, sources)
```

---

## 📁 Project Structure

```
AI Customer Support/
├── app/
│   ├── api/
│   │   ├── router.py               # REST API Endpoints (/health, /chat, /ingest, /escalations)
│   │   └── schemas.py              # Pydantic DTO Schemas
│   ├── core/
│   │   ├── chromadb_client.py      # Persistent ChromaDB Singleton
│   │   ├── embeddings.py           # Gemini text-embedding-004 + SHA256 fallback
│   │   └── gemini_client.py        # Gemini LLM Client (google-genai)
│   ├── services/
│   │   ├── ingestion_service.py    # Document chunking & vector indexing
│   │   ├── rag_service.py          # Full RAG pipeline (Retrieval + Prompting + LLM)
│   │   └── escalation_logger.py    # JSONL logger for unanswered / low-confidence queries
│   ├── utils/
│   │   └── text_splitter.py        # Recursive text chunking utility
│   ├── config.py                   # Pydantic BaseSettings config loader
│   └── main.py                     # FastAPI App Entry Point
├── data/
│   └── sample_faqs.json            # Default knowledge base FAQ documents
├── tests/
│   ├── conftest.py                 # Shared pytest fixtures (in-memory ChromaDB client)
│   ├── test_api.py                 # Endpoint integration tests
│   ├── test_embeddings.py          # Embedding service unit tests
│   ├── test_escalation_logger.py   # JSONL logger unit tests
│   ├── test_rag_service.py         # RAG pipeline unit tests
│   └── test_text_splitter.py       # Chunking utility unit tests
├── .env                            # Environment variables (GEMINI_API_KEY)
├── requirements.txt                # Python dependencies
└── README.md                       # Project documentation
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.10+
- Google Gemini API Key (optional for dev/testing mode)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Giancyril/AI-Customer-Support-Agent.git
cd AI-Customer-Support-Agent

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
ENVIRONMENT="development"
DEBUG=True
HOST="0.0.0.0"
PORT=8000
RETRIEVAL_TOP_K=3
ESCALATION_DISTANCE_THRESHOLD=0.50
```

*(Note: If `GEMINI_API_KEY` is omitted or set to `mock_key_for_dev`, the system automatically runs in offline mock mode).*

### 4. Run the API Server
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API docs are available at `http://localhost:8000/docs`.

---

## 🚀 API Endpoint Reference

### `GET /health`
Checks server health, ChromaDB connection, document count, and Gemini API setup.

### `POST /ingest`
Ingests knowledge base documents into ChromaDB.
- **Request Body**:
```json
{
  "documents": [],
  "reset_collection": false
}
```
*(Passing an empty `documents` array automatically ingests sample FAQs from `data/sample_faqs.json`).*

### `POST /chat`
Submits a customer support question to the RAG pipeline.
- **Request Body**:
```json
{
  "question": "What is your return policy?",
  "session_id": "sess-12345"
}
```
- **Response**:
```json
{
  "answer": "Our return policy allows returns within 30 days of purchase for a full refund.",
  "escalated": false,
  "confidence_score": 0.85,
  "sources": [
    {
      "doc_id": "faq_returns_01",
      "snippet": "Our return policy allows customers to return any unused, unopened product...",
      "distance": 0.15
    }
  ],
  "session_id": "sess-12345"
}
```

### `GET /escalations`
Retrieves logged low-confidence or unanswerable queries.
- **Query Params**: `limit` (default: 50)

---

## 🧪 Running Automated Tests

Run the full pytest suite:
```bash
python -m pytest tests/ -v
```

---

## 🛠 Tech Stack
- **Backend Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Vector Database**: [ChromaDB](https://www.trychroma.com/)
- **LLM & Embeddings**: [Google Gemini API (`google-genai`)](https://github.com/googleapis/python-genai)
- **Testing**: Pytest, FastAPI TestClient, Asyncio
