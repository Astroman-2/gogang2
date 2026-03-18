from datetime import datetime, date
from typing import Optional, Dict, List
from beanie import Document
from pydantic import Field, EmailStr
from enum import Enum


class Gender(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"


class BloodType(str, Enum):
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"


class Vitals(Document):
    """Patient vital signs."""
    blood_pressure_systolic: int
    blood_pressure_diastolic: int
    heart_rate: int
    temperature: float
    oxygen_saturation: int
    weight_kg: float
    height_cm: float
    recorded_at: datetime = Field(default_factory=datetime.utcnow)


class Patient(Document):
    """Patient model with soft delete support for HIPAA compliance."""
    
    # Basic Information
    first_name: str
    last_name: str
    date_of_birth: date
    gender: Gender
    
    # Contact Information
    email: Optional[EmailStr] = None
    phone: str
    address: str
    city: str
    state: str
    zip_code: str
    
    # Medical Information
    blood_type: Optional[BloodType] = None
    allergies: List[str] = Field(default_factory=list)
    chronic_conditions: List[str] = Field(default_factory=list)
    current_medications: List[str] = Field(default_factory=list)
    medical_history: str = ""
    
    # Emergency Contact
    emergency_contact_name: str
    emergency_contact_phone: str
    emergency_contact_relationship: str
    
    # Insurance Information
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    
    # System Fields
    is_active: bool = True  # Soft delete flag for HIPAA compliance
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self) -> int:
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    class Settings:
        name = "patients"
        indexes = [
            "email",
            "phone",
            "is_active",
            [("last_name", 1), ("first_name", 1)]
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "first_name": "Jane",
                "last_name": "Doe",
                "date_of_birth": "1985-03-15",
                "gender": "Female",
                "phone": "+1-555-0123",
                "address": "123 Main St",
                "city": "Boston",
                "state": "MA",
                "zip_code": "02101"
            }
        }
