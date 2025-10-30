from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.announcement import Announcement

async def create_announcement(session: AsyncSession, title, body):
    a = Announcement(title=title, body=body)
    session.add(a)
    await session.commit()
    await session.refresh(a)
    return a

async def list_announcements(session: AsyncSession):
    stmt = select(Announcement).order_by(Announcement.created_at.desc()).limit(50)
    result = await session.execute(stmt)
    return result.scalars().all()
