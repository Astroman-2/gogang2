from datetime import datetime, timedelta
from app.models.billing import Billing, PaymentStatus
from app.models.appointment import Appointment
from app.models.user import UserRole
from app.config import settings


class BillingEngine:
    """
    Dynamic Billing Engine with precise mathematical formula.
    
    Formula: (BASE_RATE * Duration_Hours) * Role_Multiplier
    
    Multipliers:
    - Physician: 1.2x
    - Clinician: 1.0x
    - Admin: 1.0x (fallback)
    """
    
    @staticmethod
    def calculate_multiplier(provider_role: UserRole) -> float:
        """
        Get billing multiplier based on provider role.
        
        Args:
            provider_role: Role of the provider
        
        Returns:
            Multiplier value
        """
        multipliers = {
            UserRole.PHYSICIAN: settings.PHYSICIAN_MULTIPLIER,
            UserRole.CLINICIAN: settings.CLINICIAN_MULTIPLIER,
            UserRole.ADMIN: 1.0  # Fallback
        }
        
        return multipliers.get(provider_role, 1.0)
    
    @staticmethod
    def calculate_subtotal(
        base_rate: float,
        duration_hours: int,
        multiplier: float
    ) -> float:
        """
        Calculate subtotal using the billing formula.
        
        Formula: (BASE_RATE * Duration_Hours) * Role_Multiplier
        
        Args:
            base_rate: Base rate per hour
            duration_hours: Appointment duration (1-4 hours)
            multiplier: Role-based multiplier
        
        Returns:
            Calculated subtotal
        """
        return (base_rate * duration_hours) * multiplier
    
    @staticmethod
    def generate_invoice_number() -> str:
        """
        Generate unique invoice number.
        
        Format: INV-YYYY-NNNNNN
        """
        timestamp = datetime.utcnow()
        return f"INV-{timestamp.year}-{timestamp.strftime('%m%d%H%M%S')}"
    
    @staticmethod
    async def create_invoice_from_appointment(
        appointment: Appointment
    ) -> Billing:
        """
        Create billing invoice from completed appointment.
        
        This is automatically triggered when an appointment status
        transitions to 'Completed'.
        
        Args:
            appointment: Completed appointment
        
        Returns:
            Created Billing document
        
        Raises:
            ValueError: If appointment is not completed
        """
        if appointment.status.value != "Completed":
            raise ValueError(
                "Cannot create invoice for non-completed appointment"
            )
        
        # Fetch provider to get role
        await appointment.fetch_link(Appointment.provider)
        await appointment.fetch_link(Appointment.patient)
        
        provider = appointment.provider
        patient = appointment.patient
        
        # Calculate billing amounts
        base_rate = settings.BASE_RATE
        duration = appointment.duration_hours
        multiplier = BillingEngine.calculate_multiplier(provider.role)
        subtotal = BillingEngine.calculate_subtotal(base_rate, duration, multiplier)
        
        # Tax calculation (currently 0%, can be configured)
        tax_rate = 0.0
        tax_amount = subtotal * tax_rate
        total_amount = subtotal + tax_amount
        
        # Create invoice
        invoice = Billing(
            patient=patient,
            appointment=appointment,
            provider=provider,
            base_rate=base_rate,
            duration_hours=duration,
            role_multiplier=multiplier,
            subtotal=subtotal,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            total_amount=total_amount,
            balance_due=total_amount,
            payment_status=PaymentStatus.PENDING,
            invoice_number=BillingEngine.generate_invoice_number(),
            invoice_date=datetime.utcnow(),
            due_date=datetime.utcnow() + timedelta(days=30),
            notes=f"Visit on {appointment.scheduled_date.strftime('%Y-%m-%d')} "
                  f"- {appointment.appointment_type.value}"
        )
        
        await invoice.insert()
        
        return invoice
    
    @staticmethod
    async def update_overdue_statuses():
        """
        Batch update payment statuses for overdue invoices.
        
        This should be run as a scheduled task (e.g., daily cron job).
        """
        pending_invoices = await Billing.find(
            Billing.payment_status != PaymentStatus.PAID
        ).to_list()
        
        updated_count = 0
        for invoice in pending_invoices:
            old_status = invoice.payment_status
            invoice.update_payment_status()
            
            if old_status != invoice.payment_status:
                await invoice.save()
                updated_count += 1
        
        return {
            "checked": len(pending_invoices),
            "updated": updated_count
        }
