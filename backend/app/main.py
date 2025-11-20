# app/main.py
import os
import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.session import init_db
from app.routes import event, announcement, role, auth, recurrence, participation, user, media, attendance
from app.services.recurrence_engine import generate_recurring_events

# --- Configuration via env ---
ENABLE_RECURRENCE_WORKER = os.environ.get("ENABLE_RECURRENCE_WORKER", "false").lower() in ("1", "true", "yes")
RECURRENCE_INTERVAL_SECONDS = int(os.environ.get("RECURRENCE_INTERVAL_SECONDS", 60 * 60 * 24))  # default 24h
RUN_GENERATE_ON_STARTUP = os.environ.get("RUN_GENERATE_ON_STARTUP", "true").lower() in ("1", "true", "yes")

# --- Logging setup ---
logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
logger = logging.getLogger("village_events")

# --- Recurrence worker ---
async def _recurrence_loop(interval_seconds: int, stop_event: asyncio.Event):
    """
    Runs generate_recurring_events periodically until stop_event is set.
    Errors are caught & logged to avoid crashing.
    """
    logger.info("Recurrence loop started (interval=%s seconds)", interval_seconds)
    try:
        while not stop_event.is_set():
            try:
                logger.debug("Recurrence: running generate_recurring_events()")
                await generate_recurring_events()
                logger.info("Recurrence: generate_recurring_events() completed")
            except Exception as exc:
                logger.exception("Recurrence: error while generating events: %s", exc)

            # Wait with cancellation support
            try:
                await asyncio.wait_for(stop_event.wait(), timeout=interval_seconds)
            except asyncio.TimeoutError:
                # timeout expired — loop again
                continue
    finally:
        logger.info("Recurrence loop stopped")

# --- Lifespan: setup DB, start worker (if enabled), and tear down cleanly ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1) initialize DB (create pool)
    logger.info("Initializing database connection...")
    await init_db()
    logger.info("Database initialized")

    # 2) optionally run one immediate generation to pick up missed occurrences
    if RUN_GENERATE_ON_STARTUP:
        try:
            logger.info("Running initial recurrence generation on startup...")
            await generate_recurring_events()
            logger.info("Initial recurrence generation finished")
        except Exception:
            logger.exception("Initial recurrence generation failed")

    # 3) conditionally start background worker
    stop_event: Optional[asyncio.Event] = None
    worker_task: Optional[asyncio.Task] = None

    if ENABLE_RECURRENCE_WORKER:
        # create a stop_event so we can cancel gracefully
        stop_event = asyncio.Event()
        worker_task = asyncio.create_task(_recurrence_loop(RECURRENCE_INTERVAL_SECONDS, stop_event))
        # attach to app.state so tests / admin endpoints can inspect it if needed
        app.state.recurrence_task = worker_task
        app.state.recurrence_stop_event = stop_event
        logger.info("Recurrence worker started (PID aware).")

    else:
        logger.info("Recurrence worker disabled via ENABLE_RECURRENCE_WORKER env var.")

    # yield control to app
    try:
        yield
    finally:
        # Graceful shutdown: cancel worker if it exists
        if worker_task and not worker_task.done():
            logger.info("Stopping recurrence worker...")
            # signal shutdown
            stop_event.set()
            # give it some time to stop cleanly
            try:
                await asyncio.wait_for(worker_task, timeout=10.0)
                logger.info("Recurrence worker stopped gracefully.")
            except asyncio.TimeoutError:
                logger.warning("Recurrence worker did not stop in time; cancelling task.")
                worker_task.cancel()
                try:
                    await worker_task
                except asyncio.CancelledError:
                    logger.info("Recurrence worker cancelled.")

# --- App instance ---
app = FastAPI(title="Village Events API", lifespan=lifespan)

# --- CORS (adjust origin list in prod) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include routers (keep existing prefixes) ---
app.include_router(auth.router, prefix="/api")
app.include_router(event.router, prefix="/api/events", tags=["events"])
app.include_router(announcement.router, prefix="/api/announcements", tags=["announcements"])
app.include_router(role.router, prefix="/api/roles", tags=["roles"])
app.include_router(recurrence.router, prefix="/api/recurrences", tags=["recurrences"])
app.include_router(participation.router, prefix="/api/participants", tags=["participants"])
app.include_router(user.router, prefix="/api/users", tags=["users"])
app.include_router(media.router, prefix="/api/media", tags=["media"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["attendance"])

# Simple root + health-check
@app.get("/")
async def root():
    return {"status": "ok"}

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

# Optional admin endpoint (you may want to move this into the recurrence router and protect it).
# This allows manual triggering of generation (useful for debugging). Consider protecting with admin auth.
@app.post("/internal/recurrences/run-now")
async def run_recurrences_now():
    """
    Run recurrence generation immediately (admin-only endpoint recommended).
    """
    try:
        await generate_recurring_events()
        return {"success": True}
    except Exception as exc:
        logger.exception("Manual recurrence run failed: %s", exc)
        return {"success": False, "error": str(exc)}

# --- uvicorn entrypoint for local dev (you may prefer a separate gunicorn/uvicorn invocation in prod) ---
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=os.environ.get("HOST", "127.0.0.1"),
        port=int(os.environ.get("PORT", 8000)),
        reload=os.environ.get("UVICORN_RELOAD", "false").lower() in ("1", "true", "yes"),
        log_level=os.environ.get("LOG_LEVEL", "info"),
    )