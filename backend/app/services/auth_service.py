from datetime import UTC, datetime

from fastapi import HTTPException, status

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.db.mongodb import refresh_tokens_collection, users_collection
from app.schemas.auth import TokenResponse


def _token_payload(user: dict) -> TokenResponse:
    role = user["role"]
    can_upload = role == "admin" or bool(user.get("can_upload", False))
    access_token = create_access_token(subject=user["username"], role=role)
    refresh_token = create_refresh_token(subject=user["username"])
    refresh_tokens_collection.insert_one(
        {"token": refresh_token, "username": user["username"], "created_at": datetime.now(UTC)}
    )
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=role,
        can_upload=can_upload,
    )


def register_admin_only(username: str, password: str) -> None:
    """Public registration creates admin accounts only."""
    existing = users_collection.find_one({"username": username})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    users_collection.insert_one(
        {
            "username": username,
            "password": hash_password(password),
            "role": "admin",
            "owner_admin": username,
            "can_upload": True,
            "created_at": datetime.now(UTC),
        }
    )


def login_user(username: str, password: str) -> TokenResponse:
    user = users_collection.find_one({"username": username})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    return _token_payload(user)


def refresh_access_token(refresh_token: str) -> TokenResponse:
    stored = refresh_tokens_collection.find_one({"token": refresh_token})
    if not stored:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")

    try:
        payload = decode_refresh_token(refresh_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    username = payload["sub"]
    user = users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    can_upload = user["role"] == "admin" or bool(user.get("can_upload", False))
    new_access = create_access_token(subject=username, role=user["role"])
    return TokenResponse(
        access_token=new_access,
        refresh_token=refresh_token,
        role=user["role"],
        can_upload=can_upload,
    )
