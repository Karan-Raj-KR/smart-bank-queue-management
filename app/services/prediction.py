import logging
import os
from datetime import datetime

_model = None
_MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../ml/model.pkl")

SERVICE_TYPE_ENCODING = {"CASH": 0, "WITHDRAWAL": 1, "LOAN": 2, "ACCOUNT": 3}

logger = logging.getLogger(__name__)


def _load_model():
    global _model
    if _model is not None:
        return _model
    model_path = os.path.abspath(_MODEL_PATH)
    if not os.path.exists(model_path):
        return None
    try:
        import joblib
        _model = joblib.load(model_path)
        return _model
    except Exception:
        logger.exception("Failed to load ML model from %s", model_path)
        return None


def predict_wait_time(queue_length: int, service_type: str) -> int:
    try:
        model = _load_model()
        if model is None:
            return queue_length * 5

        import numpy as np

        now = datetime.now()
        hour_of_day = float(now.hour)
        day_of_week = float(now.weekday())
        service_encoded = float(SERVICE_TYPE_ENCODING.get(service_type.upper(), 0))

        features = np.array([[float(queue_length), hour_of_day, day_of_week, service_encoded]])
        predicted = model.predict(features)[0]
        return max(1, int(round(predicted)))
    except Exception:
        logger.exception("ML prediction failed, using fallback estimate")
        return queue_length * 5
