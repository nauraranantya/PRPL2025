from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from app.models.event import Event
from typing import List, Optional

async def create_event(session: AsyncSession, title, description, location, event_date):
    ev = Event(title=title, description=description, location=location, event_date=event_date)
    session.add(ev)
    await session.commit()
    await session.refresh(ev)
    return ev

async def update_event(session: AsyncSession, ev: Event, **kwargs):
    for k,v in kwargs.items():
        if v is not None:
            if k=='event_date':
                setattr(ev,'event_date',v)
            else:
                setattr(ev,k,v)
    await session.commit()
    await session.refresh(ev)
    return ev

async def delete_event(session: AsyncSession, ev: Event):
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
