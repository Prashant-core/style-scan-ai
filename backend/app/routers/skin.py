from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.limiter import limiter
from app.database import get_db
from app.dependencies import get_current_user
from app.models import ScanHistory, User
from app.services import gemini
from app.services.history import item_out
from app.services.images import clean_photo, read_upload, store_image
from app.services.limits import check_daily_limit

router = APIRouter(prefix="/api/skin", tags=["Skin tracker"])

SCAN_TYPE = "skin_scan"
SCORES = ["clarity", "evenness", "smoothness", "calm", "glow"]

PROMPT = """You are a careful, kind skin-care helper. Look at the skin of the face in this photo.
Answer with JSON only, in exactly this shape:
{"photo_ok": true, "problem": "", "clarity": 0, "evenness": 0, "smoothness": 0, "calm": 0, "glow": 0,
 "summary": "", "tips": ["", "", ""]}

Scores are whole numbers from 0 to 100. Higher is better.
- clarity: few spots, marks or blemishes
- evenness: even skin tone
- smoothness: smooth texture, small pores
- calm: little redness or irritation
- glow: a healthy, fresh look

Set photo_ok to false and explain in "problem" (one short sentence) if no face is clearly visible,
or if the photo is too dark, too blurry or too far away. Then use 0 for all scores.
"summary" is two short sentences in simple English. "tips" are three short, safe, everyday habits.
Never diagnose a medical condition. Do not guess age, race or gender."""


def _score(value) -> int:
    try:
        return max(0, min(100, round(float(value))))
    except (TypeError, ValueError):
        return 0


@router.post("/scans", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def create_skin_scan(
    request: Request,
    photo: UploadFile = File(...),
    note: str = Form("", max_length=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_daily_limit(db, current_user, [SCAN_TYPE], settings.DAILY_CHECK_LIMIT, "skin scans")

    image = clean_photo(read_upload(photo), max_side=768, quality=82)
    result = gemini.analyse_photo(image, PROMPT)

    if not result.get("photo_ok", False):
        problem = str(result.get("problem") or "").strip()[:200]
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            problem or "We could not see your skin clearly. Use a bright, close photo of your face.",
        )

    scores = {name: _score(result.get(name)) for name in SCORES}
    tips = [str(t)[:160] for t in (result.get("tips") or []) if str(t).strip()][:3]

    stored = store_image(db, current_user, clean_photo(image, max_side=512, quality=78))
    scan = ScanHistory(
        user_id=current_user.id,
        scan_type=SCAN_TYPE,
        image_public_id=stored.id,
        metrics={
            **scores,
            "overall": round(sum(scores.values()) / len(scores)),
            "summary": str(result.get("summary") or "")[:400],
            "tips": tips,
            "note": note.strip(),
        },
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return item_out(scan)


@router.get("/scans")
def list_skin_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Newest last, so a graph can read it from left to right."""
    scans = db.scalars(
        select(ScanHistory)
        .where(ScanHistory.user_id == current_user.id, ScanHistory.scan_type == SCAN_TYPE)
        .order_by(ScanHistory.created_at.desc())
        .limit(90)
    ).all()
    return [item_out(scan) for scan in reversed(scans)]