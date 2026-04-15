"""
SMS notification tasks.

Sending is done as a Celery task so it runs in a separate worker process
and never blocks the main FastAPI request/response cycle.
"""

import logging

from app.core.celery_app import celery_app
from app.core.config import settings

logger = logging.getLogger(__name__)


@celery_app.task(
    name="notifications.send_sms",
    bind=True,
    max_retries=3,
    default_retry_delay=60,  # seconds between retries
)
def send_sms_task(self, to_phone: str, message: str) -> None:
    """Send an SMS via Twilio. Retried up to 3 times on failure."""
    if not all([settings.twilio_account_sid, settings.twilio_auth_token, settings.twilio_phone_number]):
        logger.warning(
            "Twilio credentials not configured — skipping SMS to %s", to_phone
        )
        return

    try:
        from twilio.rest import Client

        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        client.messages.create(
            body=message,
            from_=settings.twilio_phone_number,
            to=to_phone,
        )
        logger.info("SMS sent to %s", to_phone)
    except Exception as exc:
        logger.exception("Failed to send SMS to %s — will retry", to_phone)
        raise self.retry(exc=exc)
