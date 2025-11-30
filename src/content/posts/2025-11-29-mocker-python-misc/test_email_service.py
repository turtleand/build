import email_service
from pocket_mocker import PocketMocker


def test_notify_user_with_pytest_mocker(mocker):
    mocker.patch(
        "email_service.send_email", return_value="sent:me@example.com:Account update"
    )
    result = email_service.notify_user("me@example.com", "You have a new badge!")
    assert result == "sent:me@example.com:Account update"


def test_notify_user_with_pocket_mocker():
    pocket = PocketMocker()
    pocket.patch(
        "email_service.send_email", return_value="sent:you@example.com:Account update"
    )

    result = email_service.notify_user("you@example.com", "Password changed")
    assert result == "sent:you@example.com:Account update"

    pocket.stopall()


# Result:
# src/content/posts/2025-11-29-mocker-python-misc/test_email_service.py ..
# =========================================================== 2 passed in 0.04s ===========================================================
