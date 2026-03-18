from datetime import datetime, timedelta
from typing import List, Dict
from fastapi import APIRouter, HTTPException, status, Depends, Query
from beanie import PydanticObjectId
from app.models.appointment import Appointment, AuthorizationStatus
from app.models.billing import Billing, PaymentStatus
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.auth.dependencies import get_current_user
from app.auth.rbac import check_permission

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/schedule-master", response_model=dict)
async def get_schedule_master(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user)
):
    """
    Schedule Master Report: Weekly view of all provider loads.
    
    Shows appointments grouped by provider with total hours.
    """
    check_permission(current_user, "reports", "read")
    
    # Parse dates
    start = datetime.fromisoformat(f"{start_date}T00:00:00")
    end = datetime.fromisoformat(f"{end_date}T23:59:59")
    
    # Fetch appointments in date range
    appointments = await Appointment.find(
        Appointment.scheduled_date >= start,
        Appointment.scheduled_date <= end
    ).to_list()
    
    # Group by provider
    provider_loads = {}
    
    for apt in appointments:
        await apt.fetch_link(Appointment.provider)
        await apt.fetch_link(Appointment.patient)
        
        provider_id = str(apt.provider.id)
        
        if provider_id not in provider_loads:
            provider_loads[provider_id] = {
                "provider_name": apt.provider.full_name,
                "provider_role": apt.provider.role.value,
                "total_hours": 0,
                "appointment_count": 0,
                "appointments": []
            }
        
        provider_loads[provider_id]["total_hours"] += apt.duration_hours
        provider_loads[provider_id]["appointment_count"] += 1
        provider_loads[provider_id]["appointments"].append({
            "id": str(apt.id),
            "patient_name": apt.patient.full_name,
            "scheduled_date": apt.scheduled_date.isoformat(),
            "duration_hours": apt.duration_hours,
            "status": apt.status.value,
            "appointment_type": apt.appointment_type.value
        })
    
    # Calculate totals
    total_appointments = sum(p["appointment_count"] for p in provider_loads.values())
    total_hours = sum(p["total_hours"] for p in provider_loads.values())
    
    return {
        "report_name": "Schedule Master",
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "summary": {
            "total_providers": len(provider_loads),
            "total_appointments": total_appointments,
            "total_hours": total_hours,
            "average_hours_per_provider": round(total_hours / len(provider_loads), 2) if provider_loads else 0
        },
        "provider_loads": list(provider_loads.values())
    }


@router.get("/finance-master", response_model=dict)
async def get_finance_master(
    current_user: User = Depends(get_current_user)
):
    """
    Finance Master Report: Total revenue, pending claims, and overdue buckets.
    
    Shows:
    - Total revenue (all invoices)
    - Paid revenue
    - Pending revenue
    - Overdue buckets (30/60/90+ days)
    """
    check_permission(current_user, "reports", "read")
    
    # Fetch all invoices
    all_invoices = await Billing.find_all().to_list()
    
    # Calculate metrics
    total_revenue = sum(inv.total_amount for inv in all_invoices)
    total_paid = sum(inv.paid_amount for inv in all_invoices)
    total_pending = sum(inv.balance_due for inv in all_invoices if inv.payment_status != PaymentStatus.PAID)
    
    # Categorize by payment status
    paid_invoices = [inv for inv in all_invoices if inv.payment_status == PaymentStatus.PAID]
    pending_invoices = [inv for inv in all_invoices if inv.payment_status == PaymentStatus.PENDING]
    
    # Overdue buckets
    overdue_30 = [inv for inv in all_invoices if inv.payment_status == PaymentStatus.OVERDUE_30]
    overdue_60 = [inv for inv in all_invoices if inv.payment_status == PaymentStatus.OVERDUE_60]
    overdue_90 = [inv for inv in all_invoices if inv.payment_status == PaymentStatus.OVERDUE_90]
    
    return {
        "report_name": "Finance Master",
        "generated_at": datetime.utcnow().isoformat(),
        "revenue_summary": {
            "total_revenue": round(total_revenue, 2),
            "total_paid": round(total_paid, 2),
            "total_pending": round(total_pending, 2),
            "collection_rate": round((total_paid / total_revenue * 100), 2) if total_revenue > 0 else 0
        },
        "invoice_counts": {
            "total_invoices": len(all_invoices),
            "paid": len(paid_invoices),
            "pending": len(pending_invoices),
            "overdue": len(overdue_30) + len(overdue_60) + len(overdue_90)
        },
        "overdue_buckets": {
            "30_days": {
                "count": len(overdue_30),
                "total_amount": round(sum(inv.balance_due for inv in overdue_30), 2)
            },
            "60_days": {
                "count": len(overdue_60),
                "total_amount": round(sum(inv.balance_due for inv in overdue_60), 2)
            },
            "90_plus_days": {
                "count": len(overdue_90),
                "total_amount": round(sum(inv.balance_due for inv in overdue_90), 2)
            }
        }
    }


@router.get("/auth-master", response_model=dict)
async def get_auth_master(
    current_user: User = Depends(get_current_user)
):
    """
    Auth Master Report: List of all visits stuck in 'Pending Auth'.
    
    Shows appointments waiting for authorization with aging.
    """
    check_permission(current_user, "reports", "read")
    
    # Fetch all pending auth appointments
    pending_appointments = await Appointment.find(
        Appointment.status == AuthorizationStatus.PENDING
    ).to_list()
    
    # Prepare detailed list
    pending_list = []
    
    for apt in pending_appointments:
        await apt.fetch_all_links()
        
        days_pending = (datetime.utcnow() - apt.created_at).days
        
        pending_list.append({
            "id": str(apt.id),
            "patient": {
                "id": str(apt.patient.id),
                "name": apt.patient.full_name,
                "insurance_provider": apt.patient.insurance_provider
            },
            "provider": {
                "id": str(apt.provider.id),
                "name": apt.provider.full_name,
                "role": apt.provider.role.value
            },
            "scheduled_date": apt.scheduled_date.isoformat(),
            "appointment_type": apt.appointment_type.value,
            "duration_hours": apt.duration_hours,
            "created_at": apt.created_at.isoformat(),
            "days_pending": days_pending,
            "urgency": "High" if days_pending >= 7 else "Medium" if days_pending >= 3 else "Low"
        })
    
    # Sort by days pending (most urgent first)
    pending_list.sort(key=lambda x: x["days_pending"], reverse=True)
    
    return {
        "report_name": "Authorization Master",
        "generated_at": datetime.utcnow().isoformat(),
        "summary": {
            "total_pending": len(pending_list),
            "high_urgency": len([p for p in pending_list if p["urgency"] == "High"]),
            "medium_urgency": len([p for p in pending_list if p["urgency"] == "Medium"]),
            "low_urgency": len([p for p in pending_list if p["urgency"] == "Low"]),
            "average_days_pending": round(
                sum(p["days_pending"] for p in pending_list) / len(pending_list), 1
            ) if pending_list else 0
        },
        "pending_authorizations": pending_list
    }


@router.get("/provider-performance", response_model=dict)
async def get_provider_performance(
    start_date: str = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user)
):
    """
    Provider Performance Report: Compare Physician vs Clinician performance.
    
    Shows:
    - Average visit length per provider
    - Revenue generated per provider
    - Number of completed visits
    - Comparison by role
    """
    check_permission(current_user, "reports", "read")
    
    # Parse dates (default to last 30 days)
    if not start_date:
        start = datetime.utcnow() - timedelta(days=30)
        start_date = start.strftime("%Y-%m-%d")
    else:
        start = datetime.fromisoformat(f"{start_date}T00:00:00")
    
    if not end_date:
        end = datetime.utcnow()
        end_date = end.strftime("%Y-%m-%d")
    else:
        end = datetime.fromisoformat(f"{end_date}T23:59:59")
    
    # Fetch completed appointments in date range
    completed_appointments = await Appointment.find(
        Appointment.status == AuthorizationStatus.COMPLETED,
        Appointment.completed_at >= start,
        Appointment.completed_at <= end
    ).to_list()
    
    # Fetch corresponding billing records
    appointment_ids = [apt.id for apt in completed_appointments]
    billing_records = await Billing.find(
        {"appointment": {"$in": appointment_ids}}
    ).to_list()
    
    # Group by provider
    provider_stats = {}
    
    for apt in completed_appointments:
        await apt.fetch_link(Appointment.provider)
        
        provider_id = str(apt.provider.id)
        
        if provider_id not in provider_stats:
            provider_stats[provider_id] = {
                "provider_name": apt.provider.full_name,
                "provider_role": apt.provider.role.value,
                "visit_count": 0,
                "total_hours": 0,
                "total_revenue": 0
            }
        
        provider_stats[provider_id]["visit_count"] += 1
        provider_stats[provider_id]["total_hours"] += apt.duration_hours
    
    # Add revenue data
    for billing in billing_records:
        await billing.fetch_link(Billing.provider)
        provider_id = str(billing.provider.id)
        
        if provider_id in provider_stats:
            provider_stats[provider_id]["total_revenue"] += billing.total_amount
    
    # Calculate averages and add to each provider
    for provider_id, stats in provider_stats.items():
        if stats["visit_count"] > 0:
            stats["average_visit_hours"] = round(stats["total_hours"] / stats["visit_count"], 2)
            stats["average_revenue_per_visit"] = round(stats["total_revenue"] / stats["visit_count"], 2)
            stats["revenue_per_hour"] = round(stats["total_revenue"] / stats["total_hours"], 2) if stats["total_hours"] > 0 else 0
    
    # Group by role for comparison
    role_comparison = {}
    
    for stats in provider_stats.values():
        role = stats["provider_role"]
        
        if role not in role_comparison:
            role_comparison[role] = {
                "provider_count": 0,
                "total_visits": 0,
                "total_hours": 0,
                "total_revenue": 0
            }
        
        role_comparison[role]["provider_count"] += 1
        role_comparison[role]["total_visits"] += stats["visit_count"]
        role_comparison[role]["total_hours"] += stats["total_hours"]
        role_comparison[role]["total_revenue"] += stats["total_revenue"]
    
    # Calculate role averages
    for role, stats in role_comparison.items():
        if stats["provider_count"] > 0:
            stats["avg_visits_per_provider"] = round(stats["total_visits"] / stats["provider_count"], 2)
            stats["avg_hours_per_provider"] = round(stats["total_hours"] / stats["provider_count"], 2)
            stats["avg_revenue_per_provider"] = round(stats["total_revenue"] / stats["provider_count"], 2)
    
    return {
        "report_name": "Provider Performance",
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "generated_at": datetime.utcnow().isoformat(),
        "individual_providers": list(provider_stats.values()),
        "role_comparison": role_comparison,
        "totals": {
            "total_providers": len(provider_stats),
            "total_visits": sum(s["visit_count"] for s in provider_stats.values()),
            "total_revenue": round(sum(s["total_revenue"] for s in provider_stats.values()), 2)
        }
    }


@router.get("/dashboard-summary", response_model=dict)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user)
):
    """
    Dashboard Summary: High-level KPIs for the main dashboard.
    
    Combines key metrics from all reports.
    """
    check_permission(current_user, "reports", "read")
    
    # Today's date range
    today = datetime.utcnow().date()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())
    
    # Fetch counts
    total_patients = await Patient.find(Patient.is_active == True).count()
    total_appointments = await Appointment.find_all().count()
    pending_auth = await Appointment.find(Appointment.status == AuthorizationStatus.PENDING).count()
    todays_appointments = await Appointment.find(
        Appointment.scheduled_date >= today_start,
        Appointment.scheduled_date <= today_end
    ).count()
    
    # Financial summary
    all_billing = await Billing.find_all().to_list()
    total_revenue = sum(b.total_amount for b in all_billing)
    total_outstanding = sum(b.balance_due for b in all_billing if b.payment_status != PaymentStatus.PAID)
    
    return {
        "report_name": "Dashboard Summary",
        "generated_at": datetime.utcnow().isoformat(),
        "kpis": {
            "total_active_patients": total_patients,
            "total_appointments": total_appointments,
            "pending_authorizations": pending_auth,
            "todays_appointments": todays_appointments,
            "total_revenue": round(total_revenue, 2),
            "outstanding_balance": round(total_outstanding, 2)
        }
    }
