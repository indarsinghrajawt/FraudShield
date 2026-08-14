import pandas as pd
from pathlib import Path

INPUT = Path("backend/data/transactions.csv")
OUTPUT = Path("backend/data/ml_ready.csv")

df = pd.read_csv(INPUT)

# Convert timestamp into useful numerical features
df["Timestamp"] = pd.to_datetime(df["Timestamp"])
df["Hour"] = df["Timestamp"].dt.hour
df["DayOfWeek"] = df["Timestamp"].dt.dayofweek

# Remove identifiers and raw timestamp
df = df.drop(columns=["TransactionID", "CustomerID", "MerchantID", "Timestamp"])

# Convert category into numeric columns
df = pd.get_dummies(df, columns=["Category"], dtype=int)

# Save ML-ready dataset
df.to_csv(OUTPUT, index=False)

print("\nML-READY DATASET CREATED")
print("Shape:", df.shape)
print("\nColumns:")
print(df.columns.tolist())
print("\nMissing values:")
print(df.isnull().sum())
print("\nPreview:")
print(df.head())
