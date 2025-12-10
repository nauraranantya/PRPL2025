from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_session
from app.schemas.participant import ParticipantCreate, ParticipantOut
from app.core.deps import require_admin_user
from app.models.participant import Participant
from app import crud
from uuid import UUID
from fastapi import Body
from typing import Optional
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import selectinload

router = APIRouter()

@router.post("", response_model=ParticipantOut)
async def register_participant(payload: ParticipantCreate, session: AsyncSession = Depends(get_session)):
    p = await crud.participation.create_participant(session, payload.model_dump())

    stmt = (
        select(Participant)
        .where(Participant.id == p.id)
        .options(selectinload(Participant.user))
    )
    result = await session.execute(stmt)
    p = result.scalar_one()

    return ParticipantOut(
        id=p.id,
        event_id=p.event_id,
        user_id=p.user_id,
        role_id=p.role_id,
        registered_at=p.registered_at,
        user_full_name=p.user.full_name if p.user else None,
        user_email=p.user.email if p.user else None,
        user_phone=p.user.phone if p.user else None
    )


@router.get("/{event_id}", response_model=List[ParticipantOut])
async def list_participants(event_id: str, session: AsyncSession = Depends(get_session)):
    stmt = (
        select(Participant)
        .where(Participant.event_id == event_id)
        .options(
            selectinload(Participant.user)  
        )
    )
    
    result = await session.execute(stmt)
    participants = result.scalars().all()

    return [
        ParticipantOut(
            id=p.id,
            event_id=p.event_id,
            user_id=p.user_id,
            role_id=p.role_id,
            registered_at=p.registered_at,
            user_full_name=p.user.full_name if p.user else None,
            user_email=p.user.email if p.user else None,
            user_phone=p.user.phone if p.user else None
        )
        for p in participants
    ]


@router.put("/{participant_id}/assign-role/{role_id}", response_model=ParticipantOut)
async def assign_role(
    participant_id: str,
    role_id: str,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    updated = await crud.participation.assign_role(session, participant_id, role_id)

    if not updated:
        raise HTTPException(404, "Participant not found")

    stmt = (
        select(Participant)
        .where(Participant.id == updated.id)
        .options(selectinload(Participant.user))
    )
    result = await session.execute(stmt)
    p = result.scalar_one()

    return ParticipantOut(
        id=p.id,
        event_id=p.event_id,
        user_id=p.user_id,
        role_id=p.role_id,
        registered_at=p.registered_at,
        user_full_name=p.user.full_name if p.user else None,
        user_email=p.user.email if p.user else None,
        user_phone=p.user.phone if p.user else None
    )

@router.put("/{participant_id}/unassign-role", response_model=ParticipantOut)
async def unassign_role(
    participant_id: str,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    updated = await crud.participation.unassign_role(session, participant_id)

    if not updated:
        raise HTTPException(404, "Participant not found")

    stmt = (
        select(Participant)
        .where(Participant.id == updated.id)
        .options(selectinload(Participant.user))
    )
    result = await session.execute(stmt)
    p = result.scalar_one()

    return ParticipantOut(
        id=p.id,
        event_id=p.event_id,
        user_id=p.user_id,
        role_id=p.role_id,
        registered_at=p.registered_at,
        user_full_name=p.user.full_name if p.user else None,
        user_email=p.user.email if p.user else None,
        user_phone=p.user.phone if p.user else None
    )


@router.delete("/{participant_id}")
async def delete_participant(
    participant_id: str,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    ok = await crud.participation.delete_participant(session, participant_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Participant not found")
    return {"success": True}

@router.post("/admin/register", response_model=ParticipantOut)
async def admin_register_participant(
    event_id: UUID = Body(...),
    name: str = Body(...),
    email: str = Body(...),
    phone: str = Body(...),
    role_id: Optional[UUID] = Body(None),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(require_admin_user)
):
    """
    Admin registers a user into an event using name/email/phone.
    If the user does not exist, system automatically creates them.
    """

    user = await crud.user.find_by_email_or_phone(session, email, phone)

    if not user:
        user = await crud.user.create_user(session, {
            "full_name": name,
            "email": email,
            "phone": phone,
            "is_admin": False,
        })

    participant_data = {
        "event_id": event_id,
        "user_id": user.id,
        "role_id": role_id,
    }

    participant = await crud.participation.create_participant(session, participant_data)

    stmt = (
        select(Participant)
        .where(Participant.id == participant.id)
        .options(selectinload(Participant.user))
    )
    result = await session.execute(stmt)
    p = result.scalar_one()

    return ParticipantOut(
        id=p.id,
        event_id=p.event_id,
        user_id=p.user_id,
        role_id=p.role_id,
        registered_at=p.registered_at,
        user_full_name=p.user.full_name if p.user else None,
        user_email=p.user.email if p.user else None,
        user_phone=p.user.phone if p.user else None,
    )