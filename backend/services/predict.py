import joblib
import pandas as pd
from pathlib import Path

MODEL_PATH = Path("ml/model/fraud_model.joblib")
FEATURE_PATH = Path("ml/model/feature_columns.joblib")

model = joblib.load(MODEL_PATH)
feature_columns = joblib.load(FEATURE_PATH)


def predict_fraud(
    amount: float,
    transaction_amount: float,
    anomaly_score: float,
    hour: int,
    day_of_week: int,
    category: str
):
    data = pd.DataFrame([{
        "Amount": amount,
        "TransactionAmount": transaction_amount,
        "AnomalyScore": anomaly_score,
        "Hour": hour,
        "DayOfWeek": day_of_week,
        "Category": category
    }])

    data = pd.get_dummies(data, columns=["Category"], dtype=int)

    data = data.reindex(columns=feature_columns, fill_value=0)

    probability = float(model.predict_proba(data)[0][1])

    if probability >= 0.75:
        risk = "HIGH RISK"
    elif probability >= 0.40:
        risk = "SUSPICIOUS"
    else:
        risk = "NORMAL"

    return {
        "fraud_probability": round(probability, 4),
        "risk_level": risk
    }
