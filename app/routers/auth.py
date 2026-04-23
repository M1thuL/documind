from fastapi import APIRouter
from app.auth import create_user, authenticate_user, create_token
from app.models.schemas import SignupRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=TokenResponse)
async def signup(body: SignupRequest):
    user = create_user(body.email, body.password)
    return TokenResponse(access_token=create_token(user["user_id"], user["email"]),
                         user_id=user["user_id"], email=user["email"])

@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    user = authenticate_user(body.email, body.password)
    return TokenResponse(access_token=create_token(user["user_id"], user["email"]),
                         user_id=user["user_id"], email=user["email"])
