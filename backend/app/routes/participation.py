from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_session
from app.schemas.participant import ParticipantCreate, ParticipantOut
from app.core.deps import require_admin_user
from app import crud

router = APIRouter(prefix="/api/participants", tags=["Participants"])

@router.post("", response_model=ParticipantOut)
async def register_participant(
    payload: ParticipantCreate,
    session: AsyncSession = Depends(get_session)
):
    return await crud.participant.create_participant(session, payload.model_dump())


@router.get("/{event_id}", response_model=list[ParticipantOut])
async def list_participants(event_id: str, session: AsyncSession = Depends(get_session)):
    return await crud.participant.list_participants(session, event_id)


@router.put("/{participant_id}/assign-role/{role_id}", response_model=ParticipantOut)
async def assign_role(
    participant_id: str,
    role_id: str,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    updated = await crud.participant.assign_role(session, participant_id, role_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Participant not found")
    return updated


@router.delete("/{participant_id}")
async def delete_participant(
    participant_id: str,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    ok = await crud.participant.delete_participant(session, participant_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Participant not found")
    return {"success": True}