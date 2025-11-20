from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.participant import Participant
from fastapi import HTTPException
from app.models.user import User


# ---------------------------------------------------------
# CREATE
# ---------------------------------------------------------
async def create_participant(session, data):
    # Prevent duplicates
    existing = await session.execute(
        select(Participant).where(
            Participant.event_id == data["event_id"],
            Participant.user_id == data["user_id"],
        )
    )
    if existing.scalars().first():
        raise HTTPException(400, "User already registered in event")

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
        select(Participant, User.full_name, User.email, User.phone)
        .join(User, Participant.user_id == User.id)
        .where(Participant.event_id == event_id)
    )
    
    results = []
    for row in q.all():
        participant = row[0]
        results.append({
            "id": participant.id,
            "event_id": participant.event_id,
            "user_id": participant.user_id,
            "role_id": participant.role_id,
            "registered_at": participant.registered_at,
            "user_full_name": row[1],  
            "user_email": row[2],       
            "user_phone": row[3],       
        })
    
    return results

async def list_participants_with_user(session, event_id: str):
    q = await session.execute(
        select(
            Participant.id,
            Participant.event_id,
            Participant.user_id,
            Participant.role_id,
            Participant.registered_at,
            User.full_name,
            User.email,
            User.phone
        ).join(User, User.id == Participant.user_id)
        .where(Participant.event_id == event_id)
    )
    rows = q.all()
    return [
        {
            "id": r.id,
            "event_id": r.event_id,
            "user_id": r.user_id,
            "role_id": r.role_id,
            "registered_at": r.registered_at,
            "user_full_name": r.full_name,
            "user_email": r.email,
            "user_phone": r.phone,
        }
        for r in rows
    ]

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