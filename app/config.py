import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env file."""

    app_name: str = "AI Customer Support Agent"
    environment: str = "development"
    debug: bool = True

    # Gemini Config
    gemini_api_key: str = "mock_key_for_dev"
    gemini_model_name: str = "gemini-1.5-flash"

    # ChromaDB Config
    chromadb_persist_dir: str = "./chroma_db"
    chromadb_collection_name: str = "customer_support_kb"

    # Retrieval Config
    retrieval_top_k: int = 3
    escalation_distance_threshold: float = 0.50

    # Legacy aliases (kept for backward compatibility)
    similarity_distance_threshold: float = 0.50
    max_retrieval_results: int = 3

    # Server Config
    host: str = "0.0.0.0"
    port: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
