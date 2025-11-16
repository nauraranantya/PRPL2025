from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from sqlalchemy.ext.asyncio import AsyncEngine
from alembic import context
import asyncio
import os
from dotenv import load_dotenv

# Load .env file for DATABASE_URL
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# Alembic Config object
config = context.config
fileConfig(config.config_file_name)

# Override sqlalchemy.url from .env
if DATABASE_URL:
    config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Import models Base
from app.models import event, announcement, participant, role, schedule, event_media, user
from app.database.base import Base

target_metadata = Base.metadata

# --- Async Run ---
def run_migrations_offline():
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online():
    connectable = AsyncEngine(
        engine_from_config(
            config.get_section(config.config_ini_section),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
            future=True,
        )
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())