from sqlalchemy import Column, ForeignKey, DateTime, Date, Text, text, Computed
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()") 
    )

    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participants.id", ondelete="CASCADE"), nullable=False)

    attended_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    attendance_day = Column(Date, nullable=False, index=True)

    marked_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    notes = Column(Text, nullable=True)

    event = relationship("Event")
    participant = relationship("Participant")