"""
ML Training Script — Isolation Forest for anomaly detection.
Run this to generate the model artifact used by the risk engine.
Usage: python -m app.ml.train
"""
import numpy as np
import joblib
import os
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


def generate_training_data(n_samples: int = 1000):
    """Generate synthetic normal login behavior data."""
    np.random.seed(42)
    # Normal logins: business hours (8-18), low failures, known device
    hours = np.random.normal(13, 3, n_samples).clip(6, 22)
    failures = np.random.poisson(0.1, n_samples).clip(0, 2)
    is_new_device = np.random.binomial(1, 0.1, n_samples)
    has_mfa = np.random.binomial(1, 0.7, n_samples)
    return np.column_stack([hours, failures, is_new_device, has_mfa])


def train_anomaly_detector():
    print("Generating training data...")
    X = generate_training_data(1000)

    print("Fitting StandardScaler...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    print("Training Isolation Forest...")
    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_scaled)

    os.makedirs("app/ml/models", exist_ok=True)
    joblib.dump(model, "app/ml/models/anomaly_detector.joblib")
    joblib.dump(scaler, "app/ml/models/scaler.joblib")
    print("Models saved to app/ml/models/")
    print("Training complete.")
    return model, scaler


if __name__ == "__main__":
    train_anomaly_detector()
