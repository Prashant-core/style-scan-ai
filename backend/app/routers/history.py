from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import ScanHistory, User
from app.services.history import item_out
from app.services.images import delete_scan_and_photo
from app.services.recommendations import classify

router = APIRouter(prefix="/api/history", tags=["History"])

TYPES = {"face_analysis", "skin_scan", "trial_room", "placement_photo", "placement_check"}


@router.get("")
def list_history(
    scan_type: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = select(ScanHistory).where(ScanHistory.user_id == current_user.id)
    if scan_type:
        if scan_type not in TYPES:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Unknown history type.")
        query = query.where(ScanHistory.scan_type == scan_type)

    scans = db.scalars(query.order_by(ScanHistory.created_at.desc()).limit(200)).all()
    items = []
    for scan in scans:
        item = item_out(scan)
        if scan.scan_type == "face_analysis":
            r = scan.metrics["ratios"]
            # Worked out again so older results use the latest rules
            item["metrics"] = {**scan.metrics, "face_shape": classify(r["forehead"], r["jaw"], r["length"])[0]}
        items.append(item)
    return items


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scan = db.scalar(
        select(ScanHistory).where(ScanHistory.id == scan_id, ScanHistory.user_id == current_user.id)
    )
    if scan is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item not found.")
    delete_scan_and_photo(db, scan)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)