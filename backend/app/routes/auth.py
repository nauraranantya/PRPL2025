from fastapi import APIRouter, Depends, HTTPException, status
from app.database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.auth import UserCreateEmail, UserCreatePhone, Token, UserOut
from app import crud
from app.core.security import create_access_token, create_refresh_token, decode_token
from typing import Optional
from app.crud import user as user_crud
from app.core.deps import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup/email", response_model=UserOut)
async def signup_email(payload: UserCreateEmail, session: AsyncSession = Depends(get_session)):
    existing = await user_crud.get_by_email(session, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await user_crud.create_user_with_email(session, payload.email, payload.password)
    return UserOut.from_orm(user)

@router.post("/signup/phone", response_model=UserOut)
async def signup_phone(payload: UserCreatePhone, session: AsyncSession = Depends(get_session)):
    existing = await user_crud.get_by_phone(session, payload.phone)
    if existing:
        raise HTTPException(status_code=400, detail="Phone already registered")
    user = await user_crud.create_user_with_phone(session, payload.phone, payload.password)
    return UserOut.from_orm(user)

@router.post("/login", response_model=Token)
async def login(email: Optional[str] = None, phone: Optional[str] = None, password: Optional[str] = None, session: AsyncSession = Depends(get_session)):
    # login either by email + password or phone + password
    if email:
        user = await user_crud.get_by_email(session, email)
        if not user or not user.hashed_password or not user_crud.verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    elif phone:
        user = await user_crud.get_by_phone(session, phone)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if user.hashed_password:
            if not password or not user_crud.verify_password(password, user.hashed_password):
                raise HTTPException(status_code=401, detail="Invalid credentials")
    else:
        raise HTTPException(status_code=400, detail="Provide email or phone and password")

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def read_me(current_user = Depends(get_current_user)):
    return UserOut.from_orm(current_user)

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh", response_model=Token)
async def refresh_token(req: RefreshRequest):
    payload = decode_token(req.refresh_token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = payload["sub"]
    access = create_access_token(user_id)
    refresh = create_refresh_token(user_id)
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}
