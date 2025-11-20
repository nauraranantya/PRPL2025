from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.recurrence import Recurrence


# ---------------------------------------------------------
# CREATE
# ---------------------------------------------------------
async def create_recurrence(session: AsyncSession, data):
    rec = Recurrence(**data)
    session.add(rec)
    await session.commit()
    await session.refresh(rec)
    return rec


# ---------------------------------------------------------
# GET ONE BY EVENT (return ALL recurrences, not only first)
# Frontend expects list, backend uses first[0] if needed
# ---------------------------------------------------------
async def get_by_event(session: AsyncSession, event_id):
    stmt = (
        select(Recurrence)
        .where(Recurrence.event_id == event_id)
        .order_by(Recurrence.created_at.asc())
    )
    result = await session.execute(stmt)
    return result.scalars().all()


# ---------------------------------------------------------
# GET BY ID
# ---------------------------------------------------------
async def get(session: AsyncSession, id):
    return await session.get(Recurrence, id)


# ---------------------------------------------------------
# LIST ALL
# ---------------------------------------------------------
async def list_recurrences(session: AsyncSession):
    result = await session.execute(
        select(Recurrence).order_by(Recurrence.created_at.desc())
    )
    return result.scalars().all()


# ---------------------------------------------------------
# UPDATE
# ---------------------------------------------------------
async def update_recurrence(session: AsyncSession, id, updates: dict):
    rec = await session.get(Recurrence, id)
    if not rec:
        return None

    for key, value in updates.items():
        setattr(rec, key, value)

    await session.commit()
    await session.refresh(rec)
    return rec


# ---------------------------------------------------------
# DELETE
# ---------------------------------------------------------
async def delete_recurrence(session: AsyncSession, id):
    rec = await session.get(Recurrence, id)
    if not rec:
        return None

    await session.delete(rec)
    await session.commit()
    return True