from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.recurrence import RecurrenceCreate, RecurrenceUpdate, RecurrenceOut
from app.crud import recurrence as crud
from app.database.session import get_session
from app.core.deps import require_admin_user


router = APIRouter()


# ------------------------------------------------------
# CREATE
# ------------------------------------------------------
@router.post("", response_model=dict)
async def create_recurrence(
    payload: RecurrenceCreate,
    current_user = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    rec = await crud.create_recurrence(session, payload.model_dump())
    return {"success": True, "data": RecurrenceOut.from_orm(rec)}


# ------------------------------------------------------
# GET BY ID
# ------------------------------------------------------
@router.get("/{id}", response_model=dict)
async def get_recurrence(
    id: UUID,
    session: AsyncSession = Depends(get_session)
):
    rec = await crud.get(session, id)
    if not rec:
        raise HTTPException(404, "Recurrence not found")
    return {"success": True, "data": RecurrenceOut.from_orm(rec)}


# ------------------------------------------------------
# LIST (with optional event_id= filter)
# ------------------------------------------------------
@router.get("", response_model=dict)
async def list_recurrences(
    event_id: Optional[UUID] = Query(None),
    session: AsyncSession = Depends(get_session)
):

    # If filtered by event ID
    if event_id:
        recs = await crud.get_by_event(session, str(event_id))

        # Normalize to list
        if not recs:
            return {"success": True, "data": []}

        # If single item returned, make it a list
        if not isinstance(recs, (list, tuple)):
            recs = [recs]

        data = [RecurrenceOut.model_validate(r) for r in recs]
        return {"success": True, "data": data}

    # Otherwise return ALL recurrences
    rows = await crud.list_recurrences(session)
    data = [RecurrenceOut.model_validate(r) for r in rows]
    return {"success": True, "data": data}


# ------------------------------------------------------
# UPDATE
# ------------------------------------------------------
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


# ------------------------------------------------------
# DELETE
# ------------------------------------------------------
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