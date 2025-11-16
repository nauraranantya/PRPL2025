from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database.session import get_session
from app.schemas.auth import UserCreateEmail, UserCreatePhone, Token, UserOut, LoginRequest
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.deps import get_current_user
from app.crud import user as user_crud


router = APIRouter(prefix="/auth", tags=["auth"])


# ---------------------------
#  SIGNUP (EMAIL)
# ---------------------------
@router.post("/signup/email", response_model=UserOut)
async def signup_email(payload: UserCreateEmail, session: AsyncSession = Depends(get_session)):
    existing = await user_crud.get_by_email(session, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await user_crud.create_user_with_email(
        session,
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
    )
    return UserOut.from_orm(user)


# ---------------------------
#  SIGNUP (PHONE)
# ---------------------------
@router.post("/signup/phone", response_model=UserOut)
async def signup_phone(payload: UserCreatePhone, session: AsyncSession = Depends(get_session)):
    existing = await user_crud.get_by_phone(session, payload.phone)
    if existing:
        raise HTTPException(status_code=400, detail="Phone already registered")

    # full_name = None for phone accounts
    user = await user_crud.create_user_with_phone(
        session,
        phone=payload.phone,
        password=payload.password,
    )
    return UserOut.from_orm(user)


# ---------------------------
#  LOGIN (JSON)
# --------------------------


@router.post("/login", response_model=Token)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_session)):
    identifier = payload.identifier
    password = payload.password

    # email login
    if "@" in identifier:
        user = await user_crud.get_by_email(session, identifier)
        if not user or not user_crud.verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

    # phone login
    else:
        user = await user_crud.get_by_phone(session, identifier)
        if not user or not user_crud.verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))

    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}


# ---------------------------
#  /ME - Get current user
# ---------------------------
@router.get("/me", response_model=UserOut)
async def read_me(current_user = Depends(get_current_user)):
    return UserOut.from_orm(current_user)


# ---------------------------
#  REFRESH TOKEN
# ---------------------------
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

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer"
    }