import os
from typing import Any, Dict, Optional, List
from pydantic import BaseSettings, validator
from dotenv import load_dotenv

# Load .env file if it exists
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI ML Resource Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_secret_key_here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"
    DATABASE_URI: str = os.getenv(
        "DATABASE_URL", "sqlite:///./sql_app.db"
    )

    # CORS middleware settings
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Environment settings
    ENVIRONMENT: Optional[str] = os.getenv("ENVIRONMENT", "development")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
