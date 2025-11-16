from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ParticipantCreate(BaseModel):
    event_id: UUID
    user_id: UUID
    role_id: Optional[UUID] = None

class ParticipantOut(BaseModel):
    id: UUID
    event_id: UUID
    user_id: UUID
    role_id: Optional[UUID]
    attendance_status: str
    registered_at: datetime

    model_config = {"from_attributes": True}