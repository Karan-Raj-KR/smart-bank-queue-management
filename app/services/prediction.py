import os
from datetime import datetime

import numpy as np

_model = None
_MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../ml/model.pkl")

SERVICE_TYPE_ENCODING = {"CASH": 0, "WITHDRAWAL": 1, "LOAN": 2, "ACCOUNT": 3}


def _load_model():
    global _model
    if _model is not None:
        return _model
    model_path = os.path.abspath(_MODEL_PATH)
    if not os.path.exists(model_path):
        return None
    import joblib
    _model = joblib.load(model_path)
    return _model


def predict_wait_time(queue_length: int, service_type: str) -> int:
    model = _load_model()
    if model is None:
        return queue_length * 5

    now = datetime.now()
    hour_of_day = float(now.hour)
    day_of_week = float(now.weekday())
    service_encoded = float(SERVICE_TYPE_ENCODING.get(service_type.upper(), 0))

    features = np.array([[float(queue_length), hour_of_day, day_of_week, service_encoded]])
    predicted = model.predict(features)[0]
    return max(1, int(round(predicted)))
