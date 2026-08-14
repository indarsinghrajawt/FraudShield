import sqlite3
from pathlib import Path

DB_PATH = Path("backend/users.db")


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_database():
    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL,
            last_login TEXT
        )
    """)

    connection.commit()
    connection.close()


def get_users():
    connection = get_connection()

    rows = connection.execute("""
        SELECT id, email, name, role, status, created_at, last_login
        FROM users
        ORDER BY id DESC
    """).fetchall()

    connection.close()

    return [dict(row) for row in rows]


def create_user(email, name):
    from datetime import datetime

    connection = get_connection()

    try:
        connection.execute(
            """
            INSERT INTO users
            (email, name, role, status, created_at)
            VALUES (?, ?, 'user', 'active', ?)
            """,
            (
                email,
                name,
                datetime.now().isoformat(timespec="seconds")
            )
        )

        connection.commit()
        return True

    except sqlite3.IntegrityError:
        return False

    finally:
        connection.close()


def update_user_status(user_id, status):
    connection = get_connection()

    connection.execute(
        "UPDATE users SET status = ? WHERE id = ?",
        (status, user_id)
    )

    connection.commit()
    connection.close()