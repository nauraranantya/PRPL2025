from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from typing import Optional
from passlib.context import CryptContext
from app.core.config import settings
import time

ALGORITHM = "HS256"
SECRET_KEY = settings.SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES = int(getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 60))
REFRESH_TOKEN_EXPIRE_DAYS = int(getattr(settings, "REFRESH_TOKEN_EXPIRE_DAYS", 7))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None):
    now = int(time.time())
    exp = now + (expires_delta.total_seconds() if expires_delta else ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    exp = int(exp)
    
    payload = {
        "sub": str(subject),
        "iat": now,
        "exp": exp,
    }
    
    print(f"[CREATE TOKEN] now={now}, exp={exp}, expires_in={(exp-now)/60} minutes")
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(subject: str, expires_delta: Optional[timedelta] = None):
    now = int(time.time())
    exp = now + (expires_delta.total_seconds() if expires_delta else REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60)
    exp = int(exp)
    
    payload = {
        "sub": str(subject),
        "iat": now,
        "exp": exp,
    }
    
    print(f"[CREATE REFRESH] now={now}, exp={exp}, expires_in={(exp-now)/3600} hours")
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM],
            options={
                "verify_exp": True,
                "verify_iat": True,
                "leeway": 10  # Allow 10 seconds clock skew
            }
        )
        
        now = int(time.time())
        exp = payload.get("exp", 0)
        iat = payload.get("iat", 0)
        
        print(f"[DECODE TOKEN] now={now}, iat={iat}, exp={exp}, valid_for={(exp-now)} seconds")
        
        return payload
    except JWTError as e:
        print(f"[JWT ERROR] {type(e).__name__}: {e}")
        return None


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)