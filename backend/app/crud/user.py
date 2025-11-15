from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from typing import Optional
from passlib.context import CryptContext
from uuid import UUID

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_by_email(session: AsyncSession, email: str) -> Optional[User]:
    result = await session.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_by_phone(session: AsyncSession, phone: str) -> Optional[User]:
    result = await session.execute(select(User).where(User.phone == phone))
    return result.scalars().first()

async def get_by_id(session: AsyncSession, user_id: str) -> Optional[User]:
    result = await session.execute(select(User).where(User.id == user_id))
    return result.scalars().first()

async def create_user_with_email(session: AsyncSession, email: str, password: str, is_admin: bool=False) -> User:
    hashed = pwd_context.hash(password)
    user = User(email=email, hashed_password=hashed, is_admin=is_admin)
    session.add(user)
    await session.flush()
    await session.refresh(user)
    return user

async def create_user_with_phone(session: AsyncSession, phone: str, password: str) -> User:
    hashed = pwd_context.hash(password)
    user = User(phone=phone, hashed_password=hashed)
    session.add(user)
    await session.flush()
    await session.refresh(user)
    return user

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)