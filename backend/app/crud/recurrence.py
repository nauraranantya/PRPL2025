from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.recurrence import Recurrence

async def create_recurrence(session: AsyncSession, data):
    rec = Recurrence(**data)
    session.add(rec)
    await session.commit()
    await session.refresh(rec)
    return rec

async def get_by_event(session: AsyncSession, event_id):
    stmt = select(Recurrence).where(Recurrence.event_id == event_id)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()

async def get(session: AsyncSession, id):
    return await session.get(Recurrence, id)

async def list_recurrences(session: AsyncSession):
    result = await session.execute(select(Recurrence))
    return result.scalars().all()

async def update_recurrence(session: AsyncSession, id, updates: dict):
    rec = await session.get(Recurrence, id)
    if not rec:
        return None

    for k, v in updates.items():
        setattr(rec, k, v)

    await session.commit()
    await session.refresh(rec)
    return rec

async def delete_recurrence(session: AsyncSession, id):
    rec = await session.get(Recurrence, id)
    if not rec:
        return None
    await session.delete(rec)
    await session.commit()
    return True