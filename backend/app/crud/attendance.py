from sqlalchemy.orm import Session
from app.models.attendance import Attendance
from app.schemas.attendance import AttendanceCreate
from uuid import UUID

def create_attendance(db: Session, event_id: UUID, data: AttendanceCreate):
    attendance = Attendance(
        event_id=event_id,
        villager_name=data.villager_name
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance

def get_attendance_by_event(db: Session, event_id: UUID):
    return db.query(Attendance).filter(Attendance.event_id == event_id).all()
