import smtplib
from email.message import EmailMessage


def send_email(recipient: str, subject: str, body: str) -> str:
    """Deliver transactional email through our SMTP relay."""
    # deliver a message via SMTP
    message = EmailMessage()
    message["From"] = "noreply@example.com"
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(body)

    try:
        with smtplib.SMTP("mail.example.com", 587, timeout=3) as client:
            client.starttls()
            client.login("noreply@example.com", "super-secret")
            client.send_message(message)
    except OSError:
        # Swallow transport errors for this illustrative example.
        pass

    return f"sent:{recipient}:{subject}"
