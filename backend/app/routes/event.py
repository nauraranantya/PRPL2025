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
from app.schemas.participant import ParticipantAdminCreate, ParticipantOut

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.database.session import get_session
from app.models.event import Event
from app.models.participant import Participant
from app.models.role import Role

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
    
    stmt = (
        select(Event)
        .options(
            selectinload(Event.media),
            selectinload(Event.participants)
        )
        .where(Event.id == ev.id)
    )
    
    result = await session.execute(stmt)
    ev_with_relations = result.scalar_one()
    
    return {"success": True, "data": EventOut.from_orm(ev_with_relations).dict()}



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
    
    stmt = (
        select(Event)
        .where(Event.id == event_id)
        .options(
            selectinload(Event.media),
            selectinload(Event.participants),
            selectinload(Event.recurrence),
        )
    )
    result = await session.execute(stmt)
    ev_full = result.scalar_one()

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
    q: Optional[str] = Query(None, description="Search events by title or description"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    upcoming: Optional[bool] = Query(False),
    session: AsyncSession = Depends(get_session)
):

    offset = (page - 1) * limit

    # --- BASE QUERY with participant count ---
    stmt = (
        select(
            Event,
            func.count(Participant.id).label("participant_count")
        )
        .join(Participant, Participant.event_id == Event.id, isouter=True)
        .group_by(Event.id)
        .order_by(Event.event_date.asc())
        .limit(limit)
        .offset(offset)
        .options(selectinload(Event.media)) 
    )

    # --- FILTER: search ---
    if q:
        stmt = stmt.where(
            (Event.title.ilike(f"%{q}%")) |
            (Event.description.ilike(f"%{q}%"))
        )

    # --- FILTER: upcoming events only ---
    if upcoming:
        from datetime import datetime
        stmt = stmt.where(Event.event_date >= datetime.utcnow())

    result = await session.execute(stmt)
    rows = result.all() 

    # --- Build optimized response ---
    events = []
    for ev, count in rows:

        # Frontend expects: event.media[0].file_url
        media_list = []
        if ev.media:
            media_list = [{"file_url": ev.media[0].file_url}]

        events.append({
            "id": ev.id,
            "title": ev.title,
            "description": ev.description,
            "location": ev.location,
            "event_date": ev.event_date,
            "is_cancelled": ev.is_cancelled,
            "participant_count": count,
            "media": media_list,
        })

    return {
        "success": True,
        "data": events,
        "page": page,
        "limit": limit,
        "count": len(events)
    }

# ---------------------------------------------------------
# GET EVENT BY ID (LOAD MEDIA)
# ---------------------------------------------------------
@router.get("/{event_id}", response_model=dict)
async def get_event_detail(
    event_id: UUID,
    include_participants: bool = Query(False),
    include_roles: bool = Query(False),
    session: AsyncSession = Depends(get_session),
):

    # ---------------------------------------------
    # BASIC EVENT + participant_count
    # ---------------------------------------------
    stmt = (
        select(
            Event,
            func.count(Participant.id).label("participant_count")
        )
        .join(Participant, Participant.event_id == Event.id, isouter=True)
        .where(Event.id == event_id)
        .group_by(Event.id)
        .options(selectinload(Event.media))  # preload only media
    )

    result = await session.execute(stmt)
    row = result.first()

    if not row:
        raise HTTPException(status_code=404, detail="Event not found")

    event, participant_count = row

    # Convert media to lightweight list
    media_list = [{"file_url": m.file_url} for m in event.media] if event.media else []

    # Base response object
    response = {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "location": event.location,
        "event_date": event.event_date,
        "is_cancelled": event.is_cancelled,
        "requires_registration": event.requires_registration,
        "slots_available": event.slots_available,
        "participant_count": participant_count,
        "media": media_list,
    }

    # ---------------------------------------------
    # OPTIONAL: Load participants
    # ---------------------------------------------
    if include_participants:
        stmt_p = (
            select(Participant)
            .where(Participant.event_id == event.id)
            .options(selectinload(Participant.user))
        )
        res_p = await session.execute(stmt_p)
        participants = res_p.scalars().all()

        response["participants"] = [
            {
                "id": p.id,
                "user_id": p.user_id,
                "role_id": p.role_id,
                "registered_at": p.registered_at,
                "user_full_name": p.user.full_name if p.user else None,
                "user_email": p.user.email if p.user else None,
                "user_phone": p.user.phone if p.user else None,
            }
            for p in participants
        ]
    else:
        response["participants"] = None  # keeps frontend consistent

    # ---------------------------------------------
    # OPTIONAL: Load roles
    # ---------------------------------------------
    if include_roles:
        stmt_r = select(Role).where(Role.event_id == event.id)
        res_r = await session.execute(stmt_r)
        roles = res_r.scalars().all()

        response["roles"] = [
            {
                "id": r.id,
                "name": r.name,
                "description": r.description,
            }
            for r in roles
        ]
    else:
        response["roles"] = None

    return {"success": True, "data": response}



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

@router.post("/{event_id}/register-admin", response_model=ParticipantOut)
async def register_participant_by_admin(
    event_id: str,
    payload: ParticipantAdminCreate,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    """Admin endpoint to register a new user and add them to an event"""
    from app import crud as user_crud
    
    # Validate: name is required, and at least email or phone
    if not payload.full_name or not payload.full_name.strip():
        raise HTTPException(status_code=400, detail="Nama wajib diisi")
    
    if not payload.email and not payload.phone:
        raise HTTPException(status_code=400, detail="Email atau No. Telepon wajib diisi")
    
    # Check if user exists
    user = None
    if payload.email:
        user = await user_crud.user.get_by_email(session, payload.email)
    if not user and payload.phone:
        user = await user_crud.user.get_by_phone(session, payload.phone)
    
    # Create user if doesn't exist
    if not user:
        if payload.email:
            # Create with email
            user = await user_crud.user.create_user_with_email(
                session, 
                email=payload.email,
                password="defaultpassword123",  # Or generate random password
                full_name=payload.full_name
            )
        else:
            # Create with phone
            user = await user_crud.user.create_user_with_phone(
                session,
                phone=payload.phone,
                password="defaultpassword123"
            )
            # Update full_name if needed
            user.full_name = payload.full_name
            await session.commit()
            await session.refresh(user)
    
    # Register user for event
    participant_data = {
        "event_id": event_id,
        "user_id": str(user.id),
        "role_id": None
    }
    
    return await crud.participation.create_participant(session, participant_data)

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

