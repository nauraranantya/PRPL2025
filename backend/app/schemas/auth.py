# backend/app/schemas/auth.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserCreateEmail(BaseModel):

    email: EmailStr
    password: str
    full_name: str

class UserCreatePhone(BaseModel):
    phone: str
    password: str
    full_name: Optional[str] = None

class UserOut(BaseModel):
    id: UUID
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    full_name: Optional[str] = None
    is_admin: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str | None = None  # user id
    exp: int | None = None

class LoginRequest(BaseModel):
    identifier: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None