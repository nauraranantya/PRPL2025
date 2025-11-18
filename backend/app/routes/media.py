from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_session
from app.services.media_service import upload_media, delete_media
from app.core.deps import require_admin_user

router = APIRouter()  

@router.post("/{event_id}", response_model=dict)
async def upload_event_banner(
    event_id: str,
    file: UploadFile = File(...),
    current_user=Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    try:
        saved = await upload_media(session, file, event_id)
        return {"success": True, "data": {"id": str(saved.id), "url": saved.file_url}}
    except Exception as e:
        raise HTTPException(400, str(e))


@router.delete("/{media_id}", response_model=dict)
async def delete_event_banner(
    media_id: str,
    current_user=Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    ok = await delete_media(session, media_id)
    if not ok:
        raise HTTPException(404, "Media not found")
    return {"success": True}