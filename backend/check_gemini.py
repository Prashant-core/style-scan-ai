"""Tests your Gemini key and models, and prints exactly what Google answers.

Run it from the "backend" folder, with the virtual environment on:
    python check_gemini.py

It never prints your key. It only sends tiny test requests.
"""

import base64
import io
import json

import httpx
from PIL import Image

from app.core.config import settings

BASE = "https://generativelanguage.googleapis.com/v1beta"
HEADERS = {"x-goog-api-key": settings.GEMINI_API_KEY}


def reason(response):
    try:
        return response.json()["error"]["message"]
    except Exception:
        return response.text[:300]


def send(method, path, **kwargs):
    try:
        return httpx.request(method, f"{BASE}{path}", headers=HEADERS, timeout=90, **kwargs)
    except httpx.HTTPError as error:
        print(f"   FAILED: could not reach Google ({type(error).__name__}). Check your internet connection.")
        return None


def tiny_photo():
    image = Image.new("RGB", (96, 96), (200, 160, 140))
    buffer = io.BytesIO()
    image.save(buffer, "JPEG")
    return {"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(buffer.getvalue()).decode()}}


def generate(model, parts, config):
    return send("POST", f"/models/{model}:generateContent", json={"contents": [{"parts": parts}], "generationConfig": config})


def report(response, show_answer=False):
    if response is None:
        return False
    if response.status_code == 200:
        print("   OK")
        if show_answer:
            print("   Answer:", json.dumps(response.json().get("candidates", [{}])[0].get("content", {}))[:200])
        return True
    print(f"   FAILED ({response.status_code}): {reason(response)}")
    return False


print("1. Key")
if not settings.GEMINI_API_KEY:
    print("   FAILED: GEMINI_API_KEY is empty in backend/.env (restart the server after changing .env).")
    raise SystemExit(1)
print(f"   A key is set (starts with {settings.GEMINI_API_KEY[:4]}..., {len(settings.GEMINI_API_KEY)} characters).")

print("2. Models your key can use")
response = send("GET", "/models?pageSize=200")
if report(response):
    names = [
        m["name"].removeprefix("models/")
        for m in response.json().get("models", [])
        if "generateContent" in m.get("supportedGenerationMethods", [])
    ]
    for name in sorted(names):
        if "flash" in name or "image" in name:
            print("   -", name)

print(f"3. Text model  ({settings.GEMINI_TEXT_MODEL}) answering JSON")
ok_text = report(
    generate(settings.GEMINI_TEXT_MODEL, [{"text": 'Reply with JSON: {"ok": true}'}], {"responseMimeType": "application/json"}),
    show_answer=True,
)

print(f"4. Text model ({settings.GEMINI_TEXT_MODEL}) looking at a photo  <- the Skin tracker uses this")
ok_vision = report(
    generate(
        settings.GEMINI_TEXT_MODEL,
        [{"text": 'What colour is this? Reply with JSON: {"colour": "..."}'}, tiny_photo()],
        {"responseMimeType": "application/json"},
    ),
    show_answer=True,
)

print(f"5. Image model ({settings.GEMINI_IMAGE_MODEL}) editing a photo  <- the Trial room uses this")
ok_image = report(
    generate(
        settings.GEMINI_IMAGE_MODEL,
        [{"text": "Make this picture slightly brighter."}, tiny_photo()],
        {"responseModalities": ["TEXT", "IMAGE"]},
    )
)

print()
if ok_text and ok_vision and ok_image:
    print("Everything works.")
else:
    print("Read the FAILED lines above. Common causes:")
    print(" - 'API key not valid' / 'leaked': make a new key at https://aistudio.google.com/apikey and put it in backend/.env")
    print(" - 'limit: 0' or 'quota' on the image model: that model has no free tier. It needs billing on your Google account.")
    print(" - 'not found': copy a model name from the list in step 2 into GEMINI_TEXT_MODEL or GEMINI_IMAGE_MODEL.")