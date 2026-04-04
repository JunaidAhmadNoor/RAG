from fastapi import APIRouter, Depends

from app.core.deps import super_admin_required
from app.schemas.super_admin import CreateAdminBySuperRequest, SetAdminActiveRequest
from app.services.super_admin_service import (
    create_admin_by_super,
    list_admins_with_stats,
    list_team_users_readonly,
    set_admin_active,
)

router = APIRouter(prefix="/api/superadmin", tags=["superadmin"])


@router.get("/admins")
def get_admins(current_user=Depends(super_admin_required)):
    return list_admins_with_stats()


@router.get("/admins/{username}/users")
def get_admin_team_users(username: str, current_user=Depends(super_admin_required)):
    return list_team_users_readonly(username)


@router.post("/admins", status_code=201)
def post_create_admin(
    payload: CreateAdminBySuperRequest, current_user=Depends(super_admin_required)
):
    create_admin_by_super(payload.username, payload.password)
    return {"message": "Admin created"}


@router.patch("/admins/{username}/active")
def patch_admin_active(
    username: str,
    payload: SetAdminActiveRequest,
    current_user=Depends(super_admin_required),
):
    set_admin_active(current_user["username"], username, payload.is_active)
    return {"message": "Admin updated"}
