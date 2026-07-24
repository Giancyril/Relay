from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.router import router as api_router

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="AI Customer Support Agent powered by FastAPI, ChromaDB, and Google Gemini."
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.app_name}",
        "docs_url": "/docs",
        "health_check": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
