from pydantic import BaseModel
from uuid import UUID

class RegistrationBase(BaseModel):
    name: str
    phone_number: str

class RegistrationCreate(RegistrationBase):
    pass

class Registration(RegistrationBase):
    id: UUID
    event_id: UUID

    class Config:
        from_attributes = True
