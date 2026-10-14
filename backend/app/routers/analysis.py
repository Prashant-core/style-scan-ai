from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.database import get_db
from app.dependencies import get_current_user
from app.models import ScanHistory, User
from app.schemas.scan import ScanCreate, ScanOut
from app.services.recommendations import ADVICE, classify, get_advice

router = APIRouter(prefix="/api/analysis", tags=["Face analysis"])

SCAN_TYPE = "face_analysis"
MAX_SAVED_SCANS = 200


def to_out(scan: ScanHistory) -> dict:
    """Builds the response from a saved row. The advice text is added fresh each time."""
    metrics = scan.metrics
    shape = metrics["face_shape"]
    runner_up = metrics.get("runner_up")
    return {
        "id": scan.id,
        "created_at": scan.created_at,
        "face_shape": shape,
        "runner_up": runner_up,
        "runner_up_title": ADVICE[runner_up]["title"] if runner_up else None,
        "ratios": metrics["ratios"],
        "advice": get_advice(shape),
    }


def get_own_scan(db: Session, scan_id: str, user: User) -> ScanHistory:
    # Filtering by user_id means nobody can read or delete another person's result
    scan = db.scalar(
        select(ScanHistory).where(
            ScanHistory.id == scan_id,
            ScanHistory.user_id == user.id,
            ScanHistory.scan_type == SCAN_TYPE,
        )
    )
    if scan is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Result not found.")
    return scan


@router.post("/scans", response_model=ScanOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_scan(
    request: Request,
    payload: ScanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Works out the face shape from the measurements and saves the result.
    The photo itself is never sent to the server."""
    saved = db.scalar(
        select(func.count())
        .select_from(ScanHistory)
        .where(ScanHistory.user_id == current_user.id, ScanHistory.scan_type == SCAN_TYPE)
    )
    if saved >= MAX_SAVED_SCANS:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "You have reached the limit of saved results. Delete an old one to add a new one.",
        )

    ratios = payload.ratios
    shape, runner_up = classify(ratios.forehead, ratios.jaw, ratios.length)

    scan = ScanHistory(
        user_id=current_user.id,
        scan_type=SCAN_TYPE,
        metrics={
            "face_shape": shape,
            "runner_up": runner_up,
            "ratios": {
                "forehead": round(ratios.forehead, 3),
                "jaw": round(ratios.jaw, 3),
                "length": round(ratios.length, 3),
            },
        },
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return to_out(scan)


@router.get("/scans", response_model=list[ScanOut])
def list_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scans = db.scalars(
        select(ScanHistory)
        .where(ScanHistory.user_id == current_user.id, ScanHistory.scan_type == SCAN_TYPE)
        .order_by(ScanHistory.created_at.desc())
        .limit(50)
    ).all()
    return [to_out(scan) for scan in scans]


@router.get("/scans/{scan_id}", response_model=ScanOut)
def get_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return to_out(get_own_scan(db, scan_id, current_user))


@router.delete("/scans/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.delete(get_own_scan(db, scan_id, current_user))
    db.commit()