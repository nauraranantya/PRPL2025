from fastapi import Header, HTTPException
from typing import Optional
from app.core.config import settings

def require_admin(x_api_key: Optional[str] = Header(None)):
    if x_api_key != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail={'code':'UNAUTHORIZED','message':'Akses tidak diizinkan'})
