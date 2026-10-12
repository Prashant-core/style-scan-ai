from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import scan
from app.database import engine, Base

# Import models so SQLAlchemy builds the tables on startup
from app.models import scan_history

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Initialize the FastAPI application
app = FastAPI(
    title="LookLogic AI API",
    description="Backend engine for face-shape analysis and virtual styling.",
    version="1.0.0"
)

# Configure Cross-Origin Resource Sharing (CORS)
# This allows the Next.js frontend to send requests to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Register API Routers
app.include_router(scan.router)

# Health check endpoint
@app.get("/")
def read_root():
    return {"message": "LookLogic AI Backend is active and listening."}