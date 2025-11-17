from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_session
from app.core.deps import require_admin_user
from app.schemas.auth import UserOut
from app.models.user import User
from sqlalchemy import select

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