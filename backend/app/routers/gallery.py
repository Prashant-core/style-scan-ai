"""The gallery: pictures the user chose to save after editing them in the browser.

The editor, enhancer and portrait tools work entirely in the browser. A picture only comes here when
the person presses "Save to my gallery". It is private to them and can be deleted at any time.
"""

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.database import get_db
from app.dependencies import get_current_user
from app.models import ScanHistory, User
from app.services.history import item_out
from app.services.images import clean_edit, read_upload, store_image

router = APIRouter(prefix="/api/gallery", tags=["Gallery"])

SCAN_TYPE = "edit"
SOURCES = {"editor", "enhancer", "portrait"}


@router.post("", status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def save_to_gallery(
    request: Request,
    photo: UploadFile = File(...),
    source: str = Form("editor", max_length=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image = clean_edit(read_upload(photo))
    stored = store_image(db, current_user, image)
    scan = ScanHistory(
        user_id=current_user.id,
        scan_type=SCAN_TYPE,
        image_public_id=stored.id,
        metrics={"source": source if source in SOURCES else "editor", "bytes": len(image)},
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return item_out(scan)