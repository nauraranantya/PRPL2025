from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

DATABASE_URL = settings.DATABASE_URL

# Log the connection details (hide password)
try:
    from urllib.parse import urlparse
    parsed = urlparse(DATABASE_URL)
    safe_url = f"{parsed.scheme}://{parsed.username}:***@{parsed.hostname}:{parsed.port}{parsed.path}"
    logger.info(f"Connecting to database: {safe_url}")
    logger.info(f"Using pooler: {'.pooler.supabase.com' in (parsed.hostname or '')}")
except Exception as e:
    logger.warning(f"Could not parse DATABASE_URL: {e}")

engine = create_async_engine(
    DATABASE_URL,
    echo=False,

    # Keeps connections healthy
    pool_pre_ping=True,

    # Recycles stale PG connections (Supabase resets connections every 1–2 hours)
    pool_recycle=1800,  # 30 minutes

    pool_size=10,       
    max_overflow=20,

    connect_args={
        "statement_cache_size": 500,
        "prepared_statement_cache_size": 100,

        "server_settings": {
            "application_name": "village_events_api",
            "idle_in_transaction_session_timeout": "30000",
        },
    },
    future=True,
)

# =============================================
# Session Factory
# =============================================

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency for FastAPI
async def get_session():
    async with AsyncSessionLocal() as session:
        yield session


# =============================================
# DB Connection Test (on startup)
# =============================================
async def init_db():
    logger.info("[DB] Testing connection...")

    try:
        async with engine.begin() as conn:
            await conn.run_sync(lambda _: None)
        logger.info("[DB] Database connection OK.")
    except Exception as e:
        logger.error("[DB] Connection FAILED")
        logger.error(str(e))
        raise