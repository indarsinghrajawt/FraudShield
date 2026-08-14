import pandas as pd
import joblib

from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

DATA = Path("backend/data/ml_ready.csv")
MODEL_DIR = Path("ml/model")
MODEL_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(DATA)

X = df.drop(columns=["FraudIndicator"])
y = df["FraudIndicator"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced",
    max_depth=10
)

model.fit(X_train, y_train)

joblib.dump(model, MODEL_DIR / "fraud_model.joblib")
joblib.dump(list(X.columns), MODEL_DIR / "feature_columns.joblib")

print("MODEL TRAINED SUCCESSFULLY")
print("Model saved:", MODEL_DIR / "fraud_model.joblib")
print("Features saved:", MODEL_DIR / "feature_columns.joblib")
