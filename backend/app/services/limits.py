from datetime import datetime, time, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import ScanHistory, User


def check_daily_limit(db: Session, user: User, scan_types: list[str], limit: int, what: str) -> None:
    """Stops one person from using up the free AI quota for everyone."""
    start = datetime.combine(datetime.now(timezone.utc).date(), time.min, tzinfo=timezone.utc)
    used = db.scalar(
        select(func.count())
        .select_from(ScanHistory)
        .where(
            ScanHistory.user_id == user.id,
            ScanHistory.scan_type.in_(scan_types),
            ScanHistory.created_at >= start,
        )
    )
    if used >= limit:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            f"You have used your {limit} {what} for today. Please come back tomorrow.",
        )