# app/routes/event.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from app.database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.event import EventCreate, EventUpdate, EventOut
from app import crud
from app.core.deps import require_admin_user, require_user
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.event import Event
from app.models.participant import Participant
from app.schemas.participant import ParticipantAdminCreate, ParticipantOut

router = APIRouter()

# Helper: re-query event with relationships loaded
async def load_event_with_relations(session: AsyncSession, event_id: str) -> Optional[Event]:
    stmt = (
        select(Event)
        .where(Event.id == event_id)
        .options(
            selectinload(Event.media),
            selectinload(Event.participants),
            selectinload(Event.recurrence),
            selectinload(Event.roles),
            selectinload(Event.schedules),
            selectinload(Event.attendances),
        )
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()

# CREATE EVENT
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

    ev_full = await load_event_with_relations(session, str(ev.id))
    return {"success": True, "data": EventOut.from_orm(ev_full).dict()}

# UPDATE EVENT
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
    if payload.recurrence_pattern is not None: updates["recurrence_pattern"] = payload.recurrence_pattern

    ev = await crud.event.update_event(session, event_id, updates)

    if not ev:
        raise HTTPException(
            status_code=404,
            detail={"code": "EVENT_NOT_FOUND", "message": "Event tidak ditemukan"},
        )

    # Re-query with relationships eagerly loaded BEFORE serializing
    ev_full = await load_event_with_relations(session, event_id)
    return {"success": True, "data": EventOut.from_orm(ev_full).dict()}

# DELETE EVENT
@router.delete("/{event_id}", response_model=dict)
async def delete_event(
    event_id: str,
    current_user=Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    # Fetch before deleting so Pydantic doesn't try to lazy load after deletion
    ev_full = await load_event_with_relations(session, event_id)
    if not ev_full:
        raise HTTPException(
            status_code=404,
            detail={"code": "EVENT_NOT_FOUND", "message": "Event tidak ditemukan"},
        )

    deleted = await crud.event.delete_event(session, event_id)
    if not deleted:
        # If your crud.delete_event returns False on failure
        raise HTTPException(
            status_code=500,
            detail={"code": "DELETE_FAILED", "message": "Failed to delete event"},
        )

    return {"success": True, "data": EventOut.from_orm(ev_full).dict()}

# LIST EVENTS
@router.get("", response_model=dict)
async def list_events(
    q: Optional[str] = Query(None),
    upcoming: Optional[bool] = Query(False),
    session: AsyncSession = Depends(get_session)
):
    stmt = (
        select(Event)
        .options(
            selectinload(Event.media),
            selectinload(Event.participants)
        )
        .order_by(Event.event_date.asc())
    )

    events = (await session.execute(stmt)).scalars().all()

    return {
        "success": True,
        "data": [EventOut.from_orm(e).dict() for e in events]
    }

# GET EVENT BY ID
@router.get("/{event_id}", response_model=dict)
async def get_event(event_id: str, session: AsyncSession = Depends(get_session)):
    ev = await load_event_with_relations(session, event_id)

    if not ev:
        raise HTTPException(
            status_code=404,
            detail={"code": "EVENT_NOT_FOUND", "message": "Event tidak ditemukan"},
        )

    return {"success": True, "data": EventOut.from_orm(ev).dict()}

# REGISTER FOR EVENT
@router.post("/{event_id}/register", response_model=dict)
async def register_for_event(
    event_id: str,
    current_user=Depends(require_user),
    session: AsyncSession = Depends(get_session)
):
    # Load event with participants count and media (safe)
    event = await load_event_with_relations(session, event_id)

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

    # Re-load event to get updated participants safely if needed
    event = await load_event_with_relations(session, event_id)
    remaining = (
        event.slots_available - len(event.participants)
        if event.slots_available is not None else None
    )

    return {
        "success": True,
        "message": "Registered successfully",
        "slots_remaining": remaining
    }

# ADMIN – register a participant by admin (unchanged logic but ensure returns are safe)
@router.post("/{event_id}/register-admin", response_model=ParticipantOut)
async def register_participant_by_admin(
    event_id: str,
    payload: ParticipantAdminCreate,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    from app import crud as user_crud
    
    # Validation
    if not payload.full_name or not payload.full_name.strip():
        raise HTTPException(status_code=400, detail="Nama wajib diisi")
    if not payload.email and not payload.phone:
        raise HTTPException(status_code=400, detail="Email atau No. Telepon wajib diisi")
    
    user = None
    if payload.email:
        user = await user_crud.user.get_by_email(session, payload.email)
    if not user and payload.phone:
        user = await user_crud.user.get_by_phone(session, payload.phone)
    
    if not user:
        if payload.email:
            user = await user_crud.user.create_user_with_email(
                session, 
                email=payload.email,
                password="defaultpassword123",
                full_name=payload.full_name
            )
        else:
            user = await user_crud.user.create_user_with_phone(
                session,
                phone=payload.phone,
                password="defaultpassword123"
            )
            user.full_name = payload.full_name
            await session.commit()
            await session.refresh(user)
    
    participant_data = {
        "event_id": event_id,
        "user_id": str(user.id),
        "role_id": None
    }
    
    return await crud.participation.create_participant(session, participant_data)

# UNREGISTER (USER)
@router.delete("/{event_id}/unregister", response_model=dict)
async def unregister_from_event(
    event_id: str,
    current_user = Depends(require_user),
    session: AsyncSession = Depends(get_session)
):
    event = await load_event_with_relations(session, event_id)

    if not event:
        raise HTTPException(404, "Event not found")

    q = await session.execute(
        select(Participant).where(
            Participant.event_id == event_id,
            Participant.user_id == current_user.id
        )
    )
    p = q.scalars().first()

    if not p:
        return {
            "success": True,
            "message": "You were not registered for this event."
        }

    await session.delete(p)
    await session.commit()

    return {
        "success": True,
        "message": "Successfully unregistered from event."
    }

# ADMIN – REMOVE PARTICIPANT
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