from pydantic import BaseModel, Field
from typing import Optional


class SignupRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=8)

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str

class DocumentMeta(BaseModel):
    document_id: str
    filename: str
    chunks_stored: int
    uploaded_at: str
    user_id: str

class IngestResponse(BaseModel):
    document_id: str
    filename: str
    chunks_stored: int
    message: str
    uploaded_at: str

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)
    document_ids: Optional[list[str]] = None
    top_k: Optional[int] = Field(None, ge=1, le=20)

class SourcePassage(BaseModel):
    text: str
    document_id: str
    filename: Optional[str] = None
    page: Optional[int] = None

class QueryResponse(BaseModel):
    answer: str
    sources: list[SourcePassage]
    model_used: str

class HealthResponse(BaseModel):
    status: str
    version: str
    vector_store: str
