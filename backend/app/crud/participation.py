from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.participant import Participant


# ---------------------------------------------------------
# CREATE
# ---------------------------------------------------------
async def create_participant(session: AsyncSession, data):
    participant = Participant(**data)
    session.add(participant)
    await session.commit()
    await session.refresh(participant)
    return participant


# ---------------------------------------------------------
# LIST BY EVENT
# ---------------------------------------------------------
async def list_participants(session: AsyncSession, event_id: str):
    q = await session.execute(
        select(Participant).where(Participant.event_id == event_id)
    )
    return q.scalars().all()


# ---------------------------------------------------------
# ASSIGN ROLE
# ---------------------------------------------------------
async def assign_role(session: AsyncSession, participant_id: str, role_id: str):
    p = await session.get(Participant, participant_id)
    if not p:
        return None

    p.role_id = role_id
    await session.commit()
    await session.refresh(p)
    return p


# ---------------------------------------------------------
# UNASSIGN ROLE (clean single version)
# ---------------------------------------------------------
async def unassign_role(session: AsyncSession, participant_id: str):
    p = await session.get(Participant, participant_id)
    if not p:
        return None

    p.role_id = None
    await session.commit()
    await session.refresh(p)
    return p


# ---------------------------------------------------------
# DELETE
# ---------------------------------------------------------
async def delete_participant(session: AsyncSession, participant_id: str):
    p = await session.get(Participant, participant_id)
    if not p:
        return None

    await session.delete(p)
    await session.commit()
    return True