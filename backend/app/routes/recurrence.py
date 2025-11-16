from fastapi import APIRouter, Depends, HTTPException
from app.schemas.recurrence import RecurrenceCreate, RecurrenceUpdate, RecurrenceOut
from app.crud import recurrence as crud
from app.database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.deps import require_admin_user

router = APIRouter()

@router.post("", response_model=dict)
async def create_recurrence(
    payload: RecurrenceCreate,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    rec = await crud.create_recurrence(session, payload.model_dump())
    return {"success": True, "data": RecurrenceOut.from_orm(rec)}

@router.get("/{id}", response_model=dict)
async def get_recurrence(id: UUID, session: AsyncSession = Depends(get_session)):
    rec = await crud.get(session, id)
    if not rec:
        raise HTTPException(404, "Recurrence not found")
    return {"success": True, "data": RecurrenceOut.from_orm(rec)}

@router.get("", response_model=dict)
async def list_recurrences(session: AsyncSession = Depends(get_session)):
    rows = await crud.list_recurrences(session)
    return {"success": True, "data": [RecurrenceOut.from_orm(r) for r in rows]}

@router.put("/{id}", response_model=dict)
async def update_recurrence(
    id: UUID,
    payload: RecurrenceUpdate,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    rec = await crud.update_recurrence(session, id, updates)
    if not rec:
        raise HTTPException(404, "Recurrence not found")
    return {"success": True, "data": RecurrenceOut.from_orm(rec)}

@router.delete("/{id}", response_model=dict)
async def delete_recurrence(
    id: UUID,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    ok = await crud.delete_recurrence(session, id)
    if not ok:
        raise HTTPException(404, "Recurrence not found")
    return {"success": True}