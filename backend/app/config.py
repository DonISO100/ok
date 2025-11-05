"""Application configuration settings.

This module centralizes configuration loading so that environment variables
and defaults are in one place. Extend this file with additional settings as
needed (API keys, storage buckets, etc.).
"""

from functools import lru_cache
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Base settings for the application.

    Use environment variables to override these values in development or
    production environments. Sensitive credentials should be injected through
    environment management tools and never hard-coded.
    """

    app_name: str = Field("Classical Works Processor", description="UI title")
    debug: bool = Field(False, description="Enable debug mode")
    storage_dir: str = Field("./data", description="Directory for downloaded files")
    database_url: str = Field("sqlite:///./data/app.db", description="SQLAlchemy database URL")
    metadata_api_base: str = Field(
        "https://example-metadata-service.org/api",
        description="Base URL for metadata lookup. Replace with real endpoint.",
    )

    class Config:
        env_prefix = "CLASSICS_"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance.

    lru_cache ensures we load environment variables once per process. This
    function can be imported in modules that require configuration values.
    """

    return Settings()
