from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from pathlib import Path

from backend.services.predict import predict_fraud

app = FastAPI(
    title="FraudShield API",
    description="AI-powered Fraud Detection Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Transaction(BaseModel):
    amount: float
    transaction_amount: float
    anomaly_score: float
    hour: int
    day_of_week: int
    category: str


@app.get("/")
def home():
    return {
        "message": "FraudShield API is running",
        "status": "online"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/predict")
def predict(transaction: Transaction):
    result = predict_fraud(
        amount=transaction.amount,
        transaction_amount=transaction.transaction_amount,
        anomaly_score=transaction.anomaly_score,
        hour=transaction.hour,
        day_of_week=transaction.day_of_week,
        category=transaction.category
    )

    return {
        "transaction": transaction.model_dump(),
        "prediction": result
    }


@app.get("/analytics")
def analytics():
    path = Path("backend/data/transactions.csv")
    df = pd.read_csv(path)

    total = len(df)

    # Safely detect fraud column
    fraud_column = None

    for column in [
        "FraudIndicator",
        "Fraud",
        "is_fraud",
        "fraud",
        "Class",
        "Label",
        "label"
    ]:
        if column in df.columns:
            fraud_column = column
            break

    if fraud_column is None:
        fraud = 0
    else:
        fraud_values = pd.to_numeric(
            df[fraud_column],
            errors="coerce"
        ).fillna(0)

        fraud = int(
            (fraud_values > 0).sum()
        )

    normal = total - fraud

    fraud_rate = (
        round((fraud / total) * 100, 2)
        if total > 0
        else 0
    )

    # Automatically find a useful categorical column.
    excluded = {
        "TransactionID",
        "CustomerID",
        "MerchantID",
        "Amount",
        "TransactionAmount",
        "AnomalyScore",
        "FraudIndicator",
        "Fraud",
        "is_fraud",
        "fraud",
        "Class",
        "Label",
        "label"
    }

    category_column = None

    preferred_columns = [
        "Category",
        "category",
        "Type",
        "type",
        "TransactionType",
        "transaction_type",
        "MerchantCategory",
        "merchant_category",
        "PaymentMethod",
        "payment_method"
    ]

    for column in preferred_columns:
        if column in df.columns:
            unique_count = df[column].nunique(dropna=True)

            if 1 < unique_count <= 30:
                category_column = column
                break

    if category_column is None:

        for column in df.columns:

            if column in excluded:
                continue

            if (
                df[column].dtype == "object"
                or str(df[column].dtype).startswith("category")
            ):

                unique_count = df[column].nunique(
                    dropna=True
                )

                if 1 < unique_count <= 30:
                    category_column = column
                    break

    if category_column is not None:

        temp = df.copy()

        temp["_category"] = (
            temp[category_column]
            .fillna("Unknown")
            .astype(str)
        )

        if fraud_column is not None:
            temp["_fraud_value"] = (
                pd.to_numeric(
                    temp[fraud_column],
                    errors="coerce"
                )
                .fillna(0)
            )
        else:
            temp["_fraud_value"] = 0

        category_stats = (
            temp.groupby("_category")
            .agg(
                transactions=("_category", "size"),
                fraud_cases=(
                    "_fraud_value",
                    lambda x: int((x > 0).sum())
                )
            )
            .reset_index()
        )

        category_stats = category_stats.rename(
            columns={
                "_category": "Category"
            }
        )

        category_stats["fraud_rate"] = (
            category_stats["fraud_cases"]
            / category_stats["transactions"]
            * 100
        ).round(2)

        category_stats = category_stats.sort_values(
            "transactions",
            ascending=False
        )

        categories = category_stats.to_dict(
            orient="records"
        )

        category_source = category_column

    else:

        categories = [
            {
                "Category": "All Transactions",
                "transactions": total,
                "fraud_cases": fraud,
                "fraud_rate": fraud_rate
            }
        ]

        category_source = "Dataset"

    return {
        "total_transactions": total,
        "fraud_transactions": fraud,
        "normal_transactions": normal,
        "fraud_rate": fraud_rate,
        "distribution": {
            "fraud": fraud,
            "normal": normal
        },
        "category_source": category_source,
        "categories": categories
    }

@app.get("/transactions")
def transactions(limit: int = 100):
    path = Path("backend/data/transactions.csv")
    df = pd.read_csv(path)

    records = df.head(limit).fillna("").to_dict(orient="records")

    return {
        "count": len(records),
        "transactions": records
    }
@app.get("/transactions/{transaction_id}")
def transaction_detail(transaction_id: int):
    path = Path("backend/data/transactions.csv")
    df = pd.read_csv(path)

    row = df[df["TransactionID"] == transaction_id]

    if row.empty:
        return {
            "error": "Transaction not found"
        }

    record = row.iloc[0].fillna("").to_dict()

    return {
        "transaction": record
    }

from fastapi import Request, Response
from backend.auth import verify_admin, create_session, verify_session


class AdminLogin(BaseModel):
    email: str
    password: str


@app.post("/admin/login")
def admin_login(data: AdminLogin, response: Response):
    if not verify_admin(data.email, data.password):
        return {
            "success": False,
            "message": "Invalid admin credentials"
        }

    token = create_session(data.email)

    response.set_cookie(
        key="fraudshield_session",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 8
    )

    return {
        "success": True,
        "message": "Admin login successful"
    }


@app.get("/admin/me")
def admin_me(request: Request):
    token = request.cookies.get("fraudshield_session")

    if not verify_session(token):
        return {
            "authenticated": False
        }

    return {
        "authenticated": True,
        "role": "admin"
    }


@app.post("/admin/logout")
def admin_logout(response: Response):
    response.delete_cookie(
        key="fraudshield_session"
    )

    return {
        "success": True,
        "message": "Logged out successfully"
    }
from backend.database import get_users, create_user, update_user_status


@app.get("/admin/users")
def admin_users(request: Request):
    token = request.cookies.get("fraudshield_session")

    if not verify_session(token):
        return {
            "authenticated": False,
            "message": "Admin authentication required"
        }

    return {
        "authenticated": True,
        "users": get_users()
    }


class CreateUser(BaseModel):
    email: str
    name: str


@app.post("/admin/users")
def admin_create_user(
    data: CreateUser,
    request: Request
):
    token = request.cookies.get("fraudshield_session")

    if not verify_session(token):
        return {
            "success": False,
            "message": "Admin authentication required"
        }

    if not data.email.strip() or not data.name.strip():
        return {
            "success": False,
            "message": "Name and email are required"
        }

    created = create_user(
        data.email.strip(),
        data.name.strip()
    )

    if not created:
        return {
            "success": False,
            "message": "User already exists"
        }

    return {
        "success": True,
        "message": "User created successfully"
    }


@app.patch("/admin/users/{user_id}/status")
def admin_update_user_status(
    user_id: int,
    request: Request
):
    token = request.cookies.get("fraudshield_session")

    if not verify_session(token):
        return {
            "success": False,
            "message": "Admin authentication required"
        }

    # Toggle active/inactive status
    users = get_users()

    user = next(
        (u for u in users if u["id"] == user_id),
        None
    )

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }

    new_status = (
        "inactive"
        if user["status"] == "active"
        else "active"
    )

    update_user_status(
        user_id,
        new_status
    )

    return {
        "success": True,
        "status": new_status
    }
@app.get("/admin/fraud-alerts")
def fraud_alerts(request: Request):
    token = request.cookies.get("fraudshield_session")

    if not verify_session(token):
        return {
            "authenticated": False,
            "message": "Admin authentication required"
        }

    path = Path("backend/data/transactions.csv")
    df = pd.read_csv(path)

    fraud_df = df[df["FraudIndicator"] == 1].copy()

    fraud_df = fraud_df.sort_values(
        "AnomalyScore",
        ascending=False
    )

    records = fraud_df.fillna("").to_dict(
        orient="records"
    )

    return {
        "authenticated": True,
        "count": len(records),
        "alerts": records
    }
@app.get("/admin/alerts")
def admin_alerts():
    path = Path("backend/data/transactions.csv")
    df = pd.read_csv(path)

    fraud_df = df[df["FraudIndicator"] == 1].copy()

    fraud_df = fraud_df.sort_values(
        "AnomalyScore",
        ascending=False
    )

    records = fraud_df.fillna("").to_dict(
        orient="records"
    )

    return {
        "authenticated": True,
        "count": len(records),
        "alerts": records
    }

@app.post("/transactions/upload")
async def upload_transactions(file: UploadFile = File(...)):
    if not file.filename:
        return {
            "success": False,
            "message": "No file selected"
        }

    if not file.filename.lower().endswith(".csv"):
        return {
            "success": False,
            "message": "Only CSV files are allowed"
        }

    try:
        import io
        import re

        content = await file.read()

        df = pd.read_csv(
            io.BytesIO(content)
        )

        if df.empty:
            return {
                "success": False,
                "message": "CSV file is empty"
            }

        # Normalize column names
        original_columns = list(df.columns)

        normalized = {}

        for column in df.columns:
            key = re.sub(
                r"[^a-z0-9]",
                "",
                str(column).lower()
            )
            normalized[key] = column

        def find_column(candidates):
            for candidate in candidates:
                key = re.sub(
                    r"[^a-z0-9]",
                    "",
                    candidate.lower()
                )

                if key in normalized:
                    return normalized[key]

            return None

        # Automatically detect common transaction columns
        transaction_id_col = find_column([
            "transactionid",
            "transaction_id",
            "transaction",
            "id",
            "transid"
        ])

        amount_col = find_column([
            "amount",
            "transactionamount",
            "transaction_amount",
            "amt",
            "value"
        ])

        customer_col = find_column([
            "customerid",
            "customer_id",
            "customer",
            "userid",
            "user_id",
            "clientid"
        ])

        timestamp_col = find_column([
            "timestamp",
            "datetime",
            "date",
            "time",
            "transactiontime",
            "transactiondate"
        ])

        merchant_col = find_column([
            "merchantid",
            "merchant_id",
            "merchant"
        ])

        anomaly_col = find_column([
            "anomalyscore",
            "anomaly_score",
            "anomaly",
            "outlierscore"
        ])

        category_col = find_column([
            "category",
            "type",
            "transactiontype",
            "transaction_type",
            "merchantcategory",
            "mcc"
        ])

        fraud_col = find_column([
            "fraudindicator",
            "fraud_indicator",
            "fraud",
            "isfraud",
            "is_fraud",
            "fraudflag",
            "fraud_flag",
            "class",
            "label",
            "target",
            "anomalylabel"
        ])

        # Build standardized dataset
        result = pd.DataFrame(
            index=df.index
        )

        # Transaction ID
        if transaction_id_col:
            result["TransactionID"] = df[
                transaction_id_col
            ]
        else:
            result["TransactionID"] = range(
                1,
                len(df) + 1
            )

        # Amount
        if amount_col:
            result["Amount"] = pd.to_numeric(
                df[amount_col],
                errors="coerce"
            ).fillna(0)
        else:
            result["Amount"] = 0

        # Customer ID
        if customer_col:
            result["CustomerID"] = df[
                customer_col
            ]
        else:
            result["CustomerID"] = ""

        # Timestamp
        if timestamp_col:
            result["Timestamp"] = df[
                timestamp_col
            ].astype(str)
        else:
            result["Timestamp"] = ""

        # Merchant ID
        if merchant_col:
            result["MerchantID"] = df[
                merchant_col
            ]
        else:
            result["MerchantID"] = ""

        # Transaction Amount
        result["TransactionAmount"] = result[
            "Amount"
        ]

        # Anomaly Score
        if anomaly_col:
            result["AnomalyScore"] = pd.to_numeric(
                df[anomaly_col],
                errors="coerce"
            ).fillna(0)
        else:
            result["AnomalyScore"] = 0

        # Category
        if category_col:
            result["Category"] = df[
                category_col
            ].astype(str)
        else:
            result["Category"] = "Unknown"

        # Fraud Indicator
        if fraud_col:
            fraud_values = df[
                fraud_col
            ]

            def convert_fraud(value):
                text = str(value).strip().lower()

                if text in [
                    "1",
                    "true",
                    "yes",
                    "fraud",
                    "fraudulent",
                    "anomaly",
                    "positive"
                ]:
                    return 1

                return 0

            result["FraudIndicator"] = fraud_values.apply(
                convert_fraud
            )

        else:
            result["FraudIndicator"] = 0

        # Clean invalid numeric values
        result["Amount"] = pd.to_numeric(
            result["Amount"],
            errors="coerce"
        ).fillna(0)

        result["TransactionAmount"] = pd.to_numeric(
            result["TransactionAmount"],
            errors="coerce"
        ).fillna(0)

        result["AnomalyScore"] = pd.to_numeric(
            result["AnomalyScore"],
            errors="coerce"
        ).fillna(0)

        # Replace current dataset
        path = Path(
            "backend/data/transactions.csv"
        )

        result.to_csv(
            path,
            index=False
        )

        detected = {
            "transaction_id": transaction_id_col,
            "amount": amount_col,
            "customer": customer_col,
            "timestamp": timestamp_col,
            "merchant": merchant_col,
            "anomaly_score": anomaly_col,
            "category": category_col,
            "fraud": fraud_col
        }

        return {
            "success": True,
            "message": "CSV detected and dataset replaced successfully",
            "uploaded_rows": len(result),
            "total_transactions": len(result),
            "fraud_transactions": int(
                result["FraudIndicator"].sum()
            ),
            "detected_columns": detected,
            "original_columns": original_columns
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"CSV processing failed: {str(e)}"
        }