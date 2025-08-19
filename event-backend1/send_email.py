import sys
import smtplib
import ssl
from email.message import EmailMessage
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import json

def generate_colored_pdf(filename, details):
    """Generate a detailed and colored PDF invoice."""
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4

    header_color = colors.HexColor("#4A90E2")
    text_color = colors.black
    c.setTitle("Event Booking Invoice")

    # Header
    c.setFillColor(header_color)
    c.rect(0, height - 100, width, 80, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(50, height - 70, "Event Booking Invoice")

    # Event Details
    c.setFillColor(text_color)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 140, "Event Details:")
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 160, f"Event Name: {details.get('event_name', 'N/A')}")
    c.drawString(50, height - 180, f"Event Date: {details.get('event_date', 'N/A')}")
    c.drawString(50, height - 200, f"Event Location: {details.get('event_location', 'N/A')}")

    # Booking Details
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 240, "Booking Details:")
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 260, f"Customer Name: {details.get('name', 'N/A')}")
    c.drawString(50, height - 280, f"Customer Email: {details.get('email', 'N/A')}")
    c.drawString(50, height - 300, f"Phone Number: {details.get('phone', 'N/A')}")
    c.drawString(50, height - 320, f"Number of Tickets: {details.get('num_tickets', '1')}")

    # Payment Details
    amount_str = str(details.get('amount', '0.00'))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 360, "Payment Details:")
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 380, f"Total Amount: ${details.get('total_amount','250')}")
    c.drawString(50, height - 400, f"Payment Method: {details.get('payment_method', 'Credit Card')}")

    # Footer Note
    c.setFont("Helvetica-Oblique", 12)
    c.setFillColor(colors.darkgray)
    c.drawString(50, height - 460, "Thank you for your booking!")
    c.drawString(50, height - 480, "We look forward to seeing you at the event.")

    # Contact Info
    c.setFillColor(text_color)
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 520, "For any inquiries, contact us at:")
    c.drawString(50, height - 540, "Email: support@eventmanagement.com")
    c.drawString(50, height - 560, "Phone: +1 (123) 456-7890")

    c.save()

def send_email_with_attachment(to_email, subject, body, attachment):
    sender = "rithikesh0904@gmail.com"
    password = "qtbqddviziecmgqj"

    msg = EmailMessage()
    msg['From'] = sender
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.set_content(body)

    with open(attachment, 'rb') as f:
        msg.add_attachment(f.read(), maintype='application', subtype='pdf', filename=attachment)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
        smtp.login(sender, password)
        smtp.send_message(msg)
        print("Email sent successfully!")

if __name__ == "__main__":
    to_email = sys.argv[1]
    event_title = sys.argv[2]
    ticket_summary = json.loads(sys.argv[3])



    pdf_filename = "Event_Booking_Invoice.pdf"
    print("ticket_summary",ticket_summary)
    generate_colored_pdf(pdf_filename, ticket_summary)

    send_email_with_attachment(
        to_email=to_email,
        subject=f"Your Booking Invoice for {event_title}",
        body=f"Dear {ticket_summary.get('customer_name', 'Customer')},\n\nPlease find attached your invoice for the {event_title}.\n\nBest regards,\nEvent Management Team",
        attachment=pdf_filename
    )
