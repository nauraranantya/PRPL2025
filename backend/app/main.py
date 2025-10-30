from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database.session import init_db
from app.routes import event, announcement
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()  # startup
    yield
    # cleanup on shutdown

app = FastAPI(title="Village Events API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(event.router, prefix='/api/events', tags=['events'])
app.include_router(announcement.router, prefix='/api/announcements', tags=['announcements'])

@app.get('/')
async def root():
    return {'status':'ok'}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)