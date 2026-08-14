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
    fraud = int(df["FraudIndicator"].sum())
    normal = total - fraud

    category_stats = (
        df.groupby("Category")
        .agg(
            transactions=("TransactionID", "count"),
            fraud_cases=("FraudIndicator", "sum")
        )
        .reset_index()
    )

    category_stats["fraud_rate"] = (
        category_stats["fraud_cases"]
        / category_stats["transactions"]
        * 100
    ).round(2)

    return {
        "total_transactions": total,
        "fraud_transactions": fraud,
        "normal_transactions": normal,
        "fraud_rate": round((fraud / total) * 100, 2),
        "distribution": {
            "fraud": fraud,
            "normal": normal
        },
        "categories": category_stats.fillna(0).to_dict(
            orient="records"
        )
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
def admin_alerts(request: Request):
    token = request.cookies.get("fraudshield_session")

    if not verify_session(token):
        return {
            "authenticated": False,
            "message": "Admin authentication required"
        }

    path = Path("backend/data/transactions.csv")
    df = pd.read_csv(path)

    fraud_df = df[df["FraudIndicator"] == 1].copy()

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

    required_columns = [
        "TransactionID",
        "Amount",
        "CustomerID",
        "Timestamp",
        "MerchantID",
        "TransactionAmount",
        "AnomalyScore",
        "Category",
        "FraudIndicator"
    ]

    try:
        import io

        content = await file.read()

        uploaded_df = pd.read_csv(
            io.BytesIO(content)
        )

        missing = [
            column
            for column in required_columns
            if column not in uploaded_df.columns
        ]

        if missing:
            return {
                "success": False,
                "message": "Missing required columns",
                "missing_columns": missing
            }

        uploaded_df = uploaded_df[
            required_columns
        ].copy()

        path = Path(
            "backend/data/transactions.csv"
        )

        # REPLACE old dataset with uploaded CSV
        uploaded_df.to_csv(
            path,
            index=False
        )

        return {
            "success": True,
            "message": "Dataset replaced successfully",
            "uploaded_rows": len(uploaded_df),
            "total_transactions": len(uploaded_df)
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"CSV processing failed: {str(e)}"
        }