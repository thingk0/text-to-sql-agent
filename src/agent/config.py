from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    database_url: str = "postgresql://user:password@localhost:5432/dbname"

    # OpenAI
    openai_api_key: str = ""

    # Application
    app_env: str = "development"
    log_level: str = "INFO"


settings = Settings()
