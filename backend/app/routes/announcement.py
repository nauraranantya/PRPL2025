from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from app.core.security import require_admin
from app.database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.announcement import AnnouncementCreate, AnnouncementOut
from app import crud

router = APIRouter()

@router.post('', response_model=dict)
async def create_announcement(payload: AnnouncementCreate, x_api_key: Optional[str] = Depends(require_admin), session: AsyncSession = Depends(get_session)):
    a = await crud.announcement.create_announcement(session, payload.title, payload.body)
    return {'success': True, 'data': AnnouncementOut.from_orm(a).dict()}

@router.get('', response_model=dict)
async def list_announcements(session: AsyncSession = Depends(get_session)):
    rows = await crud.announcement.list_announcements(session)
    return {'success': True, 'data': [AnnouncementOut.from_orm(r).dict() for r in rows]}
