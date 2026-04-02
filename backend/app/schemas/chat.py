from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    top_k: int = 4
    session_id: str | None = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    session_id: str | None = None


class NewSessionResponse(BaseModel):
    session_id: str
    title: str
