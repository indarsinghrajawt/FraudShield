import base64
import hashlib
import hmac
import os
import time

from dotenv import load_dotenv

load_dotenv()

ADMIN_EMAIL = os.getenv(
    "FRAUDSHIELD_ADMIN_EMAIL",
    "admin@fraudshield.com"
)

ADMIN_PASSWORD = os.getenv(
    "FRAUDSHIELD_ADMIN_PASSWORD",
    "admin123"
)

SECRET = os.getenv(
    "FRAUDSHIELD_SECRET",
    "change-this-secret"
)


def verify_admin(email: str, password: str) -> bool:
    return (
        hmac.compare_digest(email, ADMIN_EMAIL)
        and hmac.compare_digest(password, ADMIN_PASSWORD)
    )


def create_session(email: str) -> str:
    timestamp = str(int(time.time()))
    payload = f"{email}|{timestamp}"

    signature = hmac.new(
        SECRET.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

    raw = f"{payload}|{signature}"

    return base64.urlsafe_b64encode(
        raw.encode()
    ).decode()


def verify_session(token: str | None) -> bool:
    if not token:
        return False

    try:
        raw = base64.urlsafe_b64decode(
            token.encode()
        ).decode()

        email, timestamp, signature = raw.split("|")

        payload = f"{email}|{timestamp}"

        expected = hmac.new(
            SECRET.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(
            signature,
            expected
        ):
            return False

        if not hmac.compare_digest(
            email,
            ADMIN_EMAIL
        ):
            return False

        if time.time() - int(timestamp) > 60 * 60 * 8:
            return False

        return True

    except Exception:
        return False