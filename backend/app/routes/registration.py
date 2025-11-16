from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.database.session import get_db
from app.schemas.registration import RegistrationCreate, Registration
from app.crud.registration import create_registration

router = APIRouter(prefix="/registration", tags=["Registration"])

@router.post("/{event_id}", response_model=Registration)
def register(event_id: UUID, data: RegistrationCreate, db: Session = Depends(get_db)):
    return create_registration(db, event_id, data)
