import logging
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.auth import get_current_user, save_doc_meta, get_user_docs, delete_doc_meta
from app.services.ingestion import ingest_document
from app.services.vectorstore import get_vectorstore
from app.models.schemas import IngestResponse, DocumentMeta

log = logging.getLogger(__name__)
router = APIRouter(prefix="/ingest", tags=["Documents"])


@router.post("/", response_model=IngestResponse)
async def upload(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    result = await ingest_document(file, user_id=user["user_id"])
    save_doc_meta(user["user_id"], {**result, "user_id": user["user_id"]})
    return IngestResponse(**result)


@router.get("/documents", response_model=list[DocumentMeta])
async def list_docs(user: dict = Depends(get_current_user)):
    return sorted(get_user_docs(user["user_id"]),
                  key=lambda d: d.get("uploaded_at", ""), reverse=True)


@router.delete("/documents/{document_id}")
async def delete_doc(document_id: str, user: dict = Depends(get_current_user)):
    owned = {d["document_id"] for d in get_user_docs(user["user_id"])}
    if document_id not in owned:
        raise HTTPException(status_code=404, detail="Document not found.")
    try:
        get_vectorstore()._collection.delete(where={"document_id": {"$eq": document_id}})
    except Exception as e:
        log.warning(f"Could not delete vectors for {document_id}: {e}")
    delete_doc_meta(user["user_id"], document_id)
    return {"message": "Document deleted."}
