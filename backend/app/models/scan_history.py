from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from app.database import Base

class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=True)
    image_url = Column(String, nullable=True)
    face_shape = Column(String, nullable=False)
    confidence_score = Column(Float, default=0.0)
    
    # Store calculated metric ratios (jaw-to-cheek, length-to-width)
    proportions = Column(JSON, nullable=True)
    
    # Recommended styling rules (glasses, haircut, beard, necklines)
    recommendations = Column(JSON, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)