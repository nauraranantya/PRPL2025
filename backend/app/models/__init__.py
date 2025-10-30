from sqlalchemy.orm import declarative_base
Base = declarative_base()

# import models so they register on Base
from app.models.event import Event
from app.models.announcement import Announcement
