from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field, EmailStr
from enum import Enum


class UserRole(str, Enum):
    """User roles for RBAC."""
    ADMIN = "Admin"
    PHYSICIAN = "Physician"
    CLINICIAN = "Clinician"


class User(Document):
    """User model for authentication and authorization."""
    
    email: EmailStr = Field(..., unique=True)
    username: str = Field(..., unique=True)
    hashed_password: str
    full_name: str
    role: UserRole
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"
        indexes = [
            "email",
            "username",
            "role"
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "dr.smith@healthapp.com",
                "username": "drsmith",
                "full_name": "Dr. John Smith",
                "role": "Physician"
            }
        }
