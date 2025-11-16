from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional

class RecurrenceBase(BaseModel):
    start_date: datetime
    frequency: str
    interval: int = 1
    day_of_month: Optional[int] = None
    repeat_until: Optional[datetime] = None
    active: bool = True

class RecurrenceCreate(RecurrenceBase):
    event_id: UUID

class RecurrenceUpdate(BaseModel):
    start_date: Optional[datetime] = None
    frequency: Optional[str] = None
    interval: Optional[int] = None
    day_of_month: Optional[int] = None
    repeat_until: Optional[datetime] = None
    active: Optional[bool] = None

class RecurrenceOut(RecurrenceBase):
    id: UUID
    event_id: UUID

    model_config = {"from_attributes": True}