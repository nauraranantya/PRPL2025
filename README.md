Village Events Management System


Backend (FastAPI async SQLAlchemy): ./backend

Frontend (React): ./frontend


Quick start (backend):

1. Copy backend/.env.example to backend/.env and set DATABASE_URL and ADMIN_API_KEY
2. cd backend
3. pip install -r requirements.txt
4. uvicorn app.main:app --reload --port 4000

Quick start (frontend):

1. cd frontend
2. npm install
3. npm start

Notes:
- Frontend is preconfigured to call the backend at http://localhost:4000/api by default.
- For production, set REACT_APP_API_BASE to your deployed backend URL.
