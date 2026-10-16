from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import StoredImage, User

router = APIRouter(prefix="/api/images", tags=["Photos"])


@router.get("/{image_id}")
def get_image(
    image_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sends a photo back only to the person who owns it."""
    image = db.get(StoredImage, image_id)
    if image is None or image.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Photo not found.")
    return Response(content=image.data, media_type=image.content_type)