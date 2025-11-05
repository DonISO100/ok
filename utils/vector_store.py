"""Vector store integration placeholders."""

from __future__ import annotations

import logging
from typing import Iterable, List

logger = logging.getLogger(__name__)


def index_chunks(job_id: str, chunks: Iterable[dict]) -> None:
    """Index chunk embeddings for later retrieval."""

    chunk_list: List[dict] = list(chunks)
    logger.info("Indexing %d chunks for job %s (placeholder)", len(chunk_list), job_id)
    # TODO: Implement connection to vector database (e.g., FAISS, Weaviate, Pinecone)
