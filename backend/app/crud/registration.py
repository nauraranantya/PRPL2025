from sqlalchemy.orm import Session
from app.models.registration import Registration
from app.schemas.registration import RegistrationCreate
from uuid import UUID

def create_registration(db: Session, event_id: UUID, data: RegistrationCreate):
    registration = Registration(
        event_id=event_id,
        name=data.name,
        phone_number=data.phone_number
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration
