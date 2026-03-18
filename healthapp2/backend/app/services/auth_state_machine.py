from datetime import datetime
from typing import Optional
from app.models.appointment import Appointment, AuthorizationStatus
from app.models.user import User
from app.services.billing_engine import BillingEngine


class AuthorizationStateMachine:
    """
    Authorization State Machine for Appointments.
    
    State Flow:
    Pending Auth -> Authorized -> Completed
    
    Transitions:
    1. authorize(): Pending -> Authorized (requires auth_code)
    2. complete(): Authorized -> Completed (triggers billing)
    
    Rules:
    - Cannot skip states
    - Cannot reverse transitions
    - Completion triggers automatic invoice generation
    """
    
    @staticmethod
    async def authorize_appointment(
        appointment: Appointment,
        auth_code: str,
        authorized_by: User
    ) -> dict:
        """
        Transition appointment from Pending -> Authorized.
        
        Args:
            appointment: Appointment to authorize
            auth_code: Authorization code from insurance/approval
            authorized_by: User performing the authorization
        
        Returns:
            Dict with status and message
        
        Raises:
            ValueError: If appointment cannot be authorized
        """
        if not appointment.can_authorize():
            raise ValueError(
                f"Cannot authorize appointment. Current status: {appointment.status.value}. "
                f"Expected status: {AuthorizationStatus.PENDING.value}"
            )
        
        if not auth_code or len(auth_code.strip()) == 0:
            raise ValueError("Authorization code is required")
        
        # Perform state transition
        success = await appointment.authorize(auth_code, authorized_by)
        
        if not success:
            raise ValueError("Authorization failed")
        
        return {
            "status": "success",
            "message": "Appointment authorized successfully",
            "appointment_id": str(appointment.id),
            "new_status": appointment.status.value,
            "auth_code": appointment.auth_code,
            "authorized_at": appointment.authorized_at.isoformat(),
            "authorized_by": authorized_by.full_name
        }
    
    @staticmethod
    async def complete_appointment(
        appointment: Appointment
    ) -> dict:
        """
        Transition appointment from Authorized -> Completed.
        
        This automatically triggers invoice generation via BillingEngine.
        
        Args:
            appointment: Appointment to complete
        
        Returns:
            Dict with status, message, and invoice details
        
        Raises:
            ValueError: If appointment cannot be completed
        """
        if not appointment.can_complete():
            raise ValueError(
                f"Cannot complete appointment. Current status: {appointment.status.value}. "
                f"Expected status: {AuthorizationStatus.AUTHORIZED.value}. "
                f"Hint: Appointment must be authorized before completion."
            )
        
        # Perform state transition
        success = await appointment.complete()
        
        if not success:
            raise ValueError("Completion failed")
        
        # Automatically generate invoice
        try:
            invoice = await BillingEngine.create_invoice_from_appointment(appointment)
            
            return {
                "status": "success",
                "message": "Appointment completed and invoice generated",
                "appointment_id": str(appointment.id),
                "new_status": appointment.status.value,
                "completed_at": appointment.completed_at.isoformat(),
                "invoice": {
                    "invoice_id": str(invoice.id),
                    "invoice_number": invoice.invoice_number,
                    "total_amount": invoice.total_amount,
                    "due_date": invoice.due_date.isoformat()
                }
            }
        except Exception as e:
            # If invoice generation fails, log but don't rollback completion
            return {
                "status": "partial_success",
                "message": "Appointment completed but invoice generation failed",
                "appointment_id": str(appointment.id),
                "new_status": appointment.status.value,
                "completed_at": appointment.completed_at.isoformat(),
                "error": str(e)
            }
    
    @staticmethod
    def validate_state_transition(
        current_status: AuthorizationStatus,
        target_status: AuthorizationStatus
    ) -> bool:
        """
        Validate if a state transition is allowed.
        
        Args:
            current_status: Current appointment status
            target_status: Desired target status
        
        Returns:
            True if transition is valid, False otherwise
        """
        valid_transitions = {
            AuthorizationStatus.PENDING: [AuthorizationStatus.AUTHORIZED],
            AuthorizationStatus.AUTHORIZED: [AuthorizationStatus.COMPLETED],
            AuthorizationStatus.COMPLETED: []  # Terminal state
        }
        
        allowed_next_states = valid_transitions.get(current_status, [])
        return target_status in allowed_next_states
    
    @staticmethod
    def get_next_valid_states(
        current_status: AuthorizationStatus
    ) -> list[AuthorizationStatus]:
        """
        Get list of valid next states from current state.
        
        Args:
            current_status: Current appointment status
        
        Returns:
            List of valid next states
        """
        transitions = {
            AuthorizationStatus.PENDING: [AuthorizationStatus.AUTHORIZED],
            AuthorizationStatus.AUTHORIZED: [AuthorizationStatus.COMPLETED],
            AuthorizationStatus.COMPLETED: []
        }
        
        return transitions.get(current_status, [])
