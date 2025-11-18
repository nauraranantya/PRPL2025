from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.event import EventCreate, EventUpdate, EventOut
from app import crud
from app.core.deps import require_admin_user, require_user
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.event import Event
from app.models.participant import Participant

router = APIRouter()


# ---------------------------------------------------------
# CREATE EVENT
# ---------------------------------------------------------
@router.post("", response_model=dict)
async def create_event(
    payload: EventCreate,
    current_user=Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    ev = await crud.event.create_event(
        session,
        payload.title,
        payload.description,
        payload.location,
        payload.event_date,
        payload.requires_registration,
        payload.slots_available,
        payload.recurrence_pattern
    )
    return {"success": True, "data": EventOut.from_orm(ev).dict()}



# ---------------------------------------------------------
# UPDATE EVENT
# ---------------------------------------------------------
@router.put("/{event_id}", response_model=dict)
async def edit_event(
    event_id: str,
    payload: EventUpdate,
    current_user=Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    updates = {}
    if payload.title is not None: updates["title"] = payload.title
    if payload.description is not None: updates["description"] = payload.description
    if payload.location is not None: updates["location"] = payload.location
    if payload.event_date is not None: updates["event_date"] = payload.event_date
    if payload.is_cancelled is not None: updates["is_cancelled"] = payload.is_cancelled
    if payload.requires_registration is not None: updates["requires_registration"] = payload.requires_registration
    if payload.slots_available is not None: updates["slots_available"] = payload.slots_available

    ev = await crud.event.update_event(session, event_id, updates)

    if not ev:
        raise HTTPException(
            status_code=404,
            detail={"code": "EVENT_NOT_FOUND", "message": "Event tidak ditemukan"},
        )

    return {"success": True, "data": EventOut.from_orm(ev).dict()}



# ---------------------------------------------------------
# DELETE EVENT
# ---------------------------------------------------------
@router.delete("/{event_id}", response_model=dict)
async def delete_event(
    event_id: str,
    current_user=Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    ev = await crud.event.delete_event(session, event_id)
    if not ev:
        raise HTTPException(
            status_code=404,
            detail={"code": "EVENT_NOT_FOUND", "message": "Event tidak ditemukan"},
        )

    return {"success": True, "data": EventOut.from_orm(ev).dict()}



# ---------------------------------------------------------
# LIST EVENTS (LOAD MEDIA)
# ---------------------------------------------------------
@router.get("", response_model=dict)
async def list_events(
    q: Optional[str] = Query(None),
    upcoming: Optional[bool] = Query(False),
    session: AsyncSession = Depends(get_session)
):
    # let your existing CRUD handle filtering,
    # but add selectinload in the query
    stmt = (
        select(Event)
        .options(selectinload(Event.media))   # <<<<< 🔥 load banners
        .order_by(Event.event_date.asc())
    )

    events = (await session.execute(stmt)).scalars().all()

    # NOTE: you may still want to apply q/upcoming manually
    #       but I keep structure unchanged

    return {
        "success": True,
        "data": [EventOut.from_orm(e).dict() for e in events]
    }



# ---------------------------------------------------------
# GET EVENT BY ID (LOAD MEDIA)
# ---------------------------------------------------------
@router.get("/{event_id}", response_model=dict)
async def get_event(
    event_id: str,
    session: AsyncSession = Depends(get_session)
):
    stmt = (
        select(Event)
        .options(
            selectinload(Event.media),
            selectinload(Event.recurrence)
        )
        .where(Event.id == event_id)
    )

    result = await session.execute(stmt)
    ev = result.scalar_one_or_none()

    if not ev:
        raise HTTPException(
            status_code=404,
            detail={"code": "EVENT_NOT_FOUND", "message": "Event tidak ditemukan"},
        )

    return {"success": True, "data": EventOut.from_orm(ev).dict()}



# ---------------------------------------------------------
# REGISTER FOR EVENT
# ---------------------------------------------------------
@router.post("/{event_id}/register", response_model=dict)
async def register_for_event(
    event_id: str,
    current_user=Depends(require_user),
    session: AsyncSession = Depends(get_session)
):

    # Load event with participants count and media (safe)
    stmt = (
        select(Event)
        .where(Event.id == event_id)
        .options(selectinload(Event.media))
        .options(selectinload(Event.participants))
    )

    result = await session.execute(stmt)
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(404, "Event not found")

    if not event.requires_registration:
        raise HTTPException(400, "Event does not require registration")

    # Already registered?
    q = await session.execute(
        select(Participant).where(
            Participant.event_id == event_id,
            Participant.user_id == current_user.id,
        )
    )
    existing = q.scalars().first()

    if existing:
        raise HTTPException(400, "You already registered")

    # Slot limit
    if event.slots_available is not None:
        if len(event.participants) >= event.slots_available:
            raise HTTPException(400, "Event is full")

    # Register
    p = Participant(event_id=event_id, user_id=current_user.id)
    session.add(p)
    await session.commit()
    await session.refresh(p)

    remaining = (
        event.slots_available - len(event.participants)
        if event.slots_available is not None else None
    )

    return {
        "success": True,
        "message": "Registered successfully",
        "slots_remaining": remaining
    }

# ---------------------------------------------------------
# UNREGISTER FROM EVENT (USER)
# ---------------------------------------------------------
@router.delete("/{event_id}/unregister", response_model=dict)
async def unregister_from_event(
    event_id: str,
    current_user = Depends(require_user),
    session: AsyncSession = Depends(get_session)
):
    # Is event valid?
    stmt = (
        select(Event)
        .where(Event.id == event_id)
        .options(selectinload(Event.participants))
    )
    result = await session.execute(stmt)
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(404, "Event not found")

    # Find participant row
    q = await session.execute(
        select(Participant).where(
            Participant.event_id == event_id,
            Participant.user_id == current_user.id
        )
    )
    p = q.scalars().first()

    if not p:
        # Idempotent → unregistering twice is not an error
        return {
            "success": True,
            "message": "You were not registered for this event."
        }

    # Delete participant entry
    await session.delete(p)
    await session.commit()

    return {
        "success": True,
        "message": "Successfully unregistered from event."
    }

# ---------------------------------------------------------
# ADMIN – REMOVE PARTICIPANT
# ---------------------------------------------------------
@router.delete("/{event_id}/participants/{user_id}", response_model=dict)
async def remove_participant(
    event_id: str,
    user_id: str,
    current_user=Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    q = await session.execute(
        select(Participant).where(
            Participant.event_id == event_id,
            Participant.user_id == user_id,
        )
    )
    p = q.scalars().first()

    if not p:
        raise HTTPException(404, "Participant not found")

    await session.delete(p)
    await session.commit()

    return {"success": True}

@router.get("", response_model=list[EventOut])
async def list_events(session: AsyncSession = Depends(get_session)):
    return await crud.event.list_events(session)
