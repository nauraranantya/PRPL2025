from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, date

class AttendanceCreate(BaseModel):
    event_id: UUID
    participant_id: UUID
    attended_at: Optional[datetime] = None
    notes: Optional[str] = None

class AttendanceOut(BaseModel):
    id: UUID
    event_id: UUID
    participant_id: UUID
    attended_at: datetime
    attendance_day: date
    marked_by: Optional[UUID]
    notes: Optional[str]

    model_config = {"from_attributes": True}

class AttendanceReportRow(BaseModel):
    participant_id: UUID
    attended_count: int