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

class UserOut(BaseModel):
    id: UUID
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
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