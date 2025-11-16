from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


# -------- DATABASE ENGINE -------- #
engine = create_async_engine(
    settings.DATABASE_URL,
    future=True,
    echo=False
)

# -------- SESSION FACTORY -------- #
async_session_maker = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)


# -------- GET DB SESSION (dependency) -------- #
async def get_db():
    async with async_session_maker() as session:
        yield session


# -------- INIT DB (startup) -------- #
async def init_db():
    # Import all models to register metadata
    from app.models import event, attendance, registration, announcement

    async with engine.begin() as conn:
        pass  # no create_all (already handled by migration)

async def get_session():
    async with async_session_maker() as session:
        yield session
