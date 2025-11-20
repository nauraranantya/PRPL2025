from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_session
from app.schemas.participant import ParticipantCreate, ParticipantOut
from app.core.deps import require_admin_user
from app import crud
from uuid import UUID
from fastapi import Body
from typing import Optional

router = APIRouter()

@router.post("", response_model=ParticipantOut)
async def register_participant(
    payload: ParticipantCreate,
    session: AsyncSession = Depends(get_session)
):
    return await crud.participation.create_participant(session, payload.model_dump())


@router.get("/{event_id}")
async def list_participants(event_id: str, session: AsyncSession = Depends(get_session)):
    rows = await crud.participation.list_participants_with_user(session, event_id)
    return rows


@router.put("/{participant_id}/assign-role/{role_id}", response_model=ParticipantOut)
async def assign_role(
    participant_id: str,
    role_id: str,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    updated = await crud.participation.assign_role(session, participant_id, role_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Participant not found")
    return updated

@router.put("/{participant_id}/unassign-role", response_model=ParticipantOut)
async def unassign_role(
    participant_id: str,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    updated = await crud.participation.unassign_role(session, participant_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Participant not found")
    return updated


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

    # 1. Check if user exists
    user = await crud.user.find_by_email_or_phone(session, email, phone)

    # 2. If user not found → create new villager account
    if not user:
        user = await crud.user.create_user(session, {
            "full_name": name,
            "email": email,
            "phone": phone,
            "is_admin": False,
        })

    # 3. Register user into the event
    data = {
        "event_id": event_id,
        "user_id": user.id,
        "role_id": role_id,
    }
    participant = await crud.participation.create_participant(session, data)

    return participant