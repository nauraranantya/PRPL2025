from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database.session import get_session
from app.schemas.role import RoleCreate, RoleOut
from app import crud
from app.core.deps import require_admin_user

router = APIRouter()

@router.post("", response_model=RoleOut)
async def create_role(payload: RoleCreate, current_user = Depends(require_admin_user), session: AsyncSession = Depends(get_session)):
    role = await crud.role.create_role(session, payload.model_dump())
    return role

@router.get("/{event_id}", response_model=list[RoleOut])
async def list_roles(event_id: str, session: AsyncSession = Depends(get_session)):
    roles = await crud.role.list_roles(session, event_id)
    return roles

@router.put("/{role_id}", response_model=RoleOut)
async def update_role(role_id: str, payload: RoleCreate, current_user = Depends(require_admin_user), session: AsyncSession = Depends(get_session)):
    role = await crud.role.update_role(session, role_id, payload.model_dump())
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.delete("/{role_id}", response_model=dict)
async def delete_role(role_id: str, current_user = Depends(require_admin_user), session: AsyncSession = Depends(get_session)):
    role = await crud.role.delete_role(session, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return {"success": True, "deleted_id": role_id}