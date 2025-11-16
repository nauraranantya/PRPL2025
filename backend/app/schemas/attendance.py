from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class AttendanceBase(BaseModel):
    villager_name: str

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: UUID
    event_id: UUID
    timestamp: datetime

    class Config:
        from_attributes = True
