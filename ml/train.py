import os
import numpy as np
import joblib
from sklearn.linear_model import LinearRegression

FEATURE_COUNT = 4
SERVICE_TYPE_MAP = {"CASH": 0, "WITHDRAWAL": 1, "LOAN": 2, "ACCOUNT": 3}

rng = np.random.default_rng(42)
n_samples = 5000

queue_length = rng.integers(1, 30, size=n_samples).astype(float)
hour_of_day = rng.integers(8, 18, size=n_samples).astype(float)
day_of_week = rng.integers(0, 7, size=n_samples).astype(float)
service_type_encoded = rng.integers(0, 4, size=n_samples).astype(float)

# Base wait time with some realistic variation
base_wait = (
    queue_length * 4.5
    + (hour_of_day - 8) * 0.5
    + (day_of_week < 5).astype(float) * 2.0
    + service_type_encoded * 1.5
    + rng.normal(0, 2, size=n_samples)
)
wait_minutes = np.clip(base_wait, 1, None)

X = np.column_stack([queue_length, hour_of_day, day_of_week, service_type_encoded])
y = wait_minutes

model = LinearRegression()
model.fit(X, y)

os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.pkl")
joblib.dump(model, model_path)
print(f"Model saved to {model_path}")
