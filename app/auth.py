import json
import uuid
import hashlib
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

from app.config import get_settings

bearer = HTTPBearer(auto_error=False)


# ── JSON file helpers (swap for Postgres in production) ──────────────────────

def _load(path: str) -> dict:
    p = Path(path)
    return json.loads(p.read_text()) if p.exists() else {}

def _save(path: str, data: dict):
    Path(path).write_text(json.dumps(data, indent=2))

def _hash(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


# ── Users ─────────────────────────────────────────────────────────────────────

def create_user(email: str, password: str) -> dict:
    s = get_settings()
    users = _load(s.users_db_path)
    if email in users:
        raise HTTPException(status_code=409, detail="Email already registered.")
    user = {"user_id": uuid.uuid4().hex, "email": email, "password_hash": _hash(password),
            "created_at": datetime.now(timezone.utc).isoformat()}
    users[email] = user
    _save(s.users_db_path, users)
    return user

def authenticate_user(email: str, password: str) -> dict:
    users = _load(get_settings().users_db_path)
    user = users.get(email)
    if not user or user["password_hash"] != _hash(password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return user


# ── JWT ───────────────────────────────────────────────────────────────────────

def create_token(user_id: str, email: str) -> str:
    s = get_settings()
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(minutes=s.jwt_expire_minutes)}
    return jwt.encode(payload, s.jwt_secret, algorithm=s.jwt_algorithm)

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    s = get_settings()
    if not creds:
        raise HTTPException(status_code=401, detail="Missing Authorization header.")
    try:
        payload = jwt.decode(creds.credentials, s.jwt_secret, algorithms=[s.jwt_algorithm])
        return {"user_id": payload["sub"], "email": payload["email"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")


# ── Document metadata ─────────────────────────────────────────────────────────

def save_doc_meta(user_id: str, meta: dict):
    s = get_settings()
    db = _load(s.documents_db_path)
    db.setdefault(user_id, {})[meta["document_id"]] = meta
    _save(s.documents_db_path, db)

def get_user_docs(user_id: str) -> list[dict]:
    db = _load(get_settings().documents_db_path)
    return list(db.get(user_id, {}).values())

def delete_doc_meta(user_id: str, document_id: str):
    s = get_settings()
    db = _load(s.documents_db_path)
    if user_id in db:
        db[user_id].pop(document_id, None)
        _save(s.documents_db_path, db)
