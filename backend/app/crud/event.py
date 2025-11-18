from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload
from typing import Optional
from app.models.event import Event


# ---------------------------------------------------------
# CREATE EVENT
# ---------------------------------------------------------
async def create_event(
    session,
    title,
    description,
    location,
    event_date,
    requires_registration=False,
    slots_available=None,
    recurrence_pattern=None
):
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

    # optional recurrence creation
    if recurrence_pattern:
        from app.models.recurrence import Recurrence

        rec = Recurrence(
            event_id=new_event.id,
            pattern=recurrence_pattern.lower(),
            active=True,
            next_run=event_date,
        )
        session.add(rec)
        await session.commit()

    return new_event



# ---------------------------------------------------------
# UPDATE EVENT
# ---------------------------------------------------------
async def update_event(session: AsyncSession, event_id: str, update_data: dict):
    stmt = (
        select(Event)
        .where(Event.id == event_id)
        .options(selectinload(Event.media))   # ensure media loaded on refresh
    )

    result = await session.execute(stmt)
    ev = result.scalar_one_or_none()

    if ev is None:
        return None

    for key, value in update_data.items():
        if value is not None:
            setattr(ev, key, value)

    await session.commit()
    await session.refresh(ev)
    return ev



# ---------------------------------------------------------
# DELETE EVENT
# ---------------------------------------------------------
async def delete_event(session: AsyncSession, event_id: str):
    stmt = select(Event).where(Event.id == event_id)
    result = await session.execute(stmt)
    ev = result.scalar_one_or_none()

    if ev is None:
        return None

    await session.delete(ev)
    await session.commit()
    return ev



# ---------------------------------------------------------
# LIST EVENTS (WITH MEDIA PRELOADED)
# ---------------------------------------------------------
async def list_events(
    session: AsyncSession,
    q: Optional[str] = None,
    upcoming: bool = False
):
    stmt = (
        select(Event)
        .options(
            selectinload(Event.media),         # posters
            selectinload(Event.recurrence)     # recurrence object
        )
    )

    # filter: upcoming only
    if upcoming:
        stmt = stmt.where(Event.event_date >= func.now())

    # filter: search
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            or_(Event.title.ilike(like), Event.description.ilike(like))
        )

    result = await session.execute(stmt)
    return result.scalars().all()