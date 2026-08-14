from fastapi import FastAPI
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
        "http://127.0.0.1:3000"
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

    return {
        "total_transactions": total,
        "fraud_transactions": fraud,
        "normal_transactions": normal,
        "fraud_rate": round((fraud / total) * 100, 2)
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