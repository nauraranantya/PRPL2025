from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.database.session import get_db
from app.schemas.attendance import AttendanceCreate, Attendance
from app.crud.attendance import create_attendance, get_attendance_by_event

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/{event_id}", response_model=Attendance)
def add_attendance(event_id: UUID, data: AttendanceCreate, db: Session = Depends(get_db)):
    return create_attendance(db, event_id, data)

@router.get("/{event_id}", response_model=list[Attendance])
def list_attendance(event_id: UUID, db: Session = Depends(get_db)):
    return get_attendance_by_event(db, event_id)
