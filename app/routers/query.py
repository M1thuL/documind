import logging
from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_user, get_user_docs
from app.services.query import query_documents
from app.models.schemas import QueryRequest, QueryResponse

log = logging.getLogger(__name__)
router = APIRouter(prefix="/query", tags=["Query"])


@router.post("/", response_model=QueryResponse)
async def ask(body: QueryRequest, user: dict = Depends(get_current_user)):
    user_docs = get_user_docs(user["user_id"])
    all_ids = {d["document_id"] for d in user_docs}
    if not all_ids:
        raise HTTPException(status_code=400, detail="No documents found. Upload a document first.")

    if body.document_ids:
        scoped = list(set(body.document_ids) & all_ids)
        if not scoped:
            raise HTTPException(status_code=404, detail="None of the specified documents belong to you.")
    else:
        scoped = list(all_ids)

    result = await query_documents(body.question, scoped, body.top_k)

    id_to_filename = {d["document_id"]: d["filename"] for d in user_docs}
    for src in result["sources"]:
        src.filename = id_to_filename.get(src.document_id)

    return QueryResponse(**result)
