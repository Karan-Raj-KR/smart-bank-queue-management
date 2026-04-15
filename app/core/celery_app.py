"""
Celery application factory.

The broker and backend both point to Redis via the REDIS_URL env variable
(defaults to redis://localhost:6379 for local development).
"""

from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "smart_bank_queue",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.notifications"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Retry failed tasks up to 3 times with a 60-second delay
    task_acks_late=True,
    task_reject_on_worker_lost=True,
)
