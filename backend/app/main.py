import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.documents import router as documents_router
from app.core.config import settings

app = FastAPI(title="RAG Role-Based Chat API")


def _parse_cors_origins(raw: str) -> list[str]:
    """Comma-separated origins; strip whitespace and trailing slashes (browser Origin has no slash)."""
    out: list[str] = []
    for part in raw.split(","):
        o = part.strip().rstrip("/")
        if o:
            out.append(o)
    return out


# Starlette returns 400 on OPTIONS preflight if Origin is not allowed — must match exactly or via regex.
_cors_origins = _parse_cors_origins(settings.cors_origins)
_cors_kw: dict = {
    "allow_origins": _cors_origins,
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}
# Cloudflare Pages production + preview hosts are *.pages.dev — allow via regex unless disabled (empty env).
_default_pages_regex = r"https://.*\.pages\.dev$"
_regex_raw = settings.cors_origin_regex
if _regex_raw is None:
    _regex = _default_pages_regex
else:
    _regex = _regex_raw.strip()
if _regex:
    try:
        re.compile(_regex)
        _cors_kw["allow_origin_regex"] = _regex
    except re.error:
        pass

app.add_middleware(CORSMiddleware, **_cors_kw)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(documents_router)
app.include_router(chat_router)

@app.get("/")
def root():
    return {"status": "API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
