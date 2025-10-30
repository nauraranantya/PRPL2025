from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class AnnouncementCreate(BaseModel):
    title: str
    body: str

class AnnouncementOut(BaseModel):
    id: UUID
    title: str
    body: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
