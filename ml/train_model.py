import pandas as pd
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

DATA = Path("backend/data/ml_ready.csv")

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

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced",
    max_depth=10
)

model.fit(X_train, y_train)

predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)[:, 1]

print("\n===== CLASSIFICATION REPORT =====")
print(classification_report(y_test, predictions, digits=4))

print("\n===== CONFUSION MATRIX =====")
print(confusion_matrix(y_test, predictions))

print("\n===== ROC-AUC =====")
print(round(roc_auc_score(y_test, probabilities), 4))

print("\n===== FEATURE IMPORTANCE =====")

importance = pd.Series(
    model.feature_importances_,
    index=X.columns
).sort_values(ascending=False)

print(importance)
