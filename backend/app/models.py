"""Database models.

Define ORM models representing stored metadata, processing jobs, and outputs.
Additional tables (e.g., chunk embeddings) can be added here later.
"""

from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text, JSON

from .database import Base


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    year = Column(Integer, nullable=True)
    language = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    error_message = Column(Text, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ProcessedWork(Base):
    __tablename__ = "processed_works"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_id = Column(String, nullable=False, unique=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    year = Column(Integer, nullable=True)
    language = Column(String, nullable=False)
    metadata = Column(JSON, nullable=True)
    original_text = Column(Text, nullable=True)
    translated_text = Column(Text, nullable=True)
    structured_output = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
