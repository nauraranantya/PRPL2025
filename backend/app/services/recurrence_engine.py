from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.recurrence import Recurrence
from app.models.event import Event
from app.database.session import AsyncSessionLocal

async def generate_recurring_events():
    async with AsyncSessionLocal() as session:
        now = datetime.now(timezone.utc)

        recs = (
            await session.execute(
                select(Recurrence)
                .options(selectinload(Recurrence.event))
                .where(Recurrence.active == True)
            )
        ).scalars().all()

        for rec in recs:

            # Get latest event
            latest_event = (
                await session.execute(
                    select(Event)
                    .where(Event.id == rec.event_id)
                    .order_by(Event.event_date.desc())
                    .limit(1)
                )
            ).scalar_one_or_none()

            if not latest_event:
                continue

            # Only generate AFTER the last event has passed
            if latest_event.event_date > now:
                continue

            next_date = compute_next_occurrence(rec, latest_event.event_date)
            if not next_date:
                continue

            # ensure timezone-aware
            if next_date.tzinfo is None:
                next_date = next_date.replace(tzinfo=timezone.utc)

            # respect repeat_until
            if rec.repeat_until and next_date > rec.repeat_until:
                continue

            # Safety: next_date must be after the last date
            if next_date <= latest_event.event_date:
                continue

            # --- DUPLICATE CHECK ---
            exists = (
                await session.execute(
                    select(Event)
                    .where(Event.title == latest_event.title)
                    .where(Event.event_date == next_date)
                )
            ).scalar_one_or_none()

            if exists:
                continue  # Already exists → skip

            # Create recurring event
            new_event = Event(
                title=latest_event.title,
                description=latest_event.description,
                location=latest_event.location,
                event_date=next_date,
                requires_registration=latest_event.requires_registration,
                slots_available=latest_event.slots_available,
            )
            session.add(new_event)

        await session.commit()

def compute_next_occurrence(rec, last_date):
    """Always return timezone-aware datetime."""
    if last_date.tzinfo is None:
        last_date = last_date.replace(tzinfo=timezone.utc)

    if rec.frequency == "daily":
        return last_date + timedelta(days=rec.interval)

    if rec.frequency == "weekly":
        return last_date + timedelta(weeks=rec.interval)

    if rec.frequency == "monthly":
        month = last_date.month - 1 + rec.interval
        year = last_date.year + month // 12
        month = month % 12 + 1

        try:
            return last_date.replace(year=year, month=month)
        except ValueError:
            return None

    return None