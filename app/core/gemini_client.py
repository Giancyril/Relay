"""
Gemini LLM client for generating grounded answers.

Uses the `google-genai` SDK (google.genai) — the same SDK already used by
the EmbeddingService — so no additional packages are required.

Falls back to a deterministic mock response when GEMINI_API_KEY is
set to "mock_key_for_dev", enabling fully offline development.
"""

from __future__ import annotations

from app.config import settings

_MOCK_RESPONSE = (
    "[MOCK LLM] Based on the provided context, I can answer your question. "
    "Please set a real GEMINI_API_KEY in your .env file to get actual AI responses."
)


def generate_answer(prompt: str) -> str:
    """
    Send a prompt to the Gemini LLM and return its text response.

    Args:
        prompt: Fully-constructed RAG prompt (system instruction + context + question).

    Returns:
        The model's text response as a plain string.

    Raises:
        RuntimeError: If the Gemini API call fails.
    """
    is_mock = (
        not settings.gemini_api_key
        or settings.gemini_api_key == "mock_key_for_dev"
    )

    if is_mock:
        return _MOCK_RESPONSE

    try:
        from google import genai  # imported lazily so mock mode has no dependency

        client = genai.Client(api_key=settings.gemini_api_key)
        response = client.models.generate_content(
            model=settings.gemini_model_name,
            contents=prompt,
        )
        # The response object exposes a .text shortcut
        return response.text.strip()
    except Exception as exc:
        raise RuntimeError(f"Gemini API call failed: {exc}") from exc
