import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Railway sets env vars directly, no need for .env file
    DATABASE_URL: str
    ADMIN_API_KEY: str = 'dev-key'
    HOST: str = '0.0.0.0'
    PORT: int = 8000
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    class Config:
        # This allows pydantic to read from environment variables
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "allow"  # Allow extra fields for Supabase vars

settings = Settings()