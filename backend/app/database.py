"""Database setup and session management.

Currently uses SQLAlchemy with SQLite for local storage. Swap out the engine
for PostgreSQL or another production-ready database during deployment.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from .config import get_settings

settings = get_settings()
engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Yield a database session for FastAPI dependencies."""

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
