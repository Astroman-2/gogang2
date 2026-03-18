"""
Seed Data Script for HealthApp EMR & RCM System

Generates 50 realistic patient profiles with:
- Demographics
- Medical history
- Vitals
- Sample appointments
- Sample billing records

Usage:
    python scripts/seed_data.py
"""

import asyncio
import random
from datetime import datetime, timedelta, date
from faker import Faker
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.user import User, UserRole
from app.models.patient import Patient, Gender, BloodType
from app.models.appointment import Appointment, AuthorizationStatus, AppointmentType
from app.models.billing import Billing, PaymentStatus
from app.auth.jwt import get_password_hash
from app.services.billing_engine import BillingEngine

fake = Faker()

# Medical conditions pool
CHRONIC_CONDITIONS = [
    "Hypertension", "Type 2 Diabetes", "Asthma", "COPD", "Arthritis",
    "High Cholesterol", "Chronic Kidney Disease", "Heart Disease",
    "Depression", "Anxiety Disorder", "Migraine", "Osteoporosis"
]

ALLERGIES = [
    "Penicillin", "Sulfa drugs", "Aspirin", "Ibuprofen", "Latex",
    "Peanuts", "Shellfish", "Bee stings", "Pet dander", "Pollen"
]

MEDICATIONS = [
    "Lisinopril", "Metformin", "Amlodipine", "Metoprolol", "Omeprazole",
    "Simvastatin", "Losartan", "Albuterol", "Gabapentin", "Hydrochlorothiazide",
    "Sertraline", "Levothyroxine", "Atorvastatin", "Prednisone"
]


async def create_users():
    """Create system users (Admin, Physicians, Clinicians)."""
    print("Creating users...")
    
    users = []
    
    # Admin user
    admin = User(
        email="admin@healthapp.com",
        username="admin",
        hashed_password=get_password_hash("admin123"),
        full_name="System Administrator",
        role=UserRole.ADMIN
    )
    await admin.insert()
    users.append(admin)
    print(f"  ✓ Created Admin: {admin.full_name}")
    
    # 5 Physicians
    for i in range(5):
        physician = User(
            email=fake.email(),
            username=f"physician{i+1}",
            hashed_password=get_password_hash("password123"),
            full_name=f"Dr. {fake.name()}",
            role=UserRole.PHYSICIAN
        )
        await physician.insert()
        users.append(physician)
        print(f"  ✓ Created Physician: {physician.full_name}")
    
    # 5 Clinicians
    for i in range(5):
        clinician = User(
            email=fake.email(),
            username=f"clinician{i+1}",
            hashed_password=get_password_hash("password123"),
            full_name=fake.name(),
            role=UserRole.CLINICIAN
        )
        await clinician.insert()
        users.append(clinician)
        print(f"  ✓ Created Clinician: {clinician.full_name}")
    
    return users


async def create_patients():
    """Create 50 realistic patient profiles."""
    print("\nCreating 50 patients...")
    
    patients = []
    
    for i in range(50):
        gender = random.choice(list(Gender))
        
        # Generate realistic birth date (18-90 years old)
        age = random.randint(18, 90)
        birth_date = date.today() - timedelta(days=age*365 + random.randint(0, 365))
        
        # Select random medical conditions
        num_conditions = random.randint(0, 3)
        conditions = random.sample(CHRONIC_CONDITIONS, num_conditions) if num_conditions > 0 else []
        
        # Select random allergies
        num_allergies = random.randint(0, 2)
        allergies = random.sample(ALLERGIES, num_allergies) if num_allergies > 0 else []
        
        # Select random medications
        num_meds = random.randint(0, 4)
        medications = random.sample(MEDICATIONS, num_meds) if num_meds > 0 else []
        
        patient = Patient(
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            date_of_birth=birth_date,
            gender=gender,
            email=fake.email() if random.random() > 0.1 else None,
            phone=fake.phone_number(),
            address=fake.street_address(),
            city=fake.city(),
            state=fake.state_abbr(),
            zip_code=fake.zipcode(),
            blood_type=random.choice(list(BloodType)) if random.random() > 0.3 else None,
            allergies=allergies,
            chronic_conditions=conditions,
            current_medications=medications,
            medical_history=fake.text(max_nb_chars=200) if random.random() > 0.5 else "",
            emergency_contact_name=fake.name(),
            emergency_contact_phone=fake.phone_number(),
            emergency_contact_relationship=random.choice(["Spouse", "Parent", "Sibling", "Child", "Friend"]),
            insurance_provider=random.choice([
                "Blue Cross Blue Shield", "Aetna", "UnitedHealthcare",
                "Cigna", "Humana", "Medicare", "Medicaid"
            ]) if random.random() > 0.1 else None,
            insurance_policy_number=f"POL-{random.randint(100000, 999999)}" if random.random() > 0.1 else None
        )
        
        await patient.insert()
        patients.append(patient)
        
        if (i + 1) % 10 == 0:
            print(f"  ✓ Created {i + 1}/50 patients")
    
    print(f"  ✓ All 50 patients created")
    return patients


async def create_appointments_and_billing(patients, providers):
    """Create sample appointments with various statuses and billing records."""
    print("\nCreating appointments and billing records...")
    
    physicians = [p for p in providers if p.role == UserRole.PHYSICIAN]
    clinicians = [p for p in providers if p.role == UserRole.CLINICIAN]
    all_providers = physicians + clinicians
    
    appointment_count = 0
    billing_count = 0
    
    for patient in patients:
        # Each patient gets 1-5 appointments
        num_appointments = random.randint(1, 5)
        
        for _ in range(num_appointments):
            # Random date in the past 90 days or future 30 days
            days_offset = random.randint(-90, 30)
            scheduled_date = datetime.utcnow() + timedelta(days=days_offset)
            
            # Random duration (1-4 hours, strict constraint)
            duration = random.randint(1, 4)
            
            # Random provider
            provider = random.choice(all_providers)
            
            # Random appointment type
            apt_type = random.choice(list(AppointmentType))
            
            # Create appointment
            appointment = Appointment(
                patient=patient,
                provider=provider,
                scheduled_date=scheduled_date,
                duration_hours=duration,
                appointment_type=apt_type,
                chief_complaint=fake.sentence(nb_words=8),
                notes=fake.text(max_nb_chars=150) if random.random() > 0.5 else ""
            )
            
            # Determine status based on scheduled date
            if days_offset < -7:  # Past appointments
                # 80% chance of being completed
                if random.random() < 0.8:
                    # Authorize
                    appointment.status = AuthorizationStatus.AUTHORIZED
                    appointment.auth_code = f"AUTH-{random.randint(100000, 999999)}"
                    appointment.authorized_at = scheduled_date + timedelta(hours=random.randint(1, 48))
                    appointment.authorized_by = random.choice(physicians)
                    
                    # Complete
                    appointment.status = AuthorizationStatus.COMPLETED
                    appointment.completed_at = scheduled_date + timedelta(hours=duration)
                    appointment.diagnosis = fake.sentence(nb_words=6)
                    appointment.treatment_plan = fake.text(max_nb_chars=100)
                    
                else:
                    # 15% authorized but not completed
                    if random.random() < 0.75:
                        appointment.status = AuthorizationStatus.AUTHORIZED
                        appointment.auth_code = f"AUTH-{random.randint(100000, 999999)}"
                        appointment.authorized_at = scheduled_date + timedelta(hours=random.randint(1, 48))
                        appointment.authorized_by = random.choice(physicians)
                    # 5% still pending (stuck in auth)
            
            elif days_offset < 0:  # Recent past (last 7 days)
                # 50% completed, 30% authorized, 20% pending
                rand = random.random()
                if rand < 0.5:
                    appointment.status = AuthorizationStatus.AUTHORIZED
                    appointment.auth_code = f"AUTH-{random.randint(100000, 999999)}"
                    appointment.authorized_at = scheduled_date + timedelta(hours=random.randint(1, 48))
                    appointment.authorized_by = random.choice(physicians)
                    
                    appointment.status = AuthorizationStatus.COMPLETED
                    appointment.completed_at = scheduled_date + timedelta(hours=duration)
                    appointment.diagnosis = fake.sentence(nb_words=6)
                    appointment.treatment_plan = fake.text(max_nb_chars=100)
                elif rand < 0.8:
                    appointment.status = AuthorizationStatus.AUTHORIZED
                    appointment.auth_code = f"AUTH-{random.randint(100000, 999999)}"
                    appointment.authorized_at = scheduled_date + timedelta(hours=random.randint(1, 48))
                    appointment.authorized_by = random.choice(physicians)
            
            # Future appointments stay as pending
            
            await appointment.insert()
            appointment_count += 1
            
            # Create billing for completed appointments
            if appointment.status == AuthorizationStatus.COMPLETED:
                # Calculate billing using BillingEngine
                multiplier = BillingEngine.calculate_multiplier(provider.role)
                subtotal = BillingEngine.calculate_subtotal(150.0, duration, multiplier)
                
                # Random payment status
                payment_rand = random.random()
                if payment_rand < 0.6:  # 60% paid
                    payment_status = PaymentStatus.PAID
                    paid_amount = subtotal
                    paid_date = appointment.completed_at + timedelta(days=random.randint(1, 14))
                elif payment_rand < 0.8:  # 20% pending
                    payment_status = PaymentStatus.PENDING
                    paid_amount = 0
                    paid_date = None
                elif payment_rand < 0.9:  # 10% overdue 30
                    payment_status = PaymentStatus.OVERDUE_30
                    paid_amount = 0
                    paid_date = None
                elif payment_rand < 0.95:  # 5% overdue 60
                    payment_status = PaymentStatus.OVERDUE_60
                    paid_amount = 0
                    paid_date = None
                else:  # 5% overdue 90+
                    payment_status = PaymentStatus.OVERDUE_90
                    paid_amount = 0
                    paid_date = None
                
                balance_due = subtotal - paid_amount
                
                # Adjust due date based on status
                if payment_status == PaymentStatus.OVERDUE_30:
                    due_date = appointment.completed_at + timedelta(days=30) - timedelta(days=random.randint(1, 10))
                elif payment_status == PaymentStatus.OVERDUE_60:
                    due_date = appointment.completed_at + timedelta(days=60) - timedelta(days=random.randint(10, 20))
                elif payment_status == PaymentStatus.OVERDUE_90:
                    due_date = appointment.completed_at + timedelta(days=90) - timedelta(days=random.randint(20, 30))
                else:
                    due_date = appointment.completed_at + timedelta(days=30)
                
                billing = Billing(
                    patient=patient,
                    appointment=appointment,
                    provider=provider,
                    base_rate=150.0,
                    duration_hours=duration,
                    role_multiplier=multiplier,
                    subtotal=subtotal,
                    tax_rate=0.0,
                    tax_amount=0.0,
                    total_amount=subtotal,
                    paid_amount=paid_amount,
                    balance_due=balance_due,
                    payment_status=payment_status,
                    invoice_number=BillingEngine.generate_invoice_number(),
                    invoice_date=appointment.completed_at,
                    due_date=due_date,
                    paid_date=paid_date,
                    notes=f"{apt_type.value} visit - {duration} hour(s)"
                )
                
                await billing.insert()
                billing_count += 1
    
    print(f"  ✓ Created {appointment_count} appointments")
    print(f"  ✓ Created {billing_count} billing records")


async def main():
    """Main seed data function."""
    print("="*60)
    print("HealthApp EMR & RCM - Database Seeding")
    print("="*60)
    
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    
    await init_beanie(
        database=client.healthapp,
        document_models=[User, Patient, Appointment, Billing]
    )
    
    print("✓ Connected to MongoDB\n")
    
    # Create data
    users = await create_users()
    patients = await create_patients()
    await create_appointments_and_billing(patients, users)
    
    print("\n" + "="*60)
    print("Seed Data Summary:")
    print("="*60)
    print(f"Users: {len(users)} (1 Admin, 5 Physicians, 5 Clinicians)")
    print(f"Patients: {len(patients)}")
    print(f"Appointments: Multiple per patient (various statuses)")
    print(f"Billing Records: Auto-generated for completed appointments")
    print("\nDefault Credentials:")
    print("  Admin: username='admin', password='admin123'")
    print("  Physicians: username='physician1-5', password='password123'")
    print("  Clinicians: username='clinician1-5', password='password123'")
    print("="*60)
    print("✓ Seeding complete!\n")


if __name__ == "__main__":
    asyncio.run(main())
