from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "healthapp"
    
    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Application
    APP_NAME: str = "HealthApp EMR & RCM"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Billing Engine
    BASE_RATE: float = 150.0
    PHYSICIAN_MULTIPLIER: float = 1.2
    CLINICIAN_MULTIPLIER: float = 1.0
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
