from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.recurrence import Recurrence
from app.models.event import Event
from app.database.session import AsyncSessionLocal

async def generate_recurring_events():
    async with AsyncSessionLocal() as session:
        now = datetime.utcnow()

        result = await session.execute(
            select(Recurrence).where(
                Recurrence.active == True
            )
        )

        recurrences = result.scalars().all()

        for rec in recurrences:
            # get last event instance
            latest_event = await session.execute(
                select(Event)
                .where(Event.title == rec.event.title)
                .order_by(Event.event_date.desc())
                .limit(1)
            )
            latest = latest_event.scalar_one_or_none()

            if not latest:
                continue

            next_date = compute_next_occurrence(rec, latest.event_date)

            # skip if no next date
            if not next_date:
                continue

            # stop if exceeded repeat_until
            if rec.repeat_until and next_date > rec.repeat_until:
                continue

            # only create if next occurrence is > now
            if next_date > now:
                new_event = Event(
                    title=latest.title,
                    description=latest.description,
                    location=latest.location,
                    event_date=next_date,
                    requires_registration=latest.requires_registration,
                    slots_available=latest.slots_available
                )
                session.add(new_event)

        await session.commit()


def compute_next_occurrence(rec, last_date):
    if rec.frequency == "daily":
        return last_date + timedelta(days=rec.interval)

    if rec.frequency == "weekly":
        return last_date + timedelta(weeks=rec.interval)

    if rec.frequency == "monthly":
        try:
            return last_date.replace(month=last_date.month + rec.interval)
        except:
            return None

    return None