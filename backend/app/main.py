from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app import models  # noqa: F401  (loads the tables so they get created)
from app.core.config import settings
from app.core.limiter import limiter
from app.database import Base, engine
from app.routers import analysis, assistant, auth, gallery, history, images, skin, trial, users
from app.services.gemini import AiError


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Creates any missing tables when the server starts
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
    # Hide the API docs on the live website
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None,
    openapi_url=None if settings.is_production else "/openapi.json",
)

@app.exception_handler(AiError)
async def ai_error_handler(request: Request, exc: AiError):
    # AI problems become a short message the user can read
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = "no-store"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(analysis.router)
app.include_router(skin.router)
app.include_router(trial.router)
app.include_router(history.router)
app.include_router(images.router)
app.include_router(gallery.router)
app.include_router(assistant.router)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}