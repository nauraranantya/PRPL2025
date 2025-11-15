from fastapi import Depends, Header, HTTPException, status
from app.core.security import decode_token
from app.crud import user as user_crud
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_session

async def get_current_user(
    authorization: str = Header(None),
    session: AsyncSession = Depends(get_session)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization scheme")

    token = authorization.split(" ", 1)[1].strip()

    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload["sub"]
    user = await user_crud.get_by_id(session, user_id)

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")

    return user


async def require_admin_user(
    current_user = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user