from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_date: datetime

class EventUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    location: Optional[str]
    event_date: Optional[datetime]
    is_cancelled: Optional[bool]

class EventOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_date: datetime
    created_at: datetime
    updated_at: datetime
    is_cancelled: bool

    model_config = {"from_attributes": True}
