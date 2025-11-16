from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database.session import init_db
from app.routes import event, announcement
from fastapi.middleware.cors import CORSMiddleware

# IMPORT ROUTES BARU
from app.routes.attendance import router as attendance_router
from app.routes.registration import router as registration_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()  # startup run
    yield
    # shutdown cleanup

app = FastAPI(title="Village Events API", lifespan=lifespan)

# CORS settings (supaya React boleh access API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# EXISTING ROUTES
app.include_router(event.router, prefix='/api/events', tags=['events'])
app.include_router(announcement.router, prefix='/api/announcements', tags=['announcements'])

# ROUTE BARU UNTUK EPIC 3 & 4
app.include_router(attendance_router, prefix='/api/attendance', tags=['attendance'])
app.include_router(registration_router, prefix='/api/registration', tags=['registration'])

@app.get('/')
async def root():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)
