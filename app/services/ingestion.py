import uuid, tempfile, os, logging
from datetime import datetime, timezone
from pathlib import Path

from fastapi import UploadFile, HTTPException
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader

from app.config import get_settings
from app.services.vectorstore import get_vectorstore

log = logging.getLogger(__name__)

async def ingest_document(file: UploadFile, user_id: str) -> dict:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in (".pdf", ".txt"):
        raise HTTPException(status_code=415, detail="Only .pdf and .txt files are supported.")

    document_id = f"{Path(file.filename).stem}_{uuid.uuid4().hex[:8]}"
    uploaded_at = datetime.now(timezone.utc).isoformat()

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        docs = PyPDFLoader(tmp_path).load() if ext == ".pdf" else TextLoader(tmp_path, encoding="utf-8").load()
        if not docs:
            raise HTTPException(status_code=422, detail="Could not extract text from file.")

        s = get_settings()
        chunks = RecursiveCharacterTextSplitter(
            chunk_size=s.chunk_size, chunk_overlap=s.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        ).split_documents(docs)

        for c in chunks:
            c.metadata["document_id"] = document_id
            c.metadata["user_id"] = user_id
            c.metadata["filename"] = file.filename
            c.metadata.setdefault("page", 0)

        get_vectorstore().add_documents(chunks)
        log.info(f"Ingested {len(chunks)} chunks for {document_id}")

        return {"document_id": document_id, "filename": file.filename,
                "chunks_stored": len(chunks), "uploaded_at": uploaded_at,
                "message": f"Ingested '{file.filename}' ({len(chunks)} chunks)."}
    finally:
        os.unlink(tmp_path)
