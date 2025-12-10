from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.schemas.participant import ParticipantOut

class EventCreate(BaseModel):
    title: str = Field(..., example="Gotong Royong")
    description: Optional[str] = Field(None, example="Bersih-bersih lingkungan desa")
    location: Optional[str] = Field(None, example="Balai Desa")
    event_date: datetime = Field(..., example="2025-11-12T08:00:00")
    requires_registration: Optional[bool] = Field(False, example=False)
    slots_available: Optional[int] = Field(None, example=50)
    recurrence_pattern: Optional[str] = Field(None, example="weekly")

class EventMediaOut(BaseModel):
    id: UUID
    file_url: str
    file_type: Optional[str]
    uploaded_at: datetime
    model_config = {"from_attributes": True}

class EventUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    location: Optional[str]
    event_date: Optional[datetime]
    is_cancelled: Optional[bool] = None
    requires_registration: Optional[bool] = None
    slots_available: Optional[int] = None
    recurrence_pattern: Optional[str] = None

class EventOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_date: datetime
    created_at: datetime
    updated_at: Optional[datetime]
    is_cancelled: bool
    requires_registration: Optional[bool] = None
    slots_available: Optional[int] = None
    recurrence_pattern: Optional[str] = None
    media: Optional[list[EventMediaOut]] = None

    model_config = {"from_attributes": True}
