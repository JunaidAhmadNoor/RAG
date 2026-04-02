from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    """Public signup is admin-only; regular users are created by an admin."""
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    username: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    can_upload: bool = False


class MeResponse(BaseModel):
    username: str
    role: str
    can_upload: bool
    owner_admin: str | None = None
