from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ParticipantCreate(BaseModel):
    event_id: UUID
    user_id: UUID
    role_id: Optional[UUID] = None

class ParticipantAdminCreate(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None

class ParticipantOut(BaseModel):
    id: UUID
    event_id: UUID
    user_id: UUID
    role_id: Optional[UUID]
    registered_at: datetime
    
    # User details
    user_full_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None  # Add phone

    model_config = {"from_attributes": True}