"""Talks to Google Gemini (free key). Used for pictures and for looking at photos."""

import base64
import json

import httpx

from app.core.config import settings

BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"


class AiError(Exception):
    """A problem with an AI service. The message is safe to show to the user."""

    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def _call(model: str, parts: list[dict], generation_config: dict) -> dict:
    if not settings.GEMINI_API_KEY:
        raise AiError("This feature is not switched on yet. The site owner needs to add a Gemini key.", 503)

    try:
        response = httpx.post(
            f"{BASE_URL}/{model}:generateContent",
            headers={"x-goog-api-key": settings.GEMINI_API_KEY},
            json={"contents": [{"parts": parts}], "generationConfig": generation_config},
            timeout=httpx.Timeout(90.0),
        )
    except httpx.HTTPError:
        raise AiError("The AI service did not answer. Please try again in a moment.", 504)

    if response.status_code == 429:
        raise AiError("The AI service is busy, or its free limit is used up. Please try again later.", 429)
    if response.status_code in (401, 403):
        raise AiError("The AI service refused the request. The site owner should check the Gemini key.", 502)
    if response.status_code == 404:
        raise AiError("The AI model name is wrong or no longer available. The site owner should check it.", 502)
    if response.status_code >= 400:
        raise AiError("The AI service could not handle this request. Try a different photo or text.", 502)

    data = response.json()
    block = (data.get("promptFeedback") or {}).get("blockReason")
    if block:
        raise AiError("This photo or request was blocked by the AI safety rules. Try a different one.", 422)
    return data


def _parts(data: dict) -> list[dict]:
    candidates = data.get("candidates") or []
    if not candidates:
        raise AiError("The AI did not return anything. Please try again.", 502)
    return (candidates[0].get("content") or {}).get("parts") or []


def _image_part(image: bytes) -> dict:
    return {"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(image).decode()}}


def edit_image(image: bytes, instruction: str) -> bytes:
    """Gives the AI a photo and a request, and returns the new picture."""
    data = _call(
        settings.GEMINI_IMAGE_MODEL,
        [{"text": instruction}, _image_part(image)],
        {"responseModalities": ["TEXT", "IMAGE"]},
    )
    parts = _parts(data)
    for part in parts:
        blob = part.get("inlineData") or part.get("inline_data")
        if blob and blob.get("data"):
            return base64.b64decode(blob["data"])

    said = " ".join(part.get("text", "") for part in parts).strip()
    raise AiError(
        (said[:200] if said else "The AI could not make this picture. Try a different photo or description."),
        422,
    )


def analyse_photo(image: bytes, prompt: str) -> dict:
    """Asks the AI to look at a photo and answer with JSON."""
    data = _call(
        settings.GEMINI_TEXT_MODEL,
        [{"text": prompt}, _image_part(image)],
        {"responseMimeType": "application/json", "temperature": 0.2},
    )
    text = "".join(part.get("text", "") for part in _parts(data)).strip()
    if text.startswith("```"):
        text = text.strip("`").removeprefix("json").strip()
    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        raise AiError("The AI answer could not be read. Please try again.", 502)
    if not isinstance(result, dict):
        raise AiError("The AI answer could not be read. Please try again.", 502)
    return result