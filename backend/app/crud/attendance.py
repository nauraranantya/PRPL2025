from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.attendance import Attendance
from datetime import datetime, date

async def create_attendance(
    session: AsyncSession,
    event_id: str,
    participant_id: str,
    attended_at=None,
    notes=None
):
    # If attended_at not provided, use current time
    if attended_at is None:
        attended_at = datetime.now()
    
    # Extract the date from attended_at for attendance_day
    if isinstance(attended_at, str):
        attended_at = datetime.fromisoformat(attended_at.replace('Z', '+00:00'))
    
    attendance_day = attended_at.date()
    
    attendance = Attendance(
        event_id=event_id,
        participant_id=participant_id,
        attended_at=attended_at,
        attendance_day=attendance_day,  # Add this field
        notes=notes
    )
    
    session.add(attendance)
    await session.commit()
    await session.refresh(attendance)
    return attendance


async def delete_attendance(session: AsyncSession, attendance_id: str):
    a = await session.get(Attendance, attendance_id)
    if not a:
        return False
    await session.delete(a)
    await session.commit()
    return True


async def list_attendances_for_event(session: AsyncSession, event_id: str):
    result = await session.execute(
        select(Attendance).where(Attendance.event_id == event_id)
    )
    return result.scalars().all()


async def attendance_report(
    session: AsyncSession,
    event_id: str = None,
    start_date: date = None,
    end_date: date = None
):
    from sqlalchemy import func
    from app.models.participant import Participant
    from app.models.user import User
    
    # Base query
    query = select(
        Attendance.participant_id,
        User.full_name.label('participant_name'),
        func.count(Attendance.id).label('attended_count')
    ).join(
        Participant, Attendance.participant_id == Participant.id
    ).join(
        User, Participant.user_id == User.id
    ).group_by(
        Attendance.participant_id,
        User.full_name
    )
    
    # Apply filters
    if event_id:
        query = query.where(Attendance.event_id == event_id)
    if start_date:
        query = query.where(Attendance.attendance_day >= start_date)
    if end_date:
        query = query.where(Attendance.attendance_day <= end_date)
    
    result = await session.execute(query)
    rows = result.all()
    
    return [
        {
            "participant_id": str(row.participant_id),
            "participant_name": row.participant_name,
            "attended_count": row.attended_count
        }
        for row in rows
    ]