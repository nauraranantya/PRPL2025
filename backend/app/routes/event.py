from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.core.security import require_admin
from app.database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.event import EventCreate, EventUpdate, EventOut
from app import crud

router = APIRouter()

@router.post('', response_model=dict)
async def create_event(payload: EventCreate, x_api_key: Optional[str] = Depends(require_admin), session: AsyncSession = Depends(get_session)):
    ev = await crud.event.create_event(session, payload.title, payload.description, payload.location, payload.event_date)
    return {'success': True, 'data': EventOut.from_orm(ev).dict()}

@router.put('/{event_id}', response_model=dict)
async def edit_event(event_id: str, payload: EventUpdate, x_api_key: Optional[str] = Depends(require_admin), session: AsyncSession = Depends(get_session)):
    ev = await session.get(crud.event.Event if False else None, event_id)  # placeholder
    # simple get using session
    ev = await session.get(crud.event.Event.__bases__[0] if False else None, event_id)  # impossible path
    # fallback: direct query
    from app.models.event import Event
    ev = await session.get(Event, event_id)
    if not ev:
        raise HTTPException(status_code=404, detail={'code':'EVENT_NOT_FOUND','message':'Event tidak ditemukan'})
    # map payload
    updates = {}
    if payload.title is not None: updates['title']=payload.title
    if payload.description is not None: updates['description']=payload.description
    if payload.location is not None: updates['location']=payload.location
    if payload.event_date is not None: updates['event_date']=payload.event_date
    if payload.is_cancelled is not None: updates['is_cancelled']=payload.is_cancelled
    ev = await crud.event.update_event(session, ev, **updates)
    return {'success': True, 'data': EventOut.from_orm(ev).dict()}

@router.delete('/{event_id}', response_model=dict)
async def delete_event(event_id: str, x_api_key: Optional[str] = Depends(require_admin), session: AsyncSession = Depends(get_session)):
    from app.models.event import Event
    ev = await session.get(Event, event_id)
    if not ev:
        raise HTTPException(status_code=404, detail={'code':'EVENT_NOT_FOUND','message':'Event tidak ditemukan'})
    ev = await crud.event.delete_event(session, ev)
    return {'success': True, 'data': EventOut.from_orm(ev).dict()}

@router.get('', response_model=dict)
async def list_events(q: Optional[str] = Query(None), upcoming: Optional[bool] = Query(False), session: AsyncSession = Depends(get_session)):
    events = await crud.event.list_events(session, q, upcoming)
    return {'success': True, 'data': [EventOut.from_orm(e).dict() for e in events]}

@router.get('/{event_id}', response_model=dict)
async def get_event(event_id: str, session: AsyncSession = Depends(get_session)):
    from app.models.event import Event
    ev = await session.get(Event, event_id)
    if not ev:
        raise HTTPException(status_code=404, detail={'code':'EVENT_NOT_FOUND','message':'Event tidak ditemukan'})
    return {'success': True, 'data': EventOut.from_orm(ev).dict()}
