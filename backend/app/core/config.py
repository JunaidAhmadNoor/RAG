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
    llm_provider: str = "ollama"
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "llama3.1:8b"
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

    @field_validator("ollama_base_url", mode="after")
    @classmethod
    def normalize_ollama_base_url(cls, v: str) -> str:
        s = (v or "").strip().rstrip("/")
        return s


settings = Settings()
