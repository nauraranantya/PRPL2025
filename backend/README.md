Modular FastAPI backend (async SQLAlchemy)

Quick start:
1. copy .env.example to .env and set DATABASE_URL and ADMIN_API_KEY
2. pip install -r requirements.txt
3. uvicorn app.main:app --reload --port 4000

Notes:
- This structure separates routes, crud logic, schemas and models to support Agile development.
- Alembic is included in requirements; to initialize migrations run `alembic init alembic` and configure alembic.ini to use your DATABASE_URL.
