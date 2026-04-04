from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.schemas.auth import (
    LoginRequest,
    MeResponse,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.services.auth_service import login_user, refresh_access_token, register_admin_only

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register(payload: RegisterRequest):
    register_admin_only(payload.username, payload.password)
    return {"message": "Admin account registered"}


@router.get("/me", response_model=MeResponse)
def me(current_user=Depends(get_current_user)):
    role = current_user["role"]
    if role == "superadmin":
        can_upload = False
    elif role == "admin":
        can_upload = True
    else:
        can_upload = bool(current_user.get("can_upload", False))
    return MeResponse(
        username=current_user["username"],
        role=role,
        can_upload=can_upload,
        owner_admin=current_user.get("owner_admin"),
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    return login_user(payload.username, payload.password)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest):
    return refresh_access_token(payload.refresh_token)
