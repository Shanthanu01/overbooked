import smtplib
import ssl
from email.message import EmailMessage
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors

def generate_colored_pdf(filename, details):
    """Generate a detailed and colored PDF invoice."""
    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4

    # Colors and fonts
    header_color = colors.HexColor("#4A90E2")
    text_color = colors.black
    c.setTitle("Event Booking Invoice")

    # Draw Header
    c.setFillColor(header_color)
    c.rect(0, height - 100, width, 80, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(50, height - 70, "Event Booking Invoice")

    # Draw Event Details
    c.setFillColor(text_color)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 140, "Event Details:")
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 160, f"Event Name: {details['event_name']}")
    c.drawString(50, height - 180, f"Event Date: {details['event_date']}")
    c.drawString(50, height - 200, f"Event Location: {details['event_location']}")

    # Draw Booking Details
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 240, "Booking Details:")
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 260, f"Customer Name: {details['customer_name']}")
    c.drawString(50, height - 280, f"Customer Email: {details['customer_email']}")
    c.drawString(50, height - 300, f"Phone Number: {details.get('phone_number', 'N/A')}")
    c.drawString(50, height - 320, f"Number of Tickets: {details.get('num_tickets', '1')}")

    # Ensure that the 'amount' field is a string when concatenated
    amount_str = str(details.get('amount', '0.00'))
    
    # Draw Payment Details
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 360, "Payment Details:")
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 380, f"Total Amount: ${amount_str}")
    c.drawString(50, height - 400, f"Payment Method: {details.get('payment_method', 'Credit Card')}")

    # Footer Note
    c.setFont("Helvetica-Oblique", 12)
    c.setFillColor(colors.darkgray)
    c.drawString(50, height - 460, "Thank you for your booking!")
    c.drawString(50, height - 480, "We look forward to seeing you at the event.")

    # Company Contact Info
    c.setFillColor(text_color)
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 520, "For any inquiries, contact us at:")
    c.drawString(50, height - 540, "Email: support@eventmanagement.com")
    c.drawString(50, height - 560, "Phone: +1 (123) 456-7890")
    
    c.save()

def send_email_with_attachment(to_email, subject, body, attachment):
    """Send an email with a PDF attachment."""
    sender = "rithikesh0904@gmail.com"
    password = "qtbqddviziecmgqj"   # Use an app password if 2FA is enabled

    msg = EmailMessage()
    msg['From'] = sender
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.set_content(body)

    # Attach the PDF file
    with open(attachment, 'rb') as f:
        msg.add_attachment(f.read(), maintype='application', subtype='pdf', filename=attachment)

    # Send the email
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
        smtp.login(sender, password)
        smtp.send_message(msg)
        print("Email sent successfully!")

# Example usage
details = {
    "event_name": "Tech Conference 2024",
    "event_date": "2024-12-01",
    "event_location": "New York City, NY",
    "customer_name": "John Doe",
    "customer_email": "santhosh2210429@ssn.edu.in",
    "phone_number": "+1-987-654-3210",
    "num_tickets": 3,  # Make sure this is an integer, not a string
    "amount": 450.00,  # Ensure this is a float, not a string
    "payment_method": "Credit Card"
}

# Generate a colored and detailed PDF invoice
pdf_filename = "Event_Booking_Invoice.pdf"
generate_colored_pdf(pdf_filename, details)

# Send the email with the invoice attached
send_email_with_attachment(
    to_email=details['customer_email'],
    subject="Your Booking Invoice for Tech Conference 2024",
    body=f"Dear {details['customer_name']},\n\nPlease find attached your invoice for the Tech Conference 2024.\n\nBest regards,\nEvent Management Team",
    attachment=pdf_filename
)
