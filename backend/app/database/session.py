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

# Check if using pooler (port 6543 = transaction mode, no prepared statements needed)
is_pooler = "pooler.supabase.com" in DATABASE_URL
logger.info(f"Connection pooler detected: {is_pooler}")

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=1800,
    pool_size=1,
    max_overflow=0,
    future=True,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "server_settings": {
            "application_name": "village_events_railway"
        }
    }
)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    from app.models import event, announcement
    logger.info("Testing database connection via pooler...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(lambda sync_conn: None)
        logger.info("Database connection successful!")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        logger.error(f"Make sure you're using Supabase connection pooler URL")
        raise