import pandas as pd
from pathlib import Path

BASE = Path("backend/data/raw/Data")

transactions = pd.read_csv(BASE / "Transaction Data" / "transaction_records.csv")
metadata = pd.read_csv(BASE / "Transaction Data" / "transaction_metadata.csv")
amounts = pd.read_csv(BASE / "Transaction Amounts" / "amount_data.csv")
anomaly = pd.read_csv(BASE / "Transaction Amounts" / "anomaly_scores.csv")
categories = pd.read_csv(BASE / "Merchant Information" / "transaction_category_labels.csv")
fraud = pd.read_csv(BASE / "Fraudulent Patterns" / "fraud_indicators.csv")

df = transactions.merge(metadata, on="TransactionID", how="left")
df = df.merge(amounts, on="TransactionID", how="left")
df = df.merge(anomaly, on="TransactionID", how="left")
df = df.merge(categories, on="TransactionID", how="left")
df = df.merge(fraud, on="TransactionID", how="left")

output = Path("backend/data/transactions.csv")
df.to_csv(output, index=False)

print("\nFINAL DATASET CREATED")
print("Rows:", len(df))
print("Columns:", len(df.columns))
print("\nColumns:")
print(df.columns.tolist())
print("\nFraud distribution:")
print(df["FraudIndicator"].value_counts(dropna=False))
print("\nFirst 5 rows:")
print(df.head())
