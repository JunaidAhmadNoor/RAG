from fastapi import APIRouter, Depends

from app.core.deps import admin_required
from app.schemas.admin_users import CreateUserRequest, UpdateUserRequest
from app.services.admin_user_service import (
    create_user_for_admin,
    delete_user_for_admin,
    list_users_for_admin,
    update_user_can_upload,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/users", status_code=201)
def create_user(payload: CreateUserRequest, current_user=Depends(admin_required)):
    create_user_for_admin(
        current_user["username"],
        payload.username,
        payload.password,
        payload.can_upload,
    )
    return {"message": "User created"}


@router.get("/users")
def list_users(current_user=Depends(admin_required)):
    return list_users_for_admin(current_user["username"])


@router.patch("/users/{username}")
def patch_user(
    username: str,
    payload: UpdateUserRequest,
    current_user=Depends(admin_required),
):
    update_user_can_upload(current_user["username"], username, payload.can_upload)
    return {"message": "User updated"}


@router.delete("/users/{username}", status_code=204)
def remove_user(username: str, current_user=Depends(admin_required)):
    delete_user_for_admin(current_user["username"], username)
