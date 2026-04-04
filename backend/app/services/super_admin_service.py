import logging
from datetime import UTC, datetime

from fastapi import HTTPException, status

from app.core.config import settings

_log = logging.getLogger(__name__)
from app.core.security import hash_password
from app.db.mongodb import documents_collection, users_collection
from app.services.admin_user_service import list_users_for_admin


def bootstrap_superadmin_if_configured() -> None:
    """Create superadmin from env when no superadmin exists (one-time / controlled deploy)."""
    username = (settings.superadmin_bootstrap_username or "").strip()
    password = settings.superadmin_bootstrap_password or ""
    if not username or not password:
        return
    if users_collection.find_one({"role": "superadmin"}):
        return
    if users_collection.find_one({"username": username}):
        _log.warning(
            "Superadmin bootstrap skipped: username %r already exists. "
            "Pick a different SUPERADMIN_BOOTSTRAP_USERNAME (e.g. superadmin).",
            username,
        )
        return
    users_collection.insert_one(
        {
            "username": username,
            "password": hash_password(password),
            "role": "superadmin",
            "owner_admin": None,
            "can_upload": False,
            "is_active": True,
            "created_at": datetime.now(UTC),
        }
    )


def list_admins_with_stats() -> list[dict]:
    cursor = users_collection.find(
        {"role": "admin"},
        {"_id": 0, "password": 0},
    ).sort("created_at", -1)
    out: list[dict] = []
    for doc in cursor:
        un = doc["username"]
        team_count = users_collection.count_documents(
            {"owner_admin": un, "role": "user"}
        )
        doc_count = documents_collection.count_documents({"owner_admin": un})
        out.append(
            {
                "username": un,
                "created_at": doc.get("created_at"),
                "is_active": doc.get("is_active", True),
                "team_user_count": team_count,
                "document_count": doc_count,
            }
        )
    return out


def list_team_users_readonly(admin_username: str) -> list[dict]:
    admin = users_collection.find_one({"username": admin_username, "role": "admin"})
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    return list_users_for_admin(admin_username)


def create_admin_by_super(username: str, password: str) -> None:
    existing = users_collection.find_one({"username": username})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists"
        )
    users_collection.insert_one(
        {
            "username": username,
            "password": hash_password(password),
            "role": "admin",
            "owner_admin": username,
            "can_upload": True,
            "is_active": True,
            "created_at": datetime.now(UTC),
        }
    )


def set_admin_active(super_username: str, admin_username: str, is_active: bool) -> None:
    if admin_username == super_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own account this way",
        )
    target = users_collection.find_one({"username": admin_username})
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if target.get("role") == "superadmin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify super admin accounts",
        )
    if target.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target is not an admin account",
        )
    users_collection.update_one(
        {"username": admin_username, "role": "admin"},
        {"$set": {"is_active": is_active}},
    )
