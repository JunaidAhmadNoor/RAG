from pydantic import BaseModel, Field


class CreateUserRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6)
    can_upload: bool = False


class UpdateUserRequest(BaseModel):
    can_upload: bool
