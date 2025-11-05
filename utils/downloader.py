"""Download utilities for retrieving works from external services."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, Tuple

logger = logging.getLogger(__name__)


def verify_public_domain(metadata: Dict) -> None:
    """Validate that the work can be processed under public domain rules."""

    if not metadata.get("public_domain", True):
        raise ValueError("Work is not in the public domain; aborting ingestion.")


def download_work(
    title: str,
    author: str,
    year: int | None,
    language: str,
    target_dir: str,
) -> Tuple[Dict, Path]:
    """Look up metadata and download the work.

    Replace placeholder logic with integration to a real metadata API (e.g.,
    Open Library, Project Gutenberg). The function should return metadata and
    the path to the downloaded file (PDF, EPUB, etc.).
    """

    logger.info("Searching metadata API for '%s' by %s", title, author)
    metadata = {
        "title": title,
        "author": author,
        "year": year,
        "language": language,
        "public_domain": True,
        "source": "mock",
        "download_url": "https://example.com/work.pdf",
    }

    verify_public_domain(metadata)

    Path(target_dir).mkdir(parents=True, exist_ok=True)
    file_path = Path(target_dir) / f"{title.replace(' ', '_')}.pdf"
    logger.info("Downloading file to %s (placeholder)", file_path)

    # TODO: Implement actual download logic, e.g., using requests.get with streaming
    with open(file_path, "wb") as fh:
        fh.write(b"%PDF-1.4\n% Mock PDF content for testing pipeline stubs")

    return metadata, file_path
