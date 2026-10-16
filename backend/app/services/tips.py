"""One short style or skin tip per day. The AI writes it when a Groq key is set.
Otherwise a hand-written tip is used, so the box on the Home page is never empty."""

import hashlib
from datetime import datetime, timezone

from app.services import groq
from app.services.gemini import AiError

TOPICS = [
    "haircuts and hair care",
    "beard grooming",
    "daily skin care",
    "sunscreen and sun safety",
    "dressing well for an interview",
    "choosing glasses",
    "simple wardrobe basics",
    "sleep, water and healthy-looking skin",
    "looking confident in photos",
    "easy grooming habits",
]

FALLBACK_TIPS = [
    "Wear sunscreen every morning, even on cloudy days. It is the simplest skin habit that works.",
    "Book a trim every 4 to 6 weeks. A fresh edge makes any haircut look better.",
    "Wash your face twice a day, not more. Over-washing dries your skin out.",
    "Pick clothes that fit your shoulders well. Fit matters more than price.",
    "Drink water through the day. Your skin shows it before you feel thirsty.",
    "Before an interview, check your nails, collar and shoes. People notice the small things.",
    "Use a clean pillowcase often. It helps keep your skin clear.",
    "Stand near a window for photos. Soft daylight is kinder than any lamp.",
    "Keep a simple routine for 4 weeks before judging a new skin product.",
    "Comb or brush your beard daily. It keeps it neat and even.",
    "Choose glasses that are slightly different from your face shape for balance.",
    "Iron your shirt for a formal photo. Creases show more on camera than in a mirror.",
    "Sleep 7 to 8 hours when you can. It helps your skin and your mood.",
    "Use a little moisturiser after washing, even if your skin is oily.",
    "Keep two neutral shirts ready. They work for most interviews and meetings.",
]

_cache: dict[str, str] = {}


def _day_number() -> tuple[str, int]:
    today = datetime.now(timezone.utc).date().isoformat()
    seed = int(hashlib.sha256(today.encode()).hexdigest(), 16)
    return today, seed


def tip_for_today() -> dict:
    today, seed = _day_number()
    if today in _cache:
        return {"date": today, "tip": _cache[today], "by_ai": True}

    topic = TOPICS[seed % len(TOPICS)]
    try:
        tip = groq.chat(
            [
                {
                    "role": "system",
                    "content": (
                        "You write one short, friendly, practical tip in simple English. "
                        "Maximum 30 words. No lists, no hashtags, no emojis, no medical claims."
                    ),
                },
                {"role": "user", "content": f"Write today's tip about: {topic}."},
            ],
            max_tokens=80,
            temperature=0.9,
        )
        tip = tip.strip().strip('"')
        if tip:
            _cache.clear()
            _cache[today] = tip
            return {"date": today, "tip": tip, "by_ai": True}
    except AiError:
        pass

    return {"date": today, "tip": FALLBACK_TIPS[seed % len(FALLBACK_TIPS)], "by_ai": False}