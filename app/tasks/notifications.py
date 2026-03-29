import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_sms(to_phone: str, message: str) -> None:
    if not all([settings.twilio_account_sid, settings.twilio_auth_token, settings.twilio_phone_number]):
        return

    try:
        from twilio.rest import Client

        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        client.messages.create(
            body=message,
            from_=settings.twilio_phone_number,
            to=to_phone,
        )
    except Exception:
        logger.exception("Failed to send SMS to %s", to_phone)
