from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func, text
from sqlalchemy.orm import relationship
from app.database.base import Base

class Recurrence(Base):
    __tablename__ = "recurrences"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))

    # Link to the parent event template
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)

    # The initial event date that recurrence starts from
    start_date = Column(DateTime(timezone=True), nullable=False)

    # Recurrence frequency: none, daily, weekly, monthly, yearly
    frequency = Column(String(20), nullable=False, default="none")

    # Repeat every N units (e.g. every 2 weeks)
    interval = Column(Integer, nullable=False, default=1)

    day_of_month = Column(Integer, nullable=True)

    # Stop generating after this date
    repeat_until = Column(DateTime(timezone=True), nullable=True)

    # When false → system stops generating new occurrences
    active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    event = relationship("Event", back_populates="recurrence")