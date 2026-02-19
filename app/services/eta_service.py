import pickle
import os
from datetime import datetime

MODEL_PATH = "eta_model.pkl"

# Load model only if model file exists. Import numpy lazily to avoid
# requiring it when no pre-trained model is present (prevents ImportError
# causing server errors when numpy isn't installed).
model = None
np = None
if os.path.exists(MODEL_PATH):
    try:
        import numpy as np  # type: ignore
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
    except Exception:
        model = None
        np = None


def predict_eta(active_orders: int):
    if model and np is not None:
        try:
            hour = datetime.utcnow().hour
            features = np.array([[hour, active_orders]])
            return int(model.predict(features)[0])
        except Exception:
            # If prediction fails, fall back to simple heuristic
            return 5 + active_orders
    return 5 + active_orders
