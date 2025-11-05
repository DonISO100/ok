"""Pydantic schemas for request/response payloads."""

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class ProcessRequest(BaseModel):
    title: str = Field(..., description="Title of the work to process")
    author: str = Field(..., description="Author name")
    year: Optional[int] = Field(None, description="Publication year")
    language: str = Field(..., description="Original language (e.g., Latin, Greek)")


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ProcessedWorkResponse(BaseModel):
    job_id: str
    title: str
    author: str
    year: Optional[int]
    language: str
    metadata: Optional[Dict[str, Any]] = None
    original_text: Optional[str]
    translated_text: Optional[str]
    structured_output: Optional[Dict[str, Any]] = None
    created_at: datetime


class ErrorResponse(BaseModel):
    detail: str
