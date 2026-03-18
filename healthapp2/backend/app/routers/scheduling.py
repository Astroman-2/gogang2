from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel, Field, field_validator
from beanie import PydanticObjectId
from app.models.appointment import Appointment, AuthorizationStatus, AppointmentType
from app.models.patient import Patient
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.auth.rbac import check_permission
from app.services.auth_state_machine import AuthorizationStateMachine

router = APIRouter(prefix="/api/scheduling", tags=["Scheduling"])


class AppointmentCreate(BaseModel):
    patient_id: str
    provider_id: str
    scheduled_date: str  # ISO format datetime
    duration_hours: int = Field(..., ge=1, le=4)
    appointment_type: AppointmentType
    chief_complaint: str = ""
    notes: str = ""
    
    @field_validator('duration_hours')
    @classmethod
    def validate_duration(cls, v: int) -> int:
        if not (1 <= v <= 4):
            raise ValueError(
                f"Duration must be between 1 and 4 hours (inclusive). "
                f"This is a strict business rule for appointment scheduling."
            )
        return v


class AppointmentUpdate(BaseModel):
    scheduled_date: Optional[str] = None
    duration_hours: Optional[int] = Field(None, ge=1, le=4)
    appointment_type: Optional[AppointmentType] = None
    chief_complaint: Optional[str] = None
    notes: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None


class AuthorizeRequest(BaseModel):
    auth_code: str


@router.get("/", response_model=List[dict])
async def list_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status_filter: Optional[AuthorizationStatus] = None,
    provider_id: Optional[str] = None,
    patient_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """List appointments with filters."""
    check_permission(current_user, "appointments", "read")
    
    # Build query
    query_conditions = {}
    
    if status_filter:
        query_conditions["status"] = status_filter
    
    if provider_id:
        query_conditions["provider"] = PydanticObjectId(provider_id)
    
    if patient_id:
        query_conditions["patient"] = PydanticObjectId(patient_id)
    
    if query_conditions:
        query = Appointment.find(query_conditions)
    else:
        query = Appointment.find_all()
    
    appointments = await query.skip(skip).limit(limit).to_list()
    
    # Fetch related data
    result = []
    for apt in appointments:
        await apt.fetch_all_links()
        
        result.append({
            "id": str(apt.id),
            "patient": {
                "id": str(apt.patient.id),
                "name": apt.patient.full_name
            },
            "provider": {
                "id": str(apt.provider.id),
                "name": apt.provider.full_name,
                "role": apt.provider.role.value
            },
            "scheduled_date": apt.scheduled_date.isoformat(),
            "duration_hours": apt.duration_hours,
            "appointment_type": apt.appointment_type.value,
            "status": apt.status.value,
            "auth_code": apt.auth_code,
            "chief_complaint": apt.chief_complaint,
            "created_at": apt.created_at.isoformat()
        })
    
    return result


@router.get("/{appointment_id}", response_model=dict)
async def get_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed appointment information."""
    check_permission(current_user, "appointments", "read")
    
    appointment = await Appointment.get(PydanticObjectId(appointment_id))
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    await appointment.fetch_all_links()
    
    return {
        "id": str(appointment.id),
        "patient": {
            "id": str(appointment.patient.id),
            "name": appointment.patient.full_name,
            "age": appointment.patient.age
        },
        "provider": {
            "id": str(appointment.provider.id),
            "name": appointment.provider.full_name,
            "role": appointment.provider.role.value
        },
        "scheduled_date": appointment.scheduled_date.isoformat(),
        "duration_hours": appointment.duration_hours,
        "appointment_type": appointment.appointment_type.value,
        "status": appointment.status.value,
        "auth_code": appointment.auth_code,
        "authorized_at": appointment.authorized_at.isoformat() if appointment.authorized_at else None,
        "completed_at": appointment.completed_at.isoformat() if appointment.completed_at else None,
        "chief_complaint": appointment.chief_complaint,
        "notes": appointment.notes,
        "diagnosis": appointment.diagnosis,
        "treatment_plan": appointment.treatment_plan,
        "can_authorize": appointment.can_authorize(),
        "can_complete": appointment.can_complete(),
        "created_at": appointment.created_at.isoformat()
    }


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new appointment.
    
    Duration must be 1-4 hours (strict business rule).
    Initial status is 'Pending Auth'.
    """
    check_permission(current_user, "appointments", "create")
    
    # Verify patient exists
    patient = await Patient.get(PydanticObjectId(appointment_data.patient_id))
    if not patient or not patient.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found or inactive"
        )
    
    # Verify provider exists
    provider = await User.get(PydanticObjectId(appointment_data.provider_id))
    if not provider or not provider.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider not found or inactive"
        )
    
    # Parse datetime
    scheduled_date = datetime.fromisoformat(appointment_data.scheduled_date.replace('Z', '+00:00'))
    
    # Create appointment
    appointment = Appointment(
        patient=patient,
        provider=provider,
        scheduled_date=scheduled_date,
        duration_hours=appointment_data.duration_hours,
        appointment_type=appointment_data.appointment_type,
        chief_complaint=appointment_data.chief_complaint,
        notes=appointment_data.notes,
        status=AuthorizationStatus.PENDING
    )
    
    await appointment.insert()
    
    return {
        "message": "Appointment created successfully",
        "appointment_id": str(appointment.id),
        "status": appointment.status.value,
        "scheduled_date": appointment.scheduled_date.isoformat()
    }


@router.put("/{appointment_id}", response_model=dict)
async def update_appointment(
    appointment_id: str,
    appointment_data: AppointmentUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update appointment details."""
    check_permission(current_user, "appointments", "update")
    
    appointment = await Appointment.get(PydanticObjectId(appointment_id))
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Update fields
    update_data = appointment_data.model_dump(exclude_unset=True)
    
    if 'scheduled_date' in update_data:
        update_data['scheduled_date'] = datetime.fromisoformat(
            update_data['scheduled_date'].replace('Z', '+00:00')
        )
    
    for field, value in update_data.items():
        setattr(appointment, field, value)
    
    appointment.updated_at = datetime.utcnow()
    await appointment.save()
    
    return {
        "message": "Appointment updated successfully",
        "appointment_id": str(appointment.id)
    }


@router.post("/{appointment_id}/authorize", response_model=dict)
async def authorize_appointment(
    appointment_id: str,
    auth_request: AuthorizeRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Authorize an appointment (Pending -> Authorized).
    
    Requires auth_code from insurance/approval system.
    """
    check_permission(current_user, "appointments", "authorize")
    
    appointment = await Appointment.get(PydanticObjectId(appointment_id))
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    try:
        result = await AuthorizationStateMachine.authorize_appointment(
            appointment=appointment,
            auth_code=auth_request.auth_code,
            authorized_by=current_user
        )
        
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{appointment_id}/complete", response_model=dict)
async def complete_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Complete an appointment (Authorized -> Completed).
    
    Automatically generates invoice via BillingEngine.
    """
    check_permission(current_user, "appointments", "complete")
    
    appointment = await Appointment.get(PydanticObjectId(appointment_id))
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    try:
        result = await AuthorizationStateMachine.complete_appointment(appointment)
        
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{appointment_id}/state-info", response_model=dict)
async def get_state_machine_info(
    appointment_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get state machine information for an appointment."""
    check_permission(current_user, "appointments", "read")
    
    appointment = await Appointment.get(PydanticObjectId(appointment_id))
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    next_states = AuthorizationStateMachine.get_next_valid_states(appointment.status)
    
    return {
        "current_status": appointment.status.value,
        "can_authorize": appointment.can_authorize(),
        "can_complete": appointment.can_complete(),
        "next_valid_states": [s.value for s in next_states],
        "state_flow": "Pending Auth → Authorized → Completed"
    }
