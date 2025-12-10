from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID

from app.database.session import get_session
from app.schemas.role import RoleCreate, RoleOut
from app.core.deps import require_admin_user
from app import crud

router = APIRouter()


# --------------------------------------------------
# CREATE ROLE
# --------------------------------------------------
@router.post("", response_model=RoleOut)
async def create_role(
    payload: RoleCreate,
    current_user=Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    role = await crud.role.create_role(session, payload.model_dump())

    return RoleOut.from_orm(role)


# --------------------------------------------------
# LIST ROLES (optionally filtered by event)
# --------------------------------------------------
@router.get("", response_model=List[RoleOut])
async def list_roles(
    event_id: Optional[UUID] = Query(None),
    session: AsyncSession = Depends(get_session)
):
    if event_id:
        rows = await crud.role.list_roles(session, event_id)
    else:
        rows = await crud.role.list_all_roles(session)

    return [RoleOut.from_orm(r) for r in rows]


# --------------------------------------------------
# GET ROLE BY ID
# --------------------------------------------------
@router.get("/{role_id}", response_model=RoleOut)
async def get_role(
    role_id: UUID,
    session: AsyncSession = Depends(get_session)
):
    role = await crud.role.get_role(session, role_id)

    if not role:
        raise HTTPException(404, "Role not found")

    return RoleOut.from_orm(role)


# --------------------------------------------------
# UPDATE ROLE
# --------------------------------------------------
@router.put("/{role_id}", response_model=RoleOut)
async def update_role(
    role_id: UUID,
    payload: RoleCreate,
    current_user=Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    updated = await crud.role.update_role(session, role_id, payload.model_dump())

    if not updated:
        raise HTTPException(404, "Role not found")

    return RoleOut.from_orm(updated)


# --------------------------------------------------
# DELETE ROLE
# --------------------------------------------------
@router.delete("/{role_id}", response_model=dict)
async def delete_role(
    role_id: UUID,
    current_user=Depends(require_admin_user),
    session: AsyncSession = Depends(get_session)
):
    success = await crud.role.delete_role(session, role_id)

    if not success:
        raise HTTPException(404, "Role not found")

    return {"success": True, "deleted_id": str(role_id)}