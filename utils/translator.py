"""Translation helpers that interface with LLMs or other services."""

from __future__ import annotations

import logging
from typing import Dict, Iterable, List

logger = logging.getLogger(__name__)


def translate_chunks(chunks: Iterable[dict], source_language: str) -> List[Dict]:
    """Translate each chunk and return structured translations."""

    translations: List[Dict] = []
    for idx, chunk in enumerate(chunks, start=1):
        logger.info("Translating chunk %d from %s", idx, source_language)
        translations.append(
            {
                "original": chunk["content"],
                "translation": f"[Translated {source_language} -> English] {chunk['content']}",
                "metadata": chunk["metadata"],
            }
        )
    return translations


def combine_translations(translations: Iterable[Dict]) -> str:
    """Combine translated chunks into a single string."""

    return "\n\n".join(item["translation"] for item in translations)


def combine_structured_output(translations: Iterable[Dict]) -> Dict:
    """Construct structured output preserving alignment between original and translation."""

    structured_sections = []
    for item in translations:
        structured_sections.append(
            {
                "metadata": item["metadata"],
                "original": item["original"],
                "translation": item["translation"],
            }
        )
    return {"sections": structured_sections}
