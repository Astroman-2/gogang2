from datetime import datetime
from typing import Optional
from beanie import Document, Link
from pydantic import Field, field_validator
from enum import Enum
from app.models.patient import Patient
from app.models.user import User, UserRole


class AuthorizationStatus(str, Enum):
    """Authorization state machine states."""
    PENDING = "Pending Auth"
    AUTHORIZED = "Authorized"
    COMPLETED = "Completed"


class AppointmentType(str, Enum):
    CHECKUP = "Checkup"
    CONSULTATION = "Consultation"
    FOLLOW_UP = "Follow-Up"
    PROCEDURE = "Procedure"
    EMERGENCY = "Emergency"


class Appointment(Document):
    """
    Appointment model with strict 1-4 hour duration constraint
    and authorization state machine.
    """
    
    # Core Fields
    patient: Link[Patient]
    provider: Link[User]
    
    # Scheduling
    scheduled_date: datetime
    duration_hours: int = Field(..., ge=1, le=4)  # STRICT: 1-4 hours only
    appointment_type: AppointmentType
    
    # Authorization State Machine
    status: AuthorizationStatus = Field(default=AuthorizationStatus.PENDING)
    auth_code: Optional[str] = None
    authorized_at: Optional[datetime] = None
    authorized_by: Optional[Link[User]] = None
    
    # Clinical Notes
    chief_complaint: str = ""
    notes: str = ""
    diagnosis: str = ""
    treatment_plan: str = ""
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    @field_validator('duration_hours')
    @classmethod
    def validate_duration(cls, v: int) -> int:
        """Enforce 1-4 hour constraint with clear error message."""
        if not (1 <= v <= 4):
            raise ValueError(
                f"Duration must be between 1 and 4 hours (inclusive). "
                f"Received: {v} hours. This is a strict business rule."
            )
        return v
    
    def can_authorize(self) -> bool:
        """Check if appointment can be authorized."""
        return self.status == AuthorizationStatus.PENDING
    
    def can_complete(self) -> bool:
        """Check if appointment can be completed."""
        return self.status == AuthorizationStatus.AUTHORIZED
    
    async def authorize(self, auth_code: str, authorized_by: User) -> bool:
        """
        Transition from Pending -> Authorized.
        Returns True if successful, False otherwise.
        """
        if not self.can_authorize():
            return False
        
        self.status = AuthorizationStatus.AUTHORIZED
        self.auth_code = auth_code
        self.authorized_at = datetime.utcnow()
        self.authorized_by = authorized_by
        self.updated_at = datetime.utcnow()
        
        await self.save()
        return True
    
    async def complete(self) -> bool:
        """
        Transition from Authorized -> Completed.
        Triggers automatic billing invoice generation.
        Returns True if successful, False otherwise.
        """
        if not self.can_complete():
            return False
        
        self.status = AuthorizationStatus.COMPLETED
        self.completed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        
        await self.save()
        
        # Trigger billing engine (will be called by service layer)
        return True
    
    @property
    def total_minutes(self) -> int:
        """Calculate total appointment duration in minutes."""
        return self.duration_hours * 60
    
    class Settings:
        name = "appointments"
        indexes = [
            "patient",
            "provider",
            "status",
            "scheduled_date",
            [("scheduled_date", 1), ("provider", 1)]
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "duration_hours": 2,
                "appointment_type": "Consultation",
                "status": "Pending Auth",
                "chief_complaint": "Persistent headaches"
            }
        }
