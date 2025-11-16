from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.core.security import get_password_hash, verify_password

async def get_by_email(session: AsyncSession, email: str):
    result = await session.execute(
        select(User).where(User.email == email)
    )
    return result.scalar_one_or_none()

async def get_by_phone(session: AsyncSession, phone: str):
    result = await session.execute(
        select(User).where(User.phone == phone)
    )
    return result.scalar_one_or_none()

async def get_by_id(session: AsyncSession, user_id: str):
    return await session.get(User, user_id)

async def create_user_with_email(session: AsyncSession, email: str, password: str, full_name: str):
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=full_name,
        is_admin=False,
    )
    session.add(user)
    await session.commit()       # VERY IMPORTANT
    await session.refresh(user)  # Ensure latest values (id, timestamps)
    return user

async def create_user_with_phone(session: AsyncSession, phone: str, password: str):
    user = User(
        phone=phone,
        hashed_password=get_password_hash(password),
        is_admin=False,
    )
    session.add(user)
    await session.commit()       # VERY IMPORTANT
    await session.refresh(user)
    return user