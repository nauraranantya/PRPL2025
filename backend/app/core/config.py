import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv('DATABASE_URL')
    ADMIN_API_KEY: str = os.getenv('ADMIN_API_KEY', 'dev-key')
    HOST: str = os.getenv('HOST','0.0.0.0')
    PORT: int = int(os.getenv('PORT', 4000))
    SECRET_KEY: str = os.getenv('SECRET_KEY')
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

settings = Settings()
