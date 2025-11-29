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
except Exception as e:
    logger.warning(f"Could not parse DATABASE_URL: {e}")

logger.info("Creating database engine WITHOUT SSL (testing)")

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=1800,
    future=True,
    connect_args={
        "ssl": None,  # Disable SSL temporarily to test
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
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
    logger.info("Testing database connection (SSL disabled)...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(lambda sync_conn: None)
        logger.info("Database connection successful!")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise