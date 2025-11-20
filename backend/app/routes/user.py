from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_session
from app.core.deps import require_admin_user, get_current_user
from app.schemas.auth import UserOut, UserUpdate
from app.models.user import User
from sqlalchemy import select
from app.core.security import get_password_hash

router = APIRouter()


@router.get("", response_model=dict)
async def list_users(
    session: AsyncSession = Depends(get_session),
    current_user = Depends(require_admin_user)
):
    stmt = select(User).order_by(User.created_at.desc())
    result = await session.execute(stmt)
    users = result.scalars().all()

    return {
        "success": True,
        "data": [UserOut.from_orm(u).dict() for u in users]
    }


@router.get("/{user_id}", response_model=dict)
async def get_user(
    user_id: str,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(require_admin_user)
):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    return {
        "success": True,
        "data": UserOut.from_orm(user).dict()
    }


@router.delete("/{user_id}", response_model=dict)
async def delete_user(
    user_id: str,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(require_admin_user)
):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    await session.delete(user)
    await session.commit()

    return {"success": True}


# user edits their own account
@router.put("/me", response_model=dict)
async def update_own_account(
    payload: UserUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    user = current_user

    if payload.full_name is not None:
        user.full_name = payload.full_name

    if payload.email is not None:
        user.email = payload.email

    if payload.phone is not None:
        user.phone = payload.phone

    if payload.password:
        user.hashed_password = get_password_hash(payload.password)

    await session.commit()
    await session.refresh(user)

    return {"success": True, "data": UserOut.from_orm(user).dict()}


# admin edits another user's account
@router.put("/{user_id}", response_model=dict)
async def admin_update_user(
    user_id: str,
    payload: UserUpdate,
    session: AsyncSession = Depends(get_session),
    current_user = Depends(require_admin_user)
):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    if payload.full_name is not None:
        user.full_name = payload.full_name

    if payload.email is not None:
        user.email = payload.email

    if payload.phone is not None:
        user.phone = payload.phone

    if payload.password:
        user.hashed_password = get_password_hash(payload.password)

    await session.commit()
    await session.refresh(user)

    return {"success": True, "data": UserOut.from_orm(user).dict()}