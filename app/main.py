import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, ingest, query
from app.models.schemas import HealthResponse
from app.services.vectorstore import get_vectorstore_status

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.getLogger(__name__).info("Starting — warming up vector store...")
    get_vectorstore_status()
    logging.getLogger(__name__).info("Ready.")
    yield


def create_app() -> FastAPI:
    s = get_settings()
    app = FastAPI(title=s.app_name, version=s.app_version, lifespan=lifespan)

    # Read CORS origins directly from env at startup — bypasses lru_cache issue
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        frontend_url,
    ]
    # Also allow any vercel.app subdomain
    allowed_origins = list(set(allowed_origins))

    logging.getLogger(__name__).info(f"CORS allowed origins: {allowed_origins}")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(ingest.router)
    app.include_router(query.router)

    @app.get("/health", response_model=HealthResponse, tags=["System"])
    async def health():
        return HealthResponse(
            status="ok",
            version=s.app_version,
            vector_store=get_vectorstore_status(),
        )

    return app


app = create_app()