from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.core.security import hash_password, verify_password
from app.database import get_db
from app.dependencies import get_current_user
from app.models import ScanHistory, StoredImage, User
from app.schemas.user import DeleteAccount, PasswordChange, ProfileUpdate, UserOut

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.full_name = payload.full_name
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/me/password", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("5/minute")
def change_password(
    request: Request,
    payload: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Your current password is incorrect.")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()


@router.get("/me/summary")
def my_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """How much the person has saved, so they can see what would be deleted."""
    photos, bytes_used = db.execute(
        select(func.count(), func.coalesce(func.sum(StoredImage.size), 0)).where(
            StoredImage.user_id == current_user.id
        )
    ).one()
    records = db.scalar(
        select(func.count()).select_from(ScanHistory).where(ScanHistory.user_id == current_user.id)
    )
    return {"photos": photos, "photo_bytes": int(bytes_used), "records": records}


@router.delete("/me/photos", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_photos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes every saved photo. Pictures made by the trial room (and by older versions of the app) go with them.
    Skin scans and face results stay, without their photo."""
    db.execute(
        delete(ScanHistory).where(
            ScanHistory.user_id == current_user.id,
            ScanHistory.scan_type.in_(["trial_room", "placement_photo"]),
        )
    )
    db.execute(
        ScanHistory.__table__.update()
        .where(ScanHistory.user_id == current_user.id)
        .values(image_public_id=None)
    )
    db.execute(delete(StoredImage).where(StoredImage.user_id == current_user.id))
    db.commit()


@router.delete("/me/history", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes all results and all photos, but keeps the account."""
    db.execute(delete(ScanHistory).where(ScanHistory.user_id == current_user.id))
    db.execute(delete(StoredImage).where(StoredImage.user_id == current_user.id))
    db.commit()


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("5/minute")
def delete_me(
    request: Request,
    payload: DeleteAccount,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes the account and all scan history. The user must confirm with their password."""
    if not verify_password(payload.password, current_user.hashed_password):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Password is incorrect.")
    db.delete(current_user)
    db.commit()