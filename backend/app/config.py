from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = Field(default="Asset Intelligence Assistant API", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    app_debug: bool = Field(default=True, alias="APP_DEBUG")
    cors_origins: str = Field(default="http://localhost:5173", alias="CORS_ORIGINS")

    database_url_env: str | None = Field(default=None, alias="DATABASE_URL")

    postgres_host: str = Field(default="localhost", alias="POSTGRES_HOST")
    postgres_db: str = Field(default="asset_intelligence", alias="POSTGRES_DB")
    postgres_user: str = Field(default="asset_admin", alias="POSTGRES_USER")
    postgres_password: str = Field(default="asset_admin_dev", alias="POSTGRES_PASSWORD")
    postgres_port: int = Field(default=5433, alias="POSTGRES_PORT")

    llm_provider: str = Field(default="openrouter", alias="LLM_PROVIDER")
    llm_api_key: str = Field(default="test-api-key", alias="LLM_API_KEY")
    llm_model: str = Field(default="openrouter/free", alias="LLM_MODEL")
    llm_base_url: str = Field(default="https://openrouter.ai/api/v1", alias="LLM_BASE_URL")

    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def database_url(self) -> str:
        if self.database_url_env:
            return self._normalize_database_url(self.database_url_env)

        return (
            f"postgresql+psycopg://{self.postgres_user}:"
            f"{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def _normalize_database_url(self, value: str) -> str:
        if value.startswith("postgresql+psycopg://"):
            return value

        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg://", 1)

        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+psycopg://", 1)

        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()