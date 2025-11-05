# Classical Works Processing Pipeline

This repository scaffolds a full-stack system for ingesting, translating, and rendering classical texts. The code is organized to support a modular processing pipeline with replaceable components for metadata lookup, downloading, OCR, chunking, translation, and vector indexing.

## Project Structure

```
backend/
  app/
    config.py          # Environment configuration using Pydantic
    database.py        # SQLAlchemy engine and session factory
    main.py            # FastAPI entrypoint with REST endpoints
    models.py          # ORM models for jobs and processed works
    pipeline.py        # Orchestrates the processing workflow
    schemas.py         # Pydantic request/response models
frontend/
  index.html           # Bootstrap-based UI for submitting jobs and viewing results
models/
  job.py               # Shared enums and domain models
utils/
  chunker.py           # Text segmentation helpers
  downloader.py        # Metadata lookup and download stubs
  ocr.py               # OCR + structured text extraction stubs
  translator.py        # Translation and structured output helpers
  vector_store.py      # Vector database integration stubs
requirements.txt        # Python dependencies for the backend
```

The `data/` directory will be created automatically when the downloader runs to store source files and the SQLite database.

## Backend Setup (macOS development)

1. **Install Python 3.11 (recommended)** using [pyenv](https://github.com/pyenv/pyenv) or Homebrew.
2. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. **Install dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
4. **Configure environment variables (optional)**: create a `.env` file or export shell variables for any settings you need to override. Available variables (prefixed with `CLASSICS_`) include:
   - `CLASSICS_APP_NAME`
   - `CLASSICS_DEBUG`
   - `CLASSICS_STORAGE_DIR`
   - `CLASSICS_DATABASE_URL`
   - `CLASSICS_METADATA_API_BASE`
5. **Run the FastAPI server**:
   ```bash
   uvicorn backend.app.main:app --reload
   ```
6. Open the frontend page by serving `frontend/index.html`. During development you can:
   - Open the file directly in the browser and point the API calls to `http://127.0.0.1:8000`
   - Or serve it with a lightweight HTTP server:
     ```bash
     python -m http.server --directory frontend 3000
     ```
     Update `API_BASE` in the frontend if serving from a different origin or configure a proxy.

## Backend Setup (Ubuntu deployment)

When production hardware arrives, follow these steps on Ubuntu 22.04:

1. **Install system dependencies**:
   ```bash
   sudo apt update
   sudo apt install -y python3.11 python3.11-venv python3-pip build-essential libpq-dev tesseract-ocr
   ```
2. **Create a deployment user and directories**:
   ```bash
   sudo useradd -m classics
   sudo mkdir -p /opt/classics-app
   sudo chown classics:classics /opt/classics-app
   ```
3. **Clone the repository**:
   ```bash
   sudo -u classics git clone <your-repo-url> /opt/classics-app
   cd /opt/classics-app
   ```
4. **Set up a virtual environment**:
   ```bash
   sudo -u classics python3.11 -m venv /opt/classics-app/.venv
   source /opt/classics-app/.venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
5. **Configure environment variables** by creating `/opt/classics-app/.env` and populating required credentials (API keys, storage paths). Ensure the `CLASSICS_STORAGE_DIR` directory exists and is writable.
6. **Apply database migrations** (for now, table creation happens on startup; replace with Alembic migrations later).
7. **Run the backend with a process manager** (e.g., systemd + uvicorn or gunicorn):
   ```bash
   /opt/classics-app/.venv/bin/uvicorn backend.app.main:app \
     --host 0.0.0.0 --port 8000 --workers 4
   ```
8. **Serve the frontend** via Nginx or any static file server pointing to `/opt/classics-app/frontend`.
9. **Optional integrations**: configure a vector database, external storage, and monitoring/logging solutions.

## Pipeline Overview

1. **/process** – submits metadata and starts the pipeline as a background task.
2. **/status/<job_id>** – polls for job status updates (pending → downloading → processing → completed/failed).
3. **/output/<job_id>** – returns stored results, including original/translated text and structured metadata.

Replace the placeholder logic in `utils/` with real implementations as you integrate:

- Metadata lookups and download streaming
- OCR detection and execution (e.g., Tesseract, AWS Textract)
- Token-aware chunking and vector embeddings
- LLM or MT translation workflows for Latin/Greek to English

## Logging and Error Handling

- The backend uses Python's standard `logging` module; configure log levels and handlers as needed.
- Errors during pipeline execution set the job status to `failed` and persist the message in the database for UI retrieval.

## Next Steps

- Implement metadata API integrations and file streaming with retry logic.
- Swap the in-memory job manager with a distributed queue (Celery, RQ) if long-running tasks need resilience.
- Extend the database schema and vector store integration for semantic search.
- Harden authentication, rate limiting, and input validation before exposing the API.
