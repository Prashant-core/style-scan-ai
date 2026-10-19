from fastapi import APIRouter, Depends, File, Form, Request, UploadFile, status
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

router = APIRouter(prefix="/api/trial", tags=["Trial room"])

SCAN_TYPE = "trial_room"

INSTRUCTION = (
    "Edit this photo. Show the same person with this change: {request}\n"
    "Rules: keep the person's face, skin tone, body shape, pose and the background exactly the same. "
    "Change only what was asked. The result must look like a real, natural photo. "
    "Keep it family-friendly: ordinary, fully covered clothing only."
)


@router.post("/looks", status_code=status.HTTP_201_CREATED)
@limiter.limit("6/minute")
def create_look(
    request: Request,
    photo: UploadFile = File(...),
    prompt: str = Form(..., min_length=3, max_length=150),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_daily_limit(db, current_user, [SCAN_TYPE], settings.DAILY_IMAGE_LIMIT, "new pictures")

    request_text = " ".join(prompt.split())
    source = clean_photo(read_upload(photo), max_side=1024)
    made = gemini.edit_image(source, INSTRUCTION.format(request=request_text))
    result = clean_photo(made, max_side=1024, quality=85)

    stored = store_image(db, current_user, result)
    scan = ScanHistory(
        user_id=current_user.id,
        scan_type=SCAN_TYPE,
        image_public_id=stored.id,
        metrics={"prompt": request_text},
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return item_out(scan)