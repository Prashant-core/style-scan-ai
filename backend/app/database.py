from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

database_url = settings.DATABASE_URL.strip()

# Hosts give the link in different forms. This project uses the psycopg2 driver,
# so name it explicitly. Newer SQLAlchemy versions would otherwise pick a
# different driver that is not installed.
for prefix in ("postgres://", "postgresql://", "postgresql+psycopg://", "postgresql+psycopg2://"):
    if database_url.startswith(prefix):
        database_url = "postgresql+psycopg2://" + database_url[len(prefix):]
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