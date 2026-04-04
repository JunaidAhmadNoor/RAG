from datetime import UTC, datetime

from fastapi import HTTPException, status

from app.core.security import hash_password
from app.db.mongodb import chat_sessions_collection, refresh_tokens_collection, users_collection


def create_user_for_admin(
    admin_username: str, username: str, password: str, can_upload: bool
) -> None:
    existing = users_collection.find_one({"username": username})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    users_collection.insert_one(
        {
            "username": username,
            "password": hash_password(password),
            "role": "user",
            "owner_admin": admin_username,
            "can_upload": can_upload,
            "is_active": True,
            "created_at": datetime.now(UTC),
        }
    )


def list_users_for_admin(admin_username: str) -> list[dict]:
    cursor = users_collection.find(
        {"owner_admin": admin_username, "role": "user"},
        {"_id": 0, "password": 0},
    ).sort("created_at", -1)
    return list(cursor)


def update_user_can_upload(
    admin_username: str, target_username: str, can_upload: bool
) -> None:
    result = users_collection.update_one(
        {
            "username": target_username,
            "owner_admin": admin_username,
            "role": "user",
        },
        {"$set": {"can_upload": can_upload}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


def delete_user_for_admin(admin_username: str, target_username: str) -> None:
    if target_username == admin_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account",
        )
    deleted = users_collection.delete_one(
        {
            "username": target_username,
            "owner_admin": admin_username,
            "role": "user",
        }
    )
    if deleted.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    chat_sessions_collection.delete_many({"username": target_username})
    refresh_tokens_collection.delete_many({"username": target_username})
