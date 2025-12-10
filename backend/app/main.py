import os
import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.session import init_db
from app.routes import (
    event,
    announcement,
    role,
    auth,
    recurrence,
    participation,
    user,
    media,
    attendance,
)
from app.services.recurrence_engine import generate_recurring_events


# ------------------------------------------------------
# Environment Config
# ------------------------------------------------------

ENABLE_RECURRENCE_WORKER = os.getenv("ENABLE_RECURRENCE_WORKER", "false").lower() in (
    "1",
    "true",
)
RUN_GENERATE_ON_STARTUP = os.getenv("RUN_GENERATE_ON_STARTUP", "true").lower() in (
    "1",
    "true",
)
RECURRENCE_INTERVAL_SECONDS = int(os.getenv("RECURRENCE_INTERVAL_SECONDS", 86400))

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()


# ------------------------------------------------------
# Logging
# ------------------------------------------------------

logging.basicConfig(level=LOG_LEVEL)
logger = logging.getLogger("village_events")


# ------------------------------------------------------
# Recurrence Worker Loop
# ------------------------------------------------------

async def _recurrence_loop(interval_seconds: int, stop_event: asyncio.Event):
    logger.info(f"[Worker] Recurrence loop started (interval={interval_seconds}s)")

    try:
        while not stop_event.is_set():
            try:
                await generate_recurring_events()
                logger.info("[Worker] Recurrence generation completed")
            except Exception as exc:
                logger.exception("[Worker] Error generating recurring events: %s", exc)

            try:
                await asyncio.wait_for(stop_event.wait(), timeout=interval_seconds)
            except asyncio.TimeoutError:
                continue

    finally:
        logger.info("[Worker] Recurrence loop stopped")


# ------------------------------------------------------
# Application Lifespan
# ------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database connection...")
    await init_db()
    logger.info("Database connection OK")

    # Run initial generation once per deployment
    if RUN_GENERATE_ON_STARTUP:
        logger.info("Running initial recurrence generation...")
        try:
            await generate_recurring_events()
            logger.info("Initial recurrence generation completed")
        except Exception as exc:
            logger.exception("Initial recurrence generation FAILED: %s", exc)

    # Start optional background worker
    stop_event: Optional[asyncio.Event] = None
    worker_task: Optional[asyncio.Task] = None

    if ENABLE_RECURRENCE_WORKER:
        logger.info("Recurrence worker enabled via ENV")
        stop_event = asyncio.Event()
        worker_task = asyncio.create_task(
            _recurrence_loop(RECURRENCE_INTERVAL_SECONDS, stop_event)
        )
        app.state.recurrence_task = worker_task
        app.state.recurrence_stop_event = stop_event
    else:
        logger.info("Recurrence worker disabled")

    # yield to application
    try:
        yield
    finally:
        # Graceful shutdown
        if worker_task:
            logger.info("Shutting down recurrence worker...")
            stop_event.set()
            try:
                await asyncio.wait_for(worker_task, timeout=10)
                logger.info("Recurrence worker stopped gracefully")
            except asyncio.TimeoutError:
                logger.warning("Worker did not stop in time; cancelling...")
                worker_task.cancel()
                try:
                    await worker_task
                except asyncio.CancelledError:
                    logger.info("Worker force-cancelled")


# ------------------------------------------------------
# FastAPI Application
# ------------------------------------------------------

app = FastAPI(
    title="Village Events API",
    version="1.0.0",
    lifespan=lifespan,
)


# ------------------------------------------------------
# CORS Configuration
# ------------------------------------------------------

allowed_origins = os.getenv("CORS_ORIGINS", "").split(",")
allowed_origins = [o for o in allowed_origins if o] or ["http://localhost:3000"]

logger.info(f"CORS allow_origins = {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------
# Routers
# ------------------------------------------------------

app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(event.router, prefix="/api/events", tags=["events"])
app.include_router(announcement.router, prefix="/api/announcements", tags=["announcements"])
app.include_router(role.router, prefix="/api/roles", tags=["roles"])
app.include_router(recurrence.router, prefix="/api/recurrences", tags=["recurrences"])
app.include_router(participation.router, prefix="/api/participants", tags=["participants"])
app.include_router(user.router, prefix="/api/users", tags=["users"])
app.include_router(media.router, prefix="/api/media", tags=["media"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["attendance"])


# ------------------------------------------------------
# Health Endpoints
# ------------------------------------------------------

@app.get("/")
async def root():
    return {"status": "ok"}

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


# ------------------------------------------------------
# Manual Recurrence Trigger (optional)
# ------------------------------------------------------

@app.post("/internal/recurrences/run-now")
async def run_recurrences_now():
    try:
        await generate_recurring_events()
        return {"success": True}
    except Exception as exc:
        logger.exception("Manual recurrence run failed: %s", exc)
        return {"success": False, "error": str(exc)}


# ------------------------------------------------------
# Local Development Entrypoint
# ------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("UVICORN_RELOAD", "false").lower() == "true",
        log_level=os.getenv("LOG_LEVEL", "info"),
    )