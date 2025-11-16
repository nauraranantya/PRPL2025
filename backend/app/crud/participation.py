from app.models.participant import Participant
from sqlalchemy import select

async def create_participant(session, data):
    participant = Participant(**data)
    session.add(participant)
    await session.commit()
    await session.refresh(participant)
    return participant

async def list_participants(session, event_id):
    q = await session.execute(select(Participant).where(Participant.event_id == event_id))
    return q.scalars().all()

async def assign_role(session, participant_id, role_id):
    p = await session.get(Participant, participant_id)
    if not p:
        return None
    p.role_id = role_id
    await session.commit()
    await session.refresh(p)
    return p

async def delete_participant(session, participant_id):
    p = await session.get(Participant, participant_id)
    if not p:
        return None
    await session.delete(p)
    await session.commit()
    return True