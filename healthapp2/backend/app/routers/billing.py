from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from beanie import PydanticObjectId
from app.models.billing import Billing, PaymentStatus
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.auth.rbac import check_permission
from app.services.pdf_generator import PDFInvoiceGenerator

router = APIRouter(prefix="/api/billing", tags=["Billing"])


class PaymentRecord(BaseModel):
    amount: float


@router.get("/", response_model=List[dict])
async def list_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    payment_status: Optional[PaymentStatus] = None,
    patient_id: Optional[str] = None,
    provider_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """List all invoices with filters."""
    check_permission(current_user, "billing", "read")
    
    # Build query
    query_conditions = {}
    
    if payment_status:
        query_conditions["payment_status"] = payment_status
    
    if patient_id:
        query_conditions["patient"] = PydanticObjectId(patient_id)
    
    if provider_id:
        query_conditions["provider"] = PydanticObjectId(provider_id)
    
    if query_conditions:
        query = Billing.find(query_conditions)
    else:
        query = Billing.find_all()
    
    invoices = await query.skip(skip).limit(limit).to_list()
    
    # Fetch related data
    result = []
    for invoice in invoices:
        await invoice.fetch_all_links()
        
        result.append({
            "id": str(invoice.id),
            "invoice_number": invoice.invoice_number,
            "patient": {
                "id": str(invoice.patient.id),
                "name": invoice.patient.full_name
            },
            "provider": {
                "id": str(invoice.provider.id),
                "name": invoice.provider.full_name,
                "role": invoice.provider.role.value
            },
            "total_amount": invoice.total_amount,
            "paid_amount": invoice.paid_amount,
            "balance_due": invoice.balance_due,
            "payment_status": invoice.payment_status.value,
            "invoice_date": invoice.invoice_date.isoformat(),
            "due_date": invoice.due_date.isoformat(),
            "days_overdue": invoice.days_overdue
        })
    
    return result


@router.get("/{invoice_id}", response_model=dict)
async def get_invoice(
    invoice_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed invoice information."""
    check_permission(current_user, "billing", "read")
    
    invoice = await Billing.get(PydanticObjectId(invoice_id))
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    await invoice.fetch_all_links()
    
    return {
        "id": str(invoice.id),
        "invoice_number": invoice.invoice_number,
        "patient": {
            "id": str(invoice.patient.id),
            "name": invoice.patient.full_name,
            "email": invoice.patient.email,
            "phone": invoice.patient.phone
        },
        "provider": {
            "id": str(invoice.provider.id),
            "name": invoice.provider.full_name,
            "role": invoice.provider.role.value
        },
        "appointment": {
            "id": str(invoice.appointment.id),
            "scheduled_date": invoice.appointment.scheduled_date.isoformat(),
            "appointment_type": invoice.appointment.appointment_type.value
        },
        "billing_details": {
            "base_rate": invoice.base_rate,
            "duration_hours": invoice.duration_hours,
            "role_multiplier": invoice.role_multiplier,
            "subtotal": invoice.subtotal,
            "tax_rate": invoice.tax_rate,
            "tax_amount": invoice.tax_amount,
            "total_amount": invoice.total_amount
        },
        "payment_details": {
            "paid_amount": invoice.paid_amount,
            "balance_due": invoice.balance_due,
            "payment_status": invoice.payment_status.value
        },
        "dates": {
            "invoice_date": invoice.invoice_date.isoformat(),
            "due_date": invoice.due_date.isoformat(),
            "paid_date": invoice.paid_date.isoformat() if invoice.paid_date else None,
            "days_overdue": invoice.days_overdue
        },
        "notes": invoice.notes,
        "created_at": invoice.created_at.isoformat()
    }


@router.post("/{invoice_id}/payment", response_model=dict)
async def record_payment(
    invoice_id: str,
    payment: PaymentRecord,
    current_user: User = Depends(get_current_user)
):
    """Record a payment against an invoice."""
    check_permission(current_user, "billing", "update")
    
    invoice = await Billing.get(PydanticObjectId(invoice_id))
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    if payment.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount must be positive"
        )
    
    await invoice.record_payment(payment.amount)
    
    return {
        "message": "Payment recorded successfully",
        "invoice_id": str(invoice.id),
        "invoice_number": invoice.invoice_number,
        "paid_amount": invoice.paid_amount,
        "balance_due": invoice.balance_due,
        "payment_status": invoice.payment_status.value
    }


@router.get("/{invoice_id}/pdf")
async def download_invoice_pdf(
    invoice_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Download invoice as PDF.
    
    Uses ReportLab to generate professional invoices.
    """
    check_permission(current_user, "billing", "read")
    
    invoice = await Billing.get(PydanticObjectId(invoice_id))
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Generate PDF
    pdf_buffer = await PDFInvoiceGenerator.generate_invoice_pdf(invoice)
    filename = await PDFInvoiceGenerator.generate_invoice_filename(invoice)
    
    # Return as downloadable file
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/overdue/summary", response_model=dict)
async def get_overdue_summary(
    current_user: User = Depends(get_current_user)
):
    """
    Get summary of overdue invoices by bucket (30/60/90+ days).
    
    This is used in the Finance Master report.
    """
    check_permission(current_user, "billing", "read")
    
    # Fetch all unpaid invoices
    unpaid = await Billing.find(
        Billing.payment_status != PaymentStatus.PAID
    ).to_list()
    
    # Categorize by overdue bucket
    buckets = {
        "current": [],
        "overdue_30": [],
        "overdue_60": [],
        "overdue_90": []
    }
    
    for invoice in unpaid:
        days = invoice.days_overdue
        
        if days >= 90:
            buckets["overdue_90"].append(invoice)
        elif days >= 60:
            buckets["overdue_60"].append(invoice)
        elif days >= 30:
            buckets["overdue_30"].append(invoice)
        else:
            buckets["current"].append(invoice)
    
    return {
        "summary": {
            "current": {
                "count": len(buckets["current"]),
                "total_amount": sum(inv.balance_due for inv in buckets["current"])
            },
            "overdue_30_days": {
                "count": len(buckets["overdue_30"]),
                "total_amount": sum(inv.balance_due for inv in buckets["overdue_30"])
            },
            "overdue_60_days": {
                "count": len(buckets["overdue_60"]),
                "total_amount": sum(inv.balance_due for inv in buckets["overdue_60"])
            },
            "overdue_90_plus_days": {
                "count": len(buckets["overdue_90"]),
                "total_amount": sum(inv.balance_due for inv in buckets["overdue_90"])
            }
        },
        "total_outstanding": sum(inv.balance_due for inv in unpaid),
        "total_invoices": len(unpaid)
    }
