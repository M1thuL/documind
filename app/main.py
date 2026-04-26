import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, ingest, query
from app.models.schemas import HealthResponse

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("App starting up.")
    yield
    log.info("App shutting down.")


def create_app() -> FastAPI:
    s = get_settings()
    app = FastAPI(title=s.app_name, version=s.app_version, lifespan=lifespan)

    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    allowed_origins = list(set([
        "http://localhost:3000",
        "http://localhost:5173",
        frontend_url,
    ]))
    log.info(f"CORS allowed origins: {allowed_origins}")

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
            vector_store="ok",
        )

    return app


app = create_app()