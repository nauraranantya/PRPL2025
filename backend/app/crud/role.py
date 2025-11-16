from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from app.models.role import Role
from app.models.participant import Participant

async def create_role(session: AsyncSession, role_data: dict):
    role = Role(**role_data)
    session.add(role)
    await session.commit()
    await session.refresh(role)
    return role

async def list_roles(session: AsyncSession, event_id: str):
    result = await session.execute(select(Role).where(Role.event_id == event_id))
    return result.scalars().all()

async def delete_role(session: AsyncSession, role_id: str):
    result = await session.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        return None
    await session.delete(role)
    await session.commit()
    return role

async def update_role(session: AsyncSession, role_id: str, data: dict):
    query = (
        update(Role)
        .where(Role.id == role_id)
        .values(**data)
        .returning(Role)
    )
    result = await session.execute(query)
    updated = result.fetchone()

    await session.commit()
    return updated

async def get_role(session: AsyncSession, role_id: str):
    result = await session.execute(select(Role).where(Role.id == role_id))
    return result.scalar_one_or_none()

async def assign_role(session, role_id, user_id, event_id):
    # Count current assignments
    count = await session.execute(
        select(func.count()).select_from(Participant).where(Participant.role_id == role_id)
    )
    current_filled = count.scalar()

    # Get role
    role = await session.get(Role, role_id)

    if current_filled >= role.slots_required:
        raise HTTPException(400, detail="Penugasan sudah penuh")

    # Assign
    participant = Participant(
        event_id=event_id,
        user_id=user_id,
        role_id=role_id
    )
    session.add(participant)
    await session.commit()
    await session.refresh(participant)

    return participant