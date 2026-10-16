from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
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

router = APIRouter(prefix="/api/placement", tags=["Placement studio"])

PHOTO_TYPE = "placement_photo"
CHECK_TYPE = "placement_check"

ATTIRE = {
    "shirt": "a plain, neatly ironed formal shirt with a collar",
    "blazer": "a dark blazer over a plain collared shirt",
    "suit": "a dark business suit with a white shirt and a simple tie",
    "kurta": "a simple, formal kurta in a solid colour",
}
BACKGROUND = {
    "white": "a plain white",
    "grey": "a plain light grey",
    "blue": "a plain light blue",
}

PHOTO_INSTRUCTION = (
    "Turn this photo into a professional resume headshot. Show the same person wearing {attire}, "
    "in front of {background} studio background, with soft, even lighting. "
    "Centre the head and shoulders and face the camera. "
    "Keep the person's face, skin tone, hair and expression exactly the same and easy to recognise. "
    "Do not smooth, slim or change the face. The result must look like a real photograph."
)

CHECK_NAMES = ["Hair", "Facial hair and grooming", "Clothing", "Background", "Lighting", "Framing and posture"]

CHECK_PROMPT = """You are a friendly interview coach. Look at this photo of a person who is getting ready for a job interview or a resume photo.
Answer with JSON only, in exactly this shape:
{"photo_ok": true, "problem": "", "checks": [{"name": "Hair", "score": 0, "tip": ""}], "summary": ""}

Give one entry in "checks" for each of these names, in this order: Hair, Facial hair and grooming, Clothing, Background, Lighting, Framing and posture.
"score" is a whole number from 0 to 100 (higher is better). "tip" is one short, kind, practical sentence.
"summary" is two short sentences in simple English.
Set photo_ok to false and explain in "problem" (one short sentence) if no person is clearly visible.
Judge only grooming, clothes and photo quality. Never comment on looks, age, race, gender or body."""


@router.post("/photos", status_code=status.HTTP_201_CREATED)
@limiter.limit("6/minute")
def create_photo(
    request: Request,
    photo: UploadFile = File(...),
    attire: str = Form("shirt"),
    background: str = Form("grey"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if attire not in ATTIRE or background not in BACKGROUND:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Please choose a clothing and background option.")
    check_daily_limit(db, current_user, [PHOTO_TYPE, "trial_room"], settings.DAILY_IMAGE_LIMIT, "new pictures")

    source = clean_photo(read_upload(photo), max_side=1024)
    made = gemini.edit_image(
        source, PHOTO_INSTRUCTION.format(attire=ATTIRE[attire], background=BACKGROUND[background])
    )
    stored = store_image(db, current_user, clean_photo(made, max_side=1024, quality=88))
    scan = ScanHistory(
        user_id=current_user.id,
        scan_type=PHOTO_TYPE,
        image_public_id=stored.id,
        metrics={"attire": attire, "background": background},
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return item_out(scan)


@router.post("/check", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def check_photo(
    request: Request,
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Looks at the photo and gives interview grooming tips. The photo is not saved."""
    check_daily_limit(db, current_user, [CHECK_TYPE], settings.DAILY_CHECK_LIMIT, "interview checks")

    image = clean_photo(read_upload(photo), max_side=768, quality=82)
    result = gemini.analyse_photo(image, CHECK_PROMPT)

    if not result.get("photo_ok", False):
        problem = str(result.get("problem") or "").strip()[:200]
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            problem or "We could not see you clearly. Use a photo that shows your face and shoulders.",
        )

    given = {str(c.get("name", "")).strip().lower(): c for c in (result.get("checks") or []) if isinstance(c, dict)}
    checks = []
    for name in CHECK_NAMES:
        entry = given.get(name.lower(), {})
        try:
            score = max(0, min(100, round(float(entry.get("score", 0)))))
        except (TypeError, ValueError):
            score = 0
        checks.append({"name": name, "score": score, "tip": str(entry.get("tip") or "")[:200]})

    scan = ScanHistory(
        user_id=current_user.id,
        scan_type=CHECK_TYPE,
        metrics={
            "overall": round(sum(c["score"] for c in checks) / len(checks)),
            "checks": checks,
            "summary": str(result.get("summary") or "")[:400],
        },
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return item_out(scan)