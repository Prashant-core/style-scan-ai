"""Talks to Groq (free key). Used for the chat assistant and the daily tip."""

import httpx

from app.core.config import settings
from app.services.gemini import AiError

URL = "https://api.groq.com/openai/v1/chat/completions"


def chat(messages: list[dict], max_tokens: int = 500, temperature: float = 0.6) -> str:
    if not settings.GROQ_API_KEY:
        raise AiError("The assistant is not switched on yet. The site owner needs to add a Groq key.", 503)

    try:
        response = httpx.post(
            URL,
            headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
            json={
                "model": settings.GROQ_MODEL,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            },
            timeout=httpx.Timeout(45.0),
        )
    except httpx.HTTPError:
        raise AiError("The assistant did not answer. Please try again in a moment.", 504)

    if response.status_code == 429:
        raise AiError("The assistant is busy right now. Please try again in a minute.", 429)
    if response.status_code >= 400:
        raise AiError("The assistant could not answer. Please try again later.", 502)

    try:
        return response.json()["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, ValueError):
        raise AiError("The assistant answer could not be read. Please try again.", 502)