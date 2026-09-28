from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/dealmind"

    # API
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "DealMind API"

    # CORS - defaults if not set in .env
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # LLM Configuration (for AI agent)
    LLM_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""  # Alias for LLM_API_KEY

    # Hindsight API (for future integration)
    HINDSIGHT_API_URL: str = ""
    HINDSIGHT_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
