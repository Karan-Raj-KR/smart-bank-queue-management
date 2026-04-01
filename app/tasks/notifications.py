import asyncio
import logging
from functools import partial

from app.core.config import settings

logger = logging.getLogger(__name__)


def _send_sms_sync(to_phone: str, message: str) -> None:
    from twilio.rest import Client

    client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
    client.messages.create(
        body=message,
        from_=settings.twilio_phone_number,
        to=to_phone,
    )


async def send_sms(to_phone: str, message: str) -> None:
    if not all([settings.twilio_account_sid, settings.twilio_auth_token, settings.twilio_phone_number]):
        return

    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, partial(_send_sms_sync, to_phone, message))
    except Exception:
        logger.exception("Failed to send SMS to %s", to_phone)
