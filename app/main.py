import logging
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

    app.add_middleware(CORSMiddleware, allow_origins=s.cors_origins,
                       allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

    app.include_router(auth.router)
    app.include_router(ingest.router)
    app.include_router(query.router)

    @app.get("/health", response_model=HealthResponse, tags=["System"])
    async def health():
        return HealthResponse(status="ok", version=s.app_version,
                              vector_store=get_vectorstore_status())

    return app


app = create_app()
