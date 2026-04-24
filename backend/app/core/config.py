from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "rag_system"

    jwt_secret_key: str
    jwt_refresh_secret_key: str
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    chroma_persist_dir: str = "./chroma_data"
    llm_provider: str = "groq"
    llm_api_key: str | None = None
    llm_base_url: str | None = None
    llm_model: str | None = None
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    cors_origins: str = "http://localhost:5173"

    # Optional: regex so Cloudflare Pages preview URLs (e.g. *.pages.dev) match without listing each hash.
    # Env: CORS_ORIGIN_REGEX
    cors_origin_regex: str | None = None

    # Optional: full path to tesseract.exe on Windows if not on PATH
    tesseract_cmd: str | None = None

    # OCR: auto | rapidocr | easyocr | tesseract (env: OCR_BACKEND)
    ocr_backend: str = "auto"

    # Optional: create first superadmin on startup if none exists (set once, then remove from env).
    superadmin_bootstrap_username: str | None = None
    superadmin_bootstrap_password: str | None = None

    @field_validator("llm_base_url", mode="after")
    @classmethod
    def normalize_llm_base_url(cls, v: str | None) -> str | None:
        if v is None:
            return None
        return v.strip().rstrip("/") or None


settings = Settings()
