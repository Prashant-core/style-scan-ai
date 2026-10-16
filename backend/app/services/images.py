"""Safe handling of photos: check them, clean them, and keep them private."""

import io

from fastapi import HTTPException, UploadFile, status
from PIL import Image, ImageOps, UnidentifiedImageError
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import ScanHistory, StoredImage, User

Image.MAX_IMAGE_PIXELS = 40_000_000  # refuses "decompression bomb" files
MAX_UPLOAD_BYTES = 8 * 1024 * 1024
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}


def read_upload(file: UploadFile) -> bytes:
    """Reads an uploaded file, but never more than the size limit."""
    data = file.file.read(MAX_UPLOAD_BYTES + 1)
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No photo was received.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "This photo is too large (8 MB maximum).")
    return data


def clean_photo(data: bytes, max_side: int = 1024, quality: int = 85) -> bytes:
    """Checks that the file really is a photo, fixes its rotation, shrinks it and saves it
    again as a plain JPEG. This also removes hidden data such as the location in the photo."""
    try:
        image = Image.open(io.BytesIO(data))
        if image.format not in ALLOWED_FORMATS:
            raise ValueError("format")
        image = ImageOps.exif_transpose(image).convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Please upload a JPG, PNG or WebP photo.")

    image.thumbnail((max_side, max_side))
    out = io.BytesIO()
    image.save(out, "JPEG", quality=quality, optimize=True)
    return out.getvalue()


def store_image(db: Session, user: User, data: bytes) -> StoredImage:
    """Saves a photo for this user. The caller commits."""
    count = db.scalar(
        select(func.count()).select_from(StoredImage).where(StoredImage.user_id == user.id)
    )
    if count >= settings.MAX_IMAGES_PER_USER:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "You have reached the limit of saved photos. Delete some from History to add more.",
        )
    image = StoredImage(user_id=user.id, data=data, size=len(data))
    db.add(image)
    db.flush()
    return image


def delete_scan_and_photo(db: Session, scan: ScanHistory) -> None:
    """Removes a history row together with its photo. The caller commits."""
    if scan.image_public_id:
        image = db.get(StoredImage, scan.image_public_id)
        if image is not None:
            db.delete(image)
    db.delete(scan)