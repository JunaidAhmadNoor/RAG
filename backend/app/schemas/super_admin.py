from pydantic import BaseModel, Field


class CreateAdminBySuperRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6)


class SetAdminActiveRequest(BaseModel):
    is_active: bool
