from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from app.models.event import Event
from typing import List, Optional

async def create_event(session, title, description, location, event_date, requires_registration=False, slots_available=None, recurrence_pattern=None):
    new_event = Event(
        title=title,
        description=description,
        location=location,
        event_date=event_date,
        requires_registration=requires_registration,
        slots_available=slots_available,
    )
    session.add(new_event)
    await session.commit()
    await session.refresh(new_event)
    if recurrence_pattern:
        from app.models.recurrence import Recurrence

        rec = Recurrence(
            event_id=new_event.id,
            pattern=recurrence_pattern.lower(),
            active=True,
            next_run=event_date,  # start next_run at initial date
        )
        session.add(rec)
        await session.commit()

    return new_event

async def update_event(session: AsyncSession, event_id: int, update_data: dict):
    stmt = select(Event).where(Event.id == event_id)
    result = await session.execute(stmt)
    ev = result.scalar_one_or_none()
    if ev is None:
        return None
    for k, v in update_data.items():
        if v is not None:
            setattr(ev, k, v)
    await session.commit()
    await session.refresh(ev)
    return ev

async def delete_event(session: AsyncSession, event_id: int):
    stmt = select(Event).where(Event.id == event_id)
    result = await session.execute(stmt)
    ev = result.scalar_one_or_none()
    if ev is None:
        return None
    await session.delete(ev)
    await session.commit()
    return ev

async def list_events(session: AsyncSession, q: Optional[str]=None, upcoming: bool=False):
    stmt = select(Event)
    if upcoming:
        stmt = stmt.where(Event.event_date >= func.now())
    if q:
        like = f'%{q}%'
        stmt = stmt.where(or_(Event.title.ilike(like), Event.description.ilike(like)))
    stmt = stmt.order_by(Event.event_date.asc()).limit(100)
    result = await session.execute(stmt)
    return result.scalars().all()
