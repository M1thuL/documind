from chromadb.config import Settings as ChromaSettings
from app.config import get_settings

_vs = None


def get_vectorstore():
    global _vs
    if _vs is None:
        s = get_settings()
        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            emb = HuggingFaceEmbeddings(
                model_name=s.embedding_model,
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": True},
            )
        except ImportError:
            from langchain_community.embeddings import HuggingFaceEmbeddings as HFE
            emb = HFE(model_name=s.embedding_model)

        from langchain_community.vectorstores import Chroma
        _vs = Chroma(
            collection_name="documents",
            embedding_function=emb,
            persist_directory=s.chroma_persist_dir,
            client_settings=ChromaSettings(anonymized_telemetry=False),
        )
    return _vs


def get_vectorstore_status() -> str:
    try:
        return f"ok ({get_vectorstore()._collection.count()} chunks stored)"
    except Exception as e:
        return f"error: {e}"