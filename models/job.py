"""Domain models and enums used by both backend and frontend."""

from enum import Enum


class JobStatus(str, Enum):
    PENDING = "pending"
    DOWNLOADING = "downloading"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
