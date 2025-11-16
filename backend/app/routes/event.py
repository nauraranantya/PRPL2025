from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.event import EventCreate, EventUpdate, EventOut
from app import crud
from app.core.deps import require_admin_user, require_user
from sqlalchemy import select

router = APIRouter()

@router.post('', response_model=dict)
async def create_event(payload: EventCreate, current_user=Depends(require_admin_user), session: AsyncSession = Depends(get_session)):
    ev = await crud.event.create_event(session, payload.title, payload.description, payload.location, payload.event_date, payload.requires_registration, payload.slots_available, payload.recurrence_pattern)
    return {'success': True, 'data': EventOut.from_orm(ev).dict()}

@router.put('/{event_id}', response_model=dict)
async def edit_event(event_id: str, payload: EventUpdate, current_user=Depends(require_admin_user), session: AsyncSession = Depends(get_session)):
    updates = {}
    if payload.title is not None: updates['title']=payload.title
    if payload.description is not None: updates['description']=payload.description
    if payload.location is not None: updates['location']=payload.location
    if payload.event_date is not None: updates['event_date']=payload.event_date
    if payload.is_cancelled is not None: updates['is_cancelled']=payload.is_cancelled
    ev = await crud.event.update_event(session, event_id, updates)
    if not ev:
        raise HTTPException(status_code=404, detail={'code':'EVENT_NOT_FOUND','message':'Event tidak ditemukan'})
    return {'success': True, 'data': EventOut.from_orm(ev).dict()}

@router.delete('/{event_id}', response_model=dict)
async def delete_event(event_id: str, current_user=Depends(require_admin_user), session: AsyncSession = Depends(get_session)):
    ev = await crud.event.delete_event(session, event_id)
    if not ev:
        raise HTTPException(status_code=404, detail={'code':'EVENT_NOT_FOUND','message':'Event tidak ditemukan'})
    return {'success': True, 'data': EventOut.from_orm(ev).dict()}

@router.get('', response_model=dict)
async def list_events(q: Optional[str] = Query(None), upcoming: Optional[bool] = Query(False), session: AsyncSession = Depends(get_session)):
    events = await crud.event.list_events(session, q, upcoming)
    return {'success': True, 'data': [EventOut.from_orm(e).dict() for e in events]}

@router.get('/{event_id}', response_model=dict)
async def get_event(event_id: str, session: AsyncSession = Depends(get_session)):
    from app.models.event import Event
    ev = await session.get(Event, event_id)
    if not ev:
        raise HTTPException(status_code=404, detail={'code':'EVENT_NOT_FOUND','message':'Event tidak ditemukan'})
    return {'success': True, 'data': EventOut.from_orm(ev).dict()}

@router.post("/{event_id}/register", response_model=dict)
async def register_for_event(
    event_id: str,
    current_user = Depends(require_user),
    session: AsyncSession = Depends(get_session)
):
    from app.models.event import Event
    from app.models.participant import Participant

    event = await session.get(Event, event_id)
    if not event:
        raise HTTPException(404, "Event not found")

    # registration disabled
    if not event.requires_registration:
        raise HTTPException(400, "Event does not require registration")

    # check if already registered
    q = await session.execute(
        select(Participant).where(
            Participant.event_id == event_id,
            Participant.user_id == current_user.id
        )
    )
    existing = q.scalars().first()
    if existing:
        raise HTTPException(400, "You already registered")

    # enforce slots
    if event.slots_available is not None:
        total = len(event.participants)
        if total >= event.slots_available:
            raise HTTPException(400, "Event is full")

    # create registration
    p = Participant(event_id=event_id, user_id=current_user.id)
    session.add(p)
    await session.commit()
    await session.refresh(p)

    return {
        "success": True,
        "message": "Registered successfully",
        "slots_remaining": event.slots_remaining,
    }

@router.delete("/{event_id}/participants/{user_id}", response_model=dict)
async def remove_participant(event_id: str, user_id: str, current_user=Depends(require_admin_user), session: AsyncSession = Depends(get_session)):
    from app.models.participant import Participant

    q = await session.execute(
        select(Participant).where(
            Participant.event_id == event_id,
            Participant.user_id == user_id
        )
    )
    p = q.scalars().first()

    if not p:
        raise HTTPException(404, "Participant not found")

    await session.delete(p)
    await session.commit()

    return {"success": True}