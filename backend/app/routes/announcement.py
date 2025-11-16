from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from app.core.deps import require_admin_user
from app.database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.announcement import Announcement
from app.schemas.announcement import AnnouncementCreate, AnnouncementOut
from app import crud
from uuid import UUID

router = APIRouter()

@router.post('', response_model=dict)
async def create_announcement(payload: AnnouncementCreate, current_user = Depends(require_admin_user), session: AsyncSession = Depends(get_session)):
    a = await crud.announcement.create_announcement(session, payload.title, payload.body)
    return {'success': True, 'data': AnnouncementOut.from_orm(a).dict()}

@router.get('', response_model=dict)
async def list_announcements(session: AsyncSession = Depends(get_session)):
    rows = await crud.announcement.list_announcements(session)
    return {'success': True, 'data': [AnnouncementOut.from_orm(r).dict() for r in rows]}

@router.get("/{id}", response_model=dict)
async def get_announcement(id: UUID, session: AsyncSession = Depends(get_session)):
    row = await session.get(Announcement, id)
    if not row:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"success": True, "data": AnnouncementOut.from_orm(row).dict()}


@router.put("/{id}", response_model=dict)
async def update_announcement(
    id: UUID,
    payload: AnnouncementCreate,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    row = await session.get(Announcement, id)
    if not row:
        raise HTTPException(status_code=404, detail="Announcement not found")

    row.title = payload.title
    row.body = payload.body
    await session.commit()
    await session.refresh(row)

    return {"success": True, "data": AnnouncementOut.from_orm(row).dict()}


@router.delete("/{id}", response_model=dict)
async def delete_announcement(
    id: UUID,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    row = await session.get(Announcement, id)
    if not row:
        raise HTTPException(status_code=404, detail="Announcement not found")

    await session.delete(row)
    await session.commit()

    return {"success": True}
