from datetime import datetime
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from app.models.billing import Billing


class PDFInvoiceGenerator:
    """
    Generate professional PDF invoices using ReportLab.
    
    Creates HIPAA-compliant invoices with:
    - Company header
    - Patient and provider information
    - Itemized billing breakdown
    - Payment details and due date
    """
    
    @staticmethod
    async def generate_invoice_pdf(billing: Billing) -> BytesIO:
        """
        Generate PDF invoice from Billing document.
        
        Args:
            billing: Billing document with all invoice data
        
        Returns:
            BytesIO buffer containing PDF data
        """
        # Fetch all related documents
        await billing.fetch_all_links()
        
        patient = billing.patient
        provider = billing.provider
        appointment = billing.appointment
        
        # Create PDF buffer
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Container for PDF elements
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e3a8a'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        header_style = ParagraphStyle(
            'CustomHeader',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e3a8a'),
            spaceAfter=12
        )
        
        # Company Header
        elements.append(Paragraph("HealthApp EMR & RCM", title_style))
        elements.append(Paragraph("Medical Invoice", styles['Heading2']))
        elements.append(Spacer(1, 0.2 * inch))
        
        # Invoice Information
        invoice_info = [
            ['Invoice Number:', billing.invoice_number],
            ['Invoice Date:', billing.invoice_date.strftime('%B %d, %Y')],
            ['Due Date:', billing.due_date.strftime('%B %d, %Y')],
            ['Payment Status:', billing.payment_status.value],
        ]
        
        invoice_table = Table(invoice_info, colWidths=[2*inch, 3*inch])
        invoice_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        elements.append(invoice_table)
        elements.append(Spacer(1, 0.3 * inch))
        
        # Patient Information
        elements.append(Paragraph("Bill To:", header_style))
        patient_info = f"""
        <b>{patient.full_name}</b><br/>
        {patient.address}<br/>
        {patient.city}, {patient.state} {patient.zip_code}<br/>
        Phone: {patient.phone}
        """
        elements.append(Paragraph(patient_info, styles['Normal']))
        elements.append(Spacer(1, 0.2 * inch))
        
        # Provider Information
        elements.append(Paragraph("Provider:", header_style))
        provider_info = f"""
        <b>{provider.full_name}</b><br/>
        Role: {provider.role.value}<br/>
        Email: {provider.email}
        """
        elements.append(Paragraph(provider_info, styles['Normal']))
        elements.append(Spacer(1, 0.3 * inch))
        
        # Services Table
        elements.append(Paragraph("Services Rendered:", header_style))
        
        # Fetch appointment details
        await appointment.fetch_all_links()
        
        service_data = [
            ['Description', 'Date', 'Duration', 'Rate', 'Multiplier', 'Amount'],
            [
                f"{appointment.appointment_type.value} Visit",
                appointment.scheduled_date.strftime('%Y-%m-%d'),
                f"{billing.duration_hours} hour(s)",
                f"${billing.base_rate:.2f}/hr",
                f"{billing.role_multiplier}x",
                f"${billing.subtotal:.2f}"
            ]
        ]
        
        service_table = Table(service_data, colWidths=[1.8*inch, 1*inch, 0.9*inch, 0.9*inch, 0.9*inch, 1*inch])
        service_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
        ]))
        
        elements.append(service_table)
        elements.append(Spacer(1, 0.3 * inch))
        
        # Totals
        totals_data = [
            ['Subtotal:', f"${billing.subtotal:.2f}"],
            ['Tax:', f"${billing.tax_amount:.2f}"],
            ['Total Amount:', f"${billing.total_amount:.2f}"],
            ['Amount Paid:', f"${billing.paid_amount:.2f}"],
            ['Balance Due:', f"${billing.balance_due:.2f}"],
        ]
        
        totals_table = Table(totals_data, colWidths=[4.5*inch, 1.5*inch])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),
            ('FONTSIZE', (0, 0), (-1, -2), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        elements.append(totals_table)
        elements.append(Spacer(1, 0.5 * inch))
        
        # Payment Instructions
        elements.append(Paragraph("Payment Instructions:", header_style))
        payment_text = f"""
        Please remit payment by <b>{billing.due_date.strftime('%B %d, %Y')}</b>.<br/>
        Make checks payable to: <b>HealthApp Medical Services</b><br/>
        Include invoice number <b>{billing.invoice_number}</b> with payment.<br/><br/>
        <i>Thank you for choosing HealthApp for your healthcare needs.</i>
        """
        elements.append(Paragraph(payment_text, styles['Normal']))
        
        # Notes
        if billing.notes:
            elements.append(Spacer(1, 0.3 * inch))
            elements.append(Paragraph("Notes:", header_style))
            elements.append(Paragraph(billing.notes, styles['Normal']))
        
        # Footer
        elements.append(Spacer(1, 0.5 * inch))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        )
        footer_text = f"""
        This invoice was generated on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}<br/>
        HealthApp EMR & RCM System - HIPAA Compliant
        """
        elements.append(Paragraph(footer_text, footer_style))
        
        # Build PDF
        doc.build(elements)
        
        # Reset buffer position
        buffer.seek(0)
        
        return buffer
    
    @staticmethod
    async def generate_invoice_filename(billing: Billing) -> str:
        """
        Generate standard filename for invoice PDF.
        
        Args:
            billing: Billing document
        
        Returns:
            Filename string
        """
        await billing.fetch_link(Billing.patient)
        
        patient_name = billing.patient.last_name.replace(' ', '_')
        invoice_num = billing.invoice_number.replace('-', '_')
        
        return f"Invoice_{invoice_num}_{patient_name}.pdf"
