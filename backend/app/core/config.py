from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All settings are read from the .env file or from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "StyleScan AI"
    ENVIRONMENT: str = "development"

    DATABASE_URL: str = "sqlite:///./stylescan.db"

    # Required. The app will not start without it.
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Comma separated list of websites allowed to call this API
    FRONTEND_URLS: str = "http://localhost:3000"

    # Free AI keys. Leave empty to switch the AI features off (they show a friendly message).
    GEMINI_API_KEY: str = ""
    GEMINI_TEXT_MODEL: str = "gemini-2.5-flash"
    GEMINI_IMAGE_MODEL: str = "gemini-2.5-flash-image"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Limits that keep the free plans safe
    MAX_IMAGES_PER_USER: int = 60  # saved photos per person
    DAILY_IMAGE_LIMIT: int = 8  # new AI pictures per person per day
    DAILY_CHECK_LIMIT: int = 10  # skin scans and interview checks per person per day

    @property
    def cors_origins(self) -> list[str]:
        return [url.strip() for url in self.FRONTEND_URLS.split(",") if url.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()