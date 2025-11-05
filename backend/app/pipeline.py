"""Core orchestration logic for the processing pipeline."""

from __future__ import annotations

import logging
import uuid
from typing import Dict, Optional

from . import models
from .config import get_settings
from .database import SessionLocal
from utils import chunker, downloader, ocr, translator, vector_store

logger = logging.getLogger(__name__)
settings = get_settings()


class PipelineError(Exception):
    """Raised when a processing step fails."""


class JobManager:
    """Simple in-memory job manager.

    Replace with a task queue like Celery or RQ if distributed execution is
    required. The manager persists limited job metadata to the database.
    """

    def __init__(self) -> None:
        self._jobs: Dict[str, str] = {}

    def create_job(self) -> str:
        job_id = str(uuid.uuid4())
        self._jobs[job_id] = "pending"
        return job_id

    def set_status(self, job_id: str, status: str) -> None:
        self._jobs[job_id] = status

    def get_status(self, job_id: str) -> Optional[str]:
        return self._jobs.get(job_id)


job_manager = JobManager()


def run_pipeline(job_id: str) -> None:
    """Execute the processing pipeline for a job."""

    db = SessionLocal()
    try:
        job = db.get(models.ProcessingJob, job_id)
        if not job:
            raise PipelineError(f"Job {job_id} not found")

        logger.info("Starting pipeline for job %s", job.id)

        job_manager.set_status(job.id, "downloading")
        metadata, download_path = downloader.download_work(
            title=job.title,
            author=job.author,
            year=job.year,
            language=job.language,
            target_dir=settings.storage_dir,
        )

        job.metadata = metadata
        job.status = "processing"
        job_manager.set_status(job.id, "processing")
        db.add(job)
        db.commit()
        db.refresh(job)

        text_path = ocr.ensure_text_layer(download_path)
        extracted_text, structured_text = ocr.extract_structured_text(text_path)

        chunks = chunker.chunk_text(structured_text)
        vector_store.index_chunks(job_id=job.id, chunks=chunks)

        translated = translator.translate_chunks(chunks, source_language=job.language)

        processed_work = models.ProcessedWork(
            job_id=job.id,
            title=job.title,
            author=job.author,
            year=job.year,
            language=job.language,
            metadata=metadata,
            original_text=extracted_text,
            translated_text=translator.combine_translations(translated),
            structured_output=translator.combine_structured_output(translated),
        )
        db.add(processed_work)

        job.status = "completed"
        job_manager.set_status(job.id, "completed")
        db.add(job)
        db.commit()
        logger.info("Pipeline completed for job %s", job.id)

    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("Pipeline failed for job %s", job_id)
        job = db.get(models.ProcessingJob, job_id)
        if job:
            job.status = "failed"
            job.error_message = str(exc)
            job_manager.set_status(job.id, "failed")
            db.add(job)
            db.commit()
        raise PipelineError(str(exc)) from exc
    finally:
        db.close()
