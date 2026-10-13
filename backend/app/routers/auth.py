from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.core.security import (
    DUMMY_HASH,
    REFRESH,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.models import User
from app.schemas.user import AuthResponse, RefreshRequest, TokenPair, UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _build_auth_response(user: User) -> AuthResponse:
    return AuthResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, payload: UserCreate, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.")
    if db.scalar(select(User).where(User.username == payload.username)):
        raise HTTPException(status.HTTP_409_CONFLICT, "This username is already taken.")

    user = User(
        full_name=payload.full_name,
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        # Two people registering with the same details at the same moment
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "This email or username is already in use.")
    db.refresh(user)
    return _build_auth_response(user)


@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")
def login(request: Request, payload: UserLogin, db: Session = Depends(get_db)):
    identifier = payload.identifier.strip().lower()
    user = db.scalar(
        select(User).where(or_(User.email == identifier, User.username == identifier))
    )

    # Always check a password hash, even for unknown users, so timing stays equal
    password_ok = verify_password(payload.password, user.hashed_password if user else DUMMY_HASH)

    if user is None or not password_ok or not user.is_active:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Incorrect email, username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _build_auth_response(user)


@router.post("/refresh", response_model=TokenPair)
@limiter.limit("30/minute")
def refresh(request: Request, payload: RefreshRequest, db: Session = Depends(get_db)):
    user_id = decode_token(payload.refresh_token, REFRESH)
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Your session has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )