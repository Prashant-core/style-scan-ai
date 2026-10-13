from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

database_url = settings.DATABASE_URL

# Hosts give the link in different forms. This project uses the psycopg2 driver,
# so turn all of them into the plain "postgresql://" form.
for prefix in ("postgres://", "postgresql+psycopg://", "postgresql+psycopg2://"):
    if database_url.startswith(prefix):
        database_url = "postgresql://" + database_url[len(prefix):]
        break

connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}

engine = create_engine(database_url, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()