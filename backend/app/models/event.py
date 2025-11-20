from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database.base import Base
from sqlalchemy import text
from sqlalchemy.orm import relationship

class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))

    # Core event information
    title = Column(String(200), nullable=False)
    description = Column(Text)
    location = Column(String(200))
    event_date = Column(DateTime(timezone=True), nullable=False)

    # Capacity (registration only)
    requires_registration = Column(Boolean, default=False)
    slots_available = Column(Integer, nullable=True)  # capacity per event
    
    # Event status
    is_cancelled = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now(), nullable=False)

    # Relationships
    schedules = relationship("Schedule", back_populates="event", cascade="all, delete")
    participants = relationship("Participant", back_populates="event", cascade="all, delete")
    roles = relationship("Role", back_populates="event", cascade="all, delete")
    media = relationship("EventMedia", back_populates="event", lazy="selectin", cascade="all, delete")
    recurrence = relationship("Recurrence", back_populates="event", uselist=False, lazy="selectin", cascade="all, delete")
    attendances = relationship("Attendance", back_populates="event", cascade="all, delete")