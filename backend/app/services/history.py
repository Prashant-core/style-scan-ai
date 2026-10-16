from app.models import ScanHistory


def item_out(scan: ScanHistory) -> dict:
    """The same shape for every kind of history row."""
    return {
        "id": scan.id,
        "scan_type": scan.scan_type,
        "created_at": scan.created_at,
        "image_id": scan.image_public_id,
        "metrics": scan.metrics,
    }