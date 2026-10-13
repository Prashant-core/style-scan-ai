import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_]{3,20}$")


class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=80)
    username: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("full_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        return " ".join(value.split())

    @field_validator("username")
    @classmethod
    def check_username(cls, value: str) -> str:
        if not USERNAME_PATTERN.match(value):
            raise ValueError("Username must be 3 to 20 characters: letters, numbers or underscore.")
        return value.lower()

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, value: str) -> str:
        return value.lower()

    @field_validator("password")
    @classmethod
    def check_password(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password is too long. Please use 72 characters or fewer.")
        if not (re.search(r"[a-z]", value) and re.search(r"[A-Z]", value) and re.search(r"\d", value)):
            raise ValueError("Password needs one capital letter, one small letter and one number.")
        return value


class UserLogin(BaseModel):
    # The user can type either their email or their username
    identifier: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    username: str
    email: EmailStr
    created_at: datetime


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(TokenPair):
    user: UserOut


class RefreshRequest(BaseModel):
    refresh_token: str


class ProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=80)

    @field_validator("full_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        return " ".join(value.split())


class DeleteAccount(BaseModel):
    password: str = Field(min_length=1, max_length=128)