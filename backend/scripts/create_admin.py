import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.database.session import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

async def main():
    async with AsyncSessionLocal() as session:
        admin_email = "admin@example.com"
        admin_password = "admin123"

        admin = User(
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            is_admin=True,
            is_active=True,
        )

        session.add(admin)
        await session.commit()

        print("Admin user created:")
        print(" Email:", admin_email)
        print(" Password:", admin_password)

asyncio.run(main())