from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=1800,
    future=True,
    connect_args={
        "ssl": ssl_context,
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0  # for asyncpg >= 0.29
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
    async with engine.begin() as conn:
        await conn.run_sync(lambda sync_conn: None)