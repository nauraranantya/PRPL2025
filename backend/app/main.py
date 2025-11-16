from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database.session import init_db
from app.routes import event, announcement, role, auth 
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="Village Events API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AUTH 
app.include_router(auth.router, prefix="/api") 

# EVENTS
app.include_router(event.router, prefix='/api/events', tags=['events'])

# ANNOUNCEMENTS
app.include_router(announcement.router, prefix='/api/announcements', tags=['announcements'])

# ROLES
app.include_router(role.router, prefix="/api/roles", tags=["roles"])

@app.get('/')
async def root():
    return {'status':'ok'}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)