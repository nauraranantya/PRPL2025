from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class RoleBase(BaseModel):
    role_name: str = Field(..., example="Organizer")
    description: Optional[str] = Field(None, example="Can manage event schedule")
    slots_required: int = 1

class RoleCreate(RoleBase):
    event_id: UUID

class RoleOut(RoleBase):
    id: UUID
    event_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}