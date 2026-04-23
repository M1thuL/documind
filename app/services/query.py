import logging
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

from app.config import get_settings
from app.services.vectorstore import get_vectorstore
from app.models.schemas import SourcePassage

log = logging.getLogger(__name__)

PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a precise document analyst. Answer using ONLY the context passages below.
Rules:
1. Use ONLY information explicitly stated in the context. No outside knowledge.
2. If the answer is not in the context, say: "The documents do not contain enough information to answer this."
3. Structure your answer clearly. Use bullet points when listing multiple items.
4. Never guess or hallucinate details.

--- CONTEXT ---
{context}
--- END CONTEXT ---
"""),
    ("human", "{question}"),
])


async def query_documents(question: str, document_ids: list[str] | None = None, top_k: int | None = None) -> dict:
    s = get_settings()
    k = top_k or s.retrieval_top_k
    vs = get_vectorstore()

    search_kwargs: dict = {"k": k}
    if document_ids:
        if len(document_ids) == 1:
            search_kwargs["filter"] = {"document_id": {"$eq": document_ids[0]}}
        else:
            search_kwargs["filter"] = {"document_id": {"$in": document_ids}}

    docs = vs.as_retriever(search_kwargs=search_kwargs).invoke(question)
    if not docs:
        return {"answer": "No relevant content found. Upload a document first.",
                "sources": [], "model_used": s.chat_model}

    context = "\n\n---\n\n".join(
        f"[File: {d.metadata.get('filename','?')} | Page: {d.metadata.get('page','?')}]\n{d.page_content}"
        for d in docs
    )

    llm = ChatGroq(model=s.chat_model, temperature=0, groq_api_key=s.groq_api_key)
    answer = await (
        {"context": lambda _: context, "question": RunnablePassthrough()}
        | PROMPT | llm | StrOutputParser()
    ).ainvoke(question)

    sources = [SourcePassage(
        text=d.page_content[:400] + ("..." if len(d.page_content) > 400 else ""),
        document_id=d.metadata.get("document_id", "unknown"),
        filename=d.metadata.get("filename"),
        page=d.metadata.get("page"),
    ) for d in docs]

    return {"answer": answer, "sources": sources, "model_used": s.chat_model}
