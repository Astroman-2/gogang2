from datetime import datetime
from typing import Optional
from beanie import Document, Link
from pydantic import Field
from enum import Enum
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.user import User, UserRole


class PaymentStatus(str, Enum):
    PENDING = "Pending"
    PAID = "Paid"
    OVERDUE_30 = "Overdue 30 Days"
    OVERDUE_60 = "Overdue 60 Days"
    OVERDUE_90 = "Overdue 90+ Days"


class Billing(Document):
    """
    Billing model with dynamic calculation engine.
    Formula: (BASE_RATE * Duration) * Role_Multiplier
    """
    
    # References
    patient: Link[Patient]
    appointment: Link[Appointment]
    provider: Link[User]
    
    # Financial Data
    base_rate: float = Field(default=150.0)
    duration_hours: int
    role_multiplier: float
    subtotal: float
    tax_rate: float = Field(default=0.0)
    tax_amount: float = Field(default=0.0)
    total_amount: float
    
    # Payment Tracking
    payment_status: PaymentStatus = Field(default=PaymentStatus.PENDING)
    paid_amount: float = Field(default=0.0)
    balance_due: float
    
    # Dates
    invoice_date: datetime = Field(default_factory=datetime.utcnow)
    due_date: datetime
    paid_date: Optional[datetime] = None
    
    # Invoice Details
    invoice_number: str
    notes: str = ""
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @property
    def days_overdue(self) -> int:
        """Calculate how many days invoice is overdue."""
        if self.payment_status == PaymentStatus.PAID:
            return 0
        
        days = (datetime.utcnow() - self.due_date).days
        return max(0, days)
    
    def update_payment_status(self):
        """Update payment status based on days overdue."""
        if self.payment_status == PaymentStatus.PAID:
            return
        
        days = self.days_overdue
        
        if days >= 90:
            self.payment_status = PaymentStatus.OVERDUE_90
        elif days >= 60:
            self.payment_status = PaymentStatus.OVERDUE_60
        elif days >= 30:
            self.payment_status = PaymentStatus.OVERDUE_30
        else:
            self.payment_status = PaymentStatus.PENDING
    
    async def record_payment(self, amount: float) -> bool:
        """Record a payment against this invoice."""
        self.paid_amount += amount
        self.balance_due = self.total_amount - self.paid_amount
        
        if self.balance_due <= 0:
            self.payment_status = PaymentStatus.PAID
            self.paid_date = datetime.utcnow()
            self.balance_due = 0
        
        self.updated_at = datetime.utcnow()
        await self.save()
        return True
    
    class Settings:
        name = "billing"
        indexes = [
            "patient",
            "appointment",
            "provider",
            "payment_status",
            "invoice_number",
            "invoice_date",
            "due_date"
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "base_rate": 150.0,
                "duration_hours": 2,
                "role_multiplier": 1.2,
                "subtotal": 360.0,
                "total_amount": 360.0,
                "invoice_number": "INV-2024-001"
            }
        }
