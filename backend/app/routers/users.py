from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.core.security import verify_password
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.user import DeleteAccount, ProfileUpdate, UserOut

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