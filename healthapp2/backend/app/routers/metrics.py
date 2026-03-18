from datetime import datetime
from fastapi import APIRouter, Depends
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
from app.models.appointment import Appointment, AuthorizationStatus
from app.models.billing import Billing, PaymentStatus
from app.models.user import User
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/metrics", tags=["Metrics"])

# Prometheus metrics
appointment_state_transitions = Counter(
    'appointment_state_transitions_total',
    'Total number of appointment state transitions',
    ['from_state', 'to_state']
)

authorization_time = Histogram(
    'authorization_time_seconds',
    'Time from appointment creation to authorization',
    buckets=[3600, 7200, 14400, 28800, 86400, 172800, 604800]  # 1h, 2h, 4h, 8h, 1d, 2d, 7d
)

payment_time = Histogram(
    'payment_time_seconds',
    'Time from invoice creation to payment',
    buckets=[86400, 604800, 1209600, 2592000, 5184000, 7776000]  # 1d, 7d, 14d, 30d, 60d, 90d
)

active_appointments = Gauge(
    'active_appointments_total',
    'Total number of active appointments',
    ['status']
)

revenue_total = Gauge(
    'revenue_total_dollars',
    'Total revenue in dollars'
)

outstanding_balance = Gauge(
    'outstanding_balance_dollars',
    'Total outstanding balance in dollars'
)


@router.get("/prometheus")
async def prometheus_metrics():
    """
    Prometheus metrics endpoint.
    
    Exposes metrics for:
    - Appointment state transitions
    - Authorization time (Pending -> Authorized)
    - Payment time (Invoice -> Paid)
    - Active appointment counts by status
    - Revenue metrics
    """
    # Update gauges with current data
    await update_appointment_gauges()
    await update_revenue_gauges()
    
    # Generate Prometheus format
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )


async def update_appointment_gauges():
    """Update appointment-related gauges."""
    pending = await Appointment.find(
        Appointment.status == AuthorizationStatus.PENDING
    ).count()
    
    authorized = await Appointment.find(
        Appointment.status == AuthorizationStatus.AUTHORIZED
    ).count()
    
    completed = await Appointment.find(
        Appointment.status == AuthorizationStatus.COMPLETED
    ).count()
    
    active_appointments.labels(status='pending').set(pending)
    active_appointments.labels(status='authorized').set(authorized)
    active_appointments.labels(status='completed').set(completed)


async def update_revenue_gauges():
    """Update revenue-related gauges."""
    all_billing = await Billing.find_all().to_list()
    
    total = sum(b.total_amount for b in all_billing)
    outstanding = sum(b.balance_due for b in all_billing if b.payment_status != PaymentStatus.PAID)
    
    revenue_total.set(total)
    outstanding_balance.set(outstanding)


@router.get("/authorization-metrics", response_model=dict)
async def get_authorization_metrics(
    current_user: User = Depends(get_current_user)
):
    """
    Get authorization timing metrics.
    
    Shows average time from appointment creation to authorization.
    """
    # Fetch all authorized appointments
    authorized_appointments = await Appointment.find(
        Appointment.status != AuthorizationStatus.PENDING,
        Appointment.authorized_at != None
    ).to_list()
    
    if not authorized_appointments:
        return {
            "metric": "authorization_time",
            "count": 0,
            "average_seconds": 0,
            "average_hours": 0,
            "average_days": 0
        }
    
    # Calculate time differences
    times = []
    for apt in authorized_appointments:
        time_diff = (apt.authorized_at - apt.created_at).total_seconds()
        times.append(time_diff)
        
        # Record in histogram
        authorization_time.observe(time_diff)
    
    avg_seconds = sum(times) / len(times)
    
    return {
        "metric": "authorization_time",
        "count": len(authorized_appointments),
        "average_seconds": round(avg_seconds, 2),
        "average_hours": round(avg_seconds / 3600, 2),
        "average_days": round(avg_seconds / 86400, 2),
        "min_seconds": round(min(times), 2),
        "max_seconds": round(max(times), 2)
    }


@router.get("/payment-metrics", response_model=dict)
async def get_payment_metrics(
    current_user: User = Depends(get_current_user)
):
    """
    Get payment timing metrics.
    
    Shows average time from invoice creation to payment.
    """
    # Fetch all paid invoices
    paid_invoices = await Billing.find(
        Billing.payment_status == PaymentStatus.PAID,
        Billing.paid_date != None
    ).to_list()
    
    if not paid_invoices:
        return {
            "metric": "payment_time",
            "count": 0,
            "average_seconds": 0,
            "average_days": 0
        }
    
    # Calculate time differences
    times = []
    for invoice in paid_invoices:
        time_diff = (invoice.paid_date - invoice.invoice_date).total_seconds()
        times.append(time_diff)
        
        # Record in histogram
        payment_time.observe(time_diff)
    
    avg_seconds = sum(times) / len(times)
    
    return {
        "metric": "payment_time",
        "count": len(paid_invoices),
        "average_seconds": round(avg_seconds, 2),
        "average_days": round(avg_seconds / 86400, 2),
        "min_days": round(min(times) / 86400, 2),
        "max_days": round(max(times) / 86400, 2)
    }


@router.get("/health")
async def health_check():
    """
    Health check endpoint for Kubernetes liveness/readiness probes.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "HealthApp API"
    }
