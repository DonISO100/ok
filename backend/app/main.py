"""FastAPI application entrypoint."""

import logging
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models
from .config import get_settings
from .database import Base, engine, get_db
from .pipeline import job_manager, run_pipeline
from .schemas import ErrorResponse, JobStatusResponse, ProcessRequest, ProcessedWorkResponse

settings = get_settings()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables on startup. In production, manage migrations explicitly.
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/process", response_model=JobStatusResponse, responses={400: {"model": ErrorResponse}})
def start_processing(
    request: ProcessRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Start the processing pipeline as a background task."""

    logger.info("Received processing request for '%s' by %s", request.title, request.author)

    if request.language.lower() not in {"latin", "greek", "english"}:
        raise HTTPException(status_code=400, detail="Unsupported language. Extend validation as needed.")

    job_id = job_manager.create_job()
    job = models.ProcessingJob(
        id=job_id,
        title=request.title,
        author=request.author,
        year=request.year,
        language=request.language,
        status="pending",
    )
    db.add(job)
    db.commit()

    background_tasks.add_task(run_pipeline, job_id)

    return JobStatusResponse(job_id=job_id, status="pending")


@app.get("/status/{job_id}", response_model=JobStatusResponse, responses={404: {"model": ErrorResponse}})
def get_status(job_id: str, db: Session = Depends(get_db)):
    """Return the current status of a job."""

    job = db.get(models.ProcessingJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    status = job_manager.get_status(job_id) or job.status
    return JobStatusResponse(
        job_id=job_id,
        status=status,
        error_message=job.error_message,
        metadata=job.metadata,
    )


@app.get("/output/{job_id}", response_model=ProcessedWorkResponse, responses={404: {"model": ErrorResponse}})
def get_output(job_id: str, db: Session = Depends(get_db)):
    """Retrieve processed content for a completed job."""

    work = db.query(models.ProcessedWork).filter(models.ProcessedWork.job_id == job_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Output not found for job")

    return ProcessedWorkResponse(
        job_id=work.job_id,
        title=work.title,
        author=work.author,
        year=work.year,
        language=work.language,
        metadata=work.metadata,
        original_text=work.original_text,
        translated_text=work.translated_text,
        structured_output=work.structured_output,
        created_at=work.created_at,
    )


@app.get("/health")
def health_check():
    """Simple health check endpoint."""

    return {"status": "ok"}
