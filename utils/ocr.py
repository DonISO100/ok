"""OCR and text extraction helpers."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)


class StructuredParagraph(Dict):
    """Representation of a paragraph with metadata (page, position)."""


def ensure_text_layer(file_path: Path) -> Path:
    """Ensure the file at *file_path* is text-searchable.

    Replace placeholder with logic that detects whether OCR is needed and, if
    so, runs an OCR engine like Tesseract. The function should return the path
    to a text-searchable file (PDF, TXT, etc.).
    """

    logger.info("Checking if %s requires OCR", file_path)
    # TODO: inspect PDF metadata or run detection to determine text layer availability
    return file_path


def extract_structured_text(file_path: Path) -> Tuple[str, List[StructuredParagraph]]:
    """Extract raw text and structured paragraph metadata.

    The structured representation should contain page numbers, paragraph ids,
    and other metadata used later by chunking and translation. For now we
    return stub data that mirrors the file path contents.
    """

    logger.info("Extracting text from %s (placeholder)", file_path)
    raw_text = "Lorem ipsum dolor sit amet..."
    structured = [
        StructuredParagraph({"page": 1, "paragraph": 1, "text": raw_text}),
    ]
    return raw_text, structured
