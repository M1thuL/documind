from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "DocuMind AI"
    app_version: str = "2.0.0"

    groq_api_key: str = ""
    chat_model: str = "llama-3.1-8b-instant"

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    embedding_model: str = "all-MiniLM-L6-v2"

    # Azure App Service: use /tmp — writable on free tier
    chroma_persist_dir: str = "/tmp/chroma_db"
    users_db_path: str = "/tmp/users_db.json"
    documents_db_path: str = "/tmp/documents_db.json"

    chunk_size: int = 500
    chunk_overlap: int = 50
    retrieval_top_k: int = 4

    # Set FRONTEND_URL in Azure App Service env vars to your Static Web App URL
    frontend_url: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        return list(set([
            "http://localhost:3000",
            "http://localhost:5173",
            self.frontend_url,
        ]))

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
