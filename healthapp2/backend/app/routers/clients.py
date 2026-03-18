from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel, EmailStr
from beanie import PydanticObjectId
from app.models.patient import Patient, Gender, BloodType
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.auth.rbac import check_permission

router = APIRouter(prefix="/api/clients", tags=["Patients/Clients"])


class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: str
    gender: Gender
    email: Optional[EmailStr] = None
    phone: str
    address: str
    city: str
    state: str
    zip_code: str
    blood_type: Optional[BloodType] = None
    allergies: List[str] = []
    chronic_conditions: List[str] = []
    current_medications: List[str] = []
    medical_history: str = ""
    emergency_contact_name: str
    emergency_contact_phone: str
    emergency_contact_relationship: str
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    blood_type: Optional[BloodType] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    current_medications: Optional[List[str]] = None
    medical_history: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None


@router.get("/", response_model=List[dict])
async def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    is_active: bool = True,
    current_user: User = Depends(get_current_user)
):
    """
    List all patients with pagination and search.
    
    Permissions: All authenticated users can read patients.
    """
    check_permission(current_user, "patients", "read")
    
    # Build query
    query = Patient.find(Patient.is_active == is_active)
    
    # Apply search filter
    if search:
        # Search by name, email, or phone
        query = Patient.find({
            "$and": [
                {"is_active": is_active},
                {
                    "$or": [
                        {"first_name": {"$regex": search, "$options": "i"}},
                        {"last_name": {"$regex": search, "$options": "i"}},
                        {"email": {"$regex": search, "$options": "i"}},
                        {"phone": {"$regex": search, "$options": "i"}}
                    ]
                }
            ]
        })
    
    patients = await query.skip(skip).limit(limit).to_list()
    
    return [
        {
            "id": str(p.id),
            "first_name": p.first_name,
            "last_name": p.last_name,
            "full_name": p.full_name,
            "date_of_birth": str(p.date_of_birth),
            "age": p.age,
            "gender": p.gender.value,
            "email": p.email,
            "phone": p.phone,
            "city": p.city,
            "state": p.state,
            "is_active": p.is_active
        }
        for p in patients
    ]


@router.get("/{patient_id}", response_model=dict)
async def get_patient(
    patient_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed patient information."""
    check_permission(current_user, "patients", "read")
    
    patient = await Patient.get(PydanticObjectId(patient_id))
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return {
        "id": str(patient.id),
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "full_name": patient.full_name,
        "date_of_birth": str(patient.date_of_birth),
        "age": patient.age,
        "gender": patient.gender.value,
        "email": patient.email,
        "phone": patient.phone,
        "address": patient.address,
        "city": patient.city,
        "state": patient.state,
        "zip_code": patient.zip_code,
        "blood_type": patient.blood_type.value if patient.blood_type else None,
        "allergies": patient.allergies,
        "chronic_conditions": patient.chronic_conditions,
        "current_medications": patient.current_medications,
        "medical_history": patient.medical_history,
        "emergency_contact_name": patient.emergency_contact_name,
        "emergency_contact_phone": patient.emergency_contact_phone,
        "emergency_contact_relationship": patient.emergency_contact_relationship,
        "insurance_provider": patient.insurance_provider,
        "insurance_policy_number": patient.insurance_policy_number,
        "is_active": patient.is_active,
        "created_at": patient.created_at.isoformat()
    }


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_data: PatientCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new patient record."""
    check_permission(current_user, "patients", "create")
    
    from datetime import datetime as dt
    
    patient = Patient(
        **patient_data.model_dump(exclude={'date_of_birth'}),
        date_of_birth=dt.strptime(patient_data.date_of_birth, '%Y-%m-%d').date()
    )
    
    await patient.insert()
    
    return {
        "message": "Patient created successfully",
        "patient_id": str(patient.id),
        "full_name": patient.full_name
    }


@router.put("/{patient_id}", response_model=dict)
async def update_patient(
    patient_id: str,
    patient_data: PatientUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update patient information."""
    check_permission(current_user, "patients", "update")
    
    patient = await Patient.get(PydanticObjectId(patient_id))
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Update fields
    update_data = patient_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)
    
    patient.updated_at = datetime.utcnow()
    await patient.save()
    
    return {
        "message": "Patient updated successfully",
        "patient_id": str(patient.id)
    }


@router.delete("/{patient_id}", response_model=dict)
async def delete_patient(
    patient_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Soft delete a patient (HIPAA compliance).
    
    Sets is_active=False instead of actual deletion.
    """
    check_permission(current_user, "patients", "delete")
    
    patient = await Patient.get(PydanticObjectId(patient_id))
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Soft delete
    patient.is_active = False
    patient.deleted_at = datetime.utcnow()
    patient.updated_at = datetime.utcnow()
    
    await patient.save()
    
    return {
        "message": "Patient deactivated successfully (soft delete for HIPAA compliance)",
        "patient_id": str(patient.id)
    }
