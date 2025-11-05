"""Chunking utilities for splitting text into manageable segments."""

from __future__ import annotations

import logging
from typing import Iterable, List

logger = logging.getLogger(__name__)


def chunk_text(structured_paragraphs: Iterable[dict], max_tokens: int = 500) -> List[dict]:
    """Group paragraphs into chunks.

    Replace the simplistic chunking logic with token-aware segmentation using
    NLP libraries when integrating production models.
    """

    paragraphs = list(structured_paragraphs)
    logger.info("Chunking %d paragraphs into ~%d token chunks", len(paragraphs), max_tokens)

    chunks: List[dict] = []
    current_chunk: List[dict] = []
    for paragraph in paragraphs:
        current_chunk.append(paragraph)
        if len(current_chunk) >= 3:
            chunks.append({"content": "\n".join(p["text"] for p in current_chunk), "metadata": current_chunk.copy()})
            current_chunk = []

    if current_chunk:
        chunks.append({"content": "\n".join(p["text"] for p in current_chunk), "metadata": current_chunk.copy()})

    return chunks
