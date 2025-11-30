from email_gateway import send_email


def notify_user(recipient: str, message: str) -> str:
    """Send the standard account-update email copy to a user."""
    subject = "Account update"
    body = f"Hello!\n\n{message}"
    return send_email(recipient, subject, body)
