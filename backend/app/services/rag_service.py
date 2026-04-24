from __future__ import annotations

import hashlib
import logging
import re
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

import chromadb
from chromadb.utils import embedding_functions
from docx import Document
from openai import OpenAI
from pypdf import PdfReader

from app.core.config import settings
from app.db.mongodb import documents_collection

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Embedding
# ---------------------------------------------------------------------------

class LocalHashEmbeddingFunction:
    """Offline-safe embedding fallback when transformer model cannot load."""

    def __call__(self, input: list[str]) -> list[list[float]]:
        vectors: list[list[float]] = []
        dims = 384
        for text in input:
            values: list[float] = []
            while len(values) < dims:
                digest = hashlib.sha256(f"{text}-{len(values)}".encode("utf-8")).digest()
                values.extend([(byte / 255.0) * 2 - 1 for byte in digest])
            vectors.append(values[:dims])
        return vectors


_chroma_client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
_collection = None

# Maximum characters of context sent to the LLM to avoid overflowing small
# model context windows (roughly 1 500 tokens for a 4-char/token estimate).
_MAX_CONTEXT_CHARS = 6_000


def _get_collection():
    global _collection
    if _collection is not None:
        return _collection

    try:
        embedder = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
    except Exception:
        embedder = LocalHashEmbeddingFunction()

    _collection = _chroma_client.get_or_create_collection(
        name="rag_documents", embedding_function=embedder
    )
    return _collection


# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------

def _extract_segments(file_path: str) -> list[dict]:
    """Extract text segments with optional page metadata."""
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        pdf_reader = PdfReader(file_path)
        segments: list[dict] = []
        for i, page in enumerate(pdf_reader.pages, start=1):
            text = (page.extract_text() or "").strip()
            if text:
                segments.append({"text": text, "page": i})
        return segments

    if suffix == ".docx":
        doc = Document(file_path)
        text = "\n".join([p.text for p in doc.paragraphs]).strip()
        return [{"text": text, "page": None}] if text else []

    text = path.read_text(encoding="utf-8", errors="ignore").strip()
    return [{"text": text, "page": None}] if text else []


# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------

def _chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list[str]:
    """Paragraph-aware chunking with overlap for stronger retrieval."""
    normalized = re.sub(r"\r\n?", "\n", text)
    # Keep equation-like lines glued to surrounding text to reduce formula splits.
    normalized = re.sub(r"\n(?=[^\n]*[=∑Σπ∫±×÷^])", " ", normalized)
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n+", normalized) if p.strip()]
    if not paragraphs:
        return []

    chunks: list[str] = []
    current = ""
    for para in paragraphs:
        candidate = f"{current}\n\n{para}".strip() if current else para
        if len(candidate) <= chunk_size:
            current = candidate
            continue

        if current:
            chunks.append(current)
        if len(para) <= chunk_size:
            current = para
            continue

        # Fallback split for very large paragraphs.
        start = 0
        step = max(chunk_size - overlap, 1)
        while start < len(para):
            end = min(len(para), start + chunk_size)
            piece = para[start:end].strip()
            if piece:
                chunks.append(piece)
            start += step
        current = ""

    if current:
        chunks.append(current)
    return chunks


def _chunk_segments(
    segments: list[dict], chunk_size: int = 800, overlap: int = 100
) -> list[dict]:
    chunked: list[dict] = []
    for segment in segments:
        text = segment.get("text", "")
        page = segment.get("page")
        for chunk in _chunk_text(text, chunk_size=chunk_size, overlap=overlap):
            chunked.append({"text": chunk, "page": page})
    return chunked


# ---------------------------------------------------------------------------
# Deduplication
# ---------------------------------------------------------------------------

def _deduplicate_chunks(
    docs: list[str], metadatas: list[dict], threshold: float = 0.70
) -> tuple[list[str], list[dict]]:
    """
    Remove chunks whose text is largely contained within an already-accepted
    chunk (caused by the chunking overlap).  Uses a simple character-level
    containment heuristic — O(n²) but n is small (≤ 20 after reranking).
    """
    kept_docs: list[str] = []
    kept_meta: list[dict] = []
    seen_chunk_hashes: set[str] = set()

    for doc, meta in zip(docs, metadatas):
        chunk_hash = (meta or {}).get("chunk_hash")
        if chunk_hash:
            if chunk_hash in seen_chunk_hashes:
                continue
            seen_chunk_hashes.add(chunk_hash)

        doc_words = set(re.findall(r"[a-zA-Z0-9]+", doc.lower()))
        is_duplicate = False
        for existing in kept_docs:
            existing_words = set(re.findall(r"[a-zA-Z0-9]+", existing.lower()))
            if not doc_words:
                is_duplicate = True
                break
            overlap = len(doc_words & existing_words) / len(doc_words)
            if overlap >= threshold:
                is_duplicate = True
                break
        if not is_duplicate:
            kept_docs.append(doc)
            kept_meta.append(meta)

    return kept_docs, kept_meta


# ---------------------------------------------------------------------------
# Retrieval helpers
# ---------------------------------------------------------------------------

def _keyword_overlap_score(question: str, text: str) -> float:
    q_words = {w for w in re.findall(r"[a-zA-Z0-9]+", question.lower()) if len(w) > 2}
    t_words = {w for w in re.findall(r"[a-zA-Z0-9]+", text.lower()) if len(w) > 2}
    if not q_words:
        return 0.0
    return len(q_words & t_words) / len(q_words)


def _rerank_retrieval(
    question: str,
    docs: list[str],
    metadatas: list[dict],
    distances: list[float],
    top_k: int,
) -> tuple[list[str], list[dict]]:
    now = datetime.now(UTC)
    duplicate_counter: dict[str, int] = {}
    for metadata in metadatas:
        key = ""
        if metadata:
            key = metadata.get("chunk_hash") or metadata.get("doc_content_hash") or ""
        if key:
            duplicate_counter[key] = duplicate_counter.get(key, 0) + 1

    combined: list[tuple[float, str, dict]] = []
    for idx, doc in enumerate(docs):
        metadata = metadatas[idx] if idx < len(metadatas) else {}
        distance = distances[idx] if idx < len(distances) else 1.0
        semantic_score = 1.0 / (1.0 + max(distance, 0.0))
        lexical_score = _keyword_overlap_score(question, doc)
        # Prefer recently indexed documents (fresh docs should outrank stale copies).
        recency_score = 0.0
        created_at = metadata.get("doc_created_at") if isinstance(metadata, dict) else None
        if isinstance(created_at, datetime):
            if created_at.tzinfo is None:
                # Some Mongo records may be naive datetimes; treat them as UTC.
                created_at = created_at.replace(tzinfo=UTC)
            age_days = max((now - created_at).days, 0)
            recency_score = max(0.0, 1.0 - (age_days / 365.0))

        duplicate_key = ""
        if isinstance(metadata, dict):
            duplicate_key = metadata.get("chunk_hash") or metadata.get("doc_content_hash") or ""
        duplicate_penalty = 0.0
        if duplicate_key:
            duplicate_count = duplicate_counter.get(duplicate_key, 1)
            duplicate_penalty = min(0.12, max(0, duplicate_count - 1) * 0.04)

        # Weighted hybrid ranking: semantic first, lexical second.
        final_score = (
            (0.62 * semantic_score)
            + (0.25 * lexical_score)
            + (0.13 * recency_score)
            - duplicate_penalty
        )
        combined.append((final_score, doc, metadata))

    combined.sort(key=lambda x: x[0], reverse=True)
    top = combined[: max(top_k, 1)]
    return [item[1] for item in top], [item[2] for item in top]


# ---------------------------------------------------------------------------
# Extractive fallback answer
# ---------------------------------------------------------------------------

def _answer_from_context(question: str, docs: list[str]) -> str:
    """Simple extractive fallback when an LLM is unavailable."""
    question_words = {
        w for w in re.findall(r"[a-zA-Z0-9]+", question.lower()) if len(w) > 2
    }
    if not question_words:
        return docs[0][:500]

    sentences: list[str] = []
    for doc in docs:
        parts = re.split(r"(?<=[.!?])\s+|\n+", doc)
        sentences.extend([p.strip() for p in parts if p.strip()])

    scored: list[tuple[int, str]] = []
    for sentence in sentences:
        sentence_words = set(re.findall(r"[a-zA-Z0-9]+", sentence.lower()))
        score = len(question_words & sentence_words)
        if score > 0:
            scored.append((score, sentence))

    if not scored:
        return docs[0][:500]

    scored.sort(key=lambda item: item[0], reverse=True)
    best: list[str] = []
    seen: set[str] = set()
    for _, sentence in scored:
        if sentence not in seen:
            seen.add(sentence)
            best.append(sentence)
        if len(best) == 3:
            break
    return "\n".join([f"- {s}" for s in best])


# ---------------------------------------------------------------------------
# LLM helpers
# ---------------------------------------------------------------------------

def _build_prompt(question: str, context: str) -> str:
    return (
        "You are a document Q&A assistant.\n"
        "Answer only from the given context.\n"
        "If information is missing, clearly say it is not in the documents.\n"
        "Keep the answer concise and structured.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {question}"
    )


def _truncate_context(context: str, max_chars: int = _MAX_CONTEXT_CHARS) -> str:
    """Hard-truncate context to avoid overflowing small model context windows."""
    if len(context) <= max_chars:
        return context
    return context[:max_chars] + "\n\n[...context truncated...]"


def _normalize_text_for_hashing(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _sha256_hexdigest(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _resolve_chat_api_config() -> tuple[str | None, str | None, str | None]:
    provider = settings.llm_provider.lower().strip()
    if provider == "groq":
        return settings.llm_api_key, settings.llm_base_url, settings.llm_model
    if provider == "openai":
        api_key = settings.llm_api_key or settings.openai_api_key
        model = settings.llm_model or settings.openai_model
        return api_key, settings.llm_base_url, model
    return None, None, None


def _ask_openai_compatible(question: str, context: str) -> str | None:
    api_key, base_url, model = _resolve_chat_api_config()
    if not api_key or not model:
        return None
    try:
        client = OpenAI(api_key=api_key, base_url=base_url)
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise assistant. Answer only from provided context.",
                },
                {
                    "role": "user",
                    "content": _build_prompt(question, _truncate_context(context)),
                },
            ],
            temperature=0.2,
        )
        text = completion.choices[0].message.content or ""
        return text.strip() or None
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Tenant / access helpers
# ---------------------------------------------------------------------------

def _normalize_key(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", text.lower())


def _infer_filename_filter(question: str, filenames: list[str]) -> list[str]:
    q_norm = _normalize_key(question)
    if not q_norm:
        return []
    matches: list[str] = []
    for filename in filenames:
        fname = filename or ""
        stem_norm = _normalize_key(Path(fname).stem)
        full_norm = _normalize_key(fname)
        if stem_norm and (stem_norm in q_norm or q_norm in stem_norm):
            matches.append(fname)
        elif full_norm and (full_norm in q_norm or q_norm in full_norm):
            matches.append(fname)
    return sorted(set(matches))


def _tenant_id_for_user(current_user: dict | None) -> str | None:
    if not current_user:
        return None
    role = current_user.get("role")
    if role == "admin":
        return current_user.get("owner_admin") or current_user.get("username")
    return current_user.get("owner_admin")


def _allowed_filenames_for_user(current_user: dict | None) -> list[str]:
    tenant_id = _tenant_id_for_user(current_user)
    if not tenant_id:
        return []
    docs = _latest_active_docs_by_filename(tenant_id)
    return sorted(docs.keys())


def _latest_active_docs_by_filename(tenant_id: str) -> dict[str, dict]:
    """
    Return only the newest non-superseded document per filename for a tenant.
    This prevents retrieval from mixing old and new versions with same name.
    """
    cursor = documents_collection.find(
        {"owner_admin": tenant_id, "superseded": {"$ne": True}},
        {"_id": 0},
    ).sort("created_at", -1)
    latest: dict[str, dict] = {}
    for doc in cursor:
        filename = (doc.get("filename") or "").strip()
        if filename and filename not in latest:
            latest[filename] = doc
    return latest


# ---------------------------------------------------------------------------
# Short conversational messages (greetings / thanks) — no RAG retrieval
# ---------------------------------------------------------------------------

_GREETING_PREFIX = re.compile(
    r"^(hi|hello|hey|yo|hiya|howdy)[,!\s]+",
    re.IGNORECASE,
)

_SMALL_TALK_ONLY = re.compile(
    r"^(hi|hello|hey|yo|hiya|howdy|sup|what\'?s up\??|whats up\??|how are you\??|"
    r"good\s+(morning|afternoon|evening)|greetings|"
    r"thanks?|thank you|thx|ty|cheers|appreciate\s+it|"
    r"bye|goodbye|see you|later|cya|"
    r"ok|okay|cool|nice|great|good)[\s!.?]*$",
    re.IGNORECASE | re.DOTALL,
)


def _strip_leading_greeting(message: str) -> str:
    t = message.strip()
    return _GREETING_PREFIX.sub("", t).strip()


def _is_pure_small_talk(message: str) -> bool:
    raw = message.strip()
    if not raw or len(raw) > 120:
        return False
    if _SMALL_TALK_ONLY.match(raw):
        return True
    rest = _strip_leading_greeting(raw)
    if not rest:
        return True
    if len(rest) > 80:
        return False
    return bool(_SMALL_TALK_ONLY.match(rest))


def _build_casual_prompt(message: str, has_documents: bool) -> str:
    hint = (
        "The user already has documents indexed — invite them to ask a specific question."
        if has_documents
        else "They may still need to upload documents for grounded answers — say that in a friendly, brief way."
    )
    return (
        "You are a warm, concise assistant in a document Q&A app.\n"
        "Reply in 1–3 short sentences. Sound human. "
        "Do not claim you read their files.\n"
        f"{hint}\n\nUser said: {message!r}"
    )


def _ask_openai_compatible_casual(message: str, has_documents: bool) -> str | None:
    api_key, base_url, model = _resolve_chat_api_config()
    if not api_key or not model:
        return None
    try:
        client = OpenAI(api_key=api_key, base_url=base_url)
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You reply briefly and warmly for a RAG document app. Never claim you read user documents.",
                },
                {"role": "user", "content": _build_casual_prompt(message, has_documents)},
            ],
            temperature=0.7,
        )
        text = completion.choices[0].message.content or ""
        return text.strip() or None
    except Exception:
        return None


def _fallback_casual(message: str, has_documents: bool) -> str:
    t = message.lower().strip()
    if any(
        t.startswith(p)
        for p in (
            "hi",
            "hey",
            "hello",
            "yo",
            "hiya",
            "howdy",
            "greetings",
            "good morning",
            "good afternoon",
            "good evening",
            "sup",
        )
    ):
        if has_documents:
            return (
                "Hey! Good to see you. Ask me anything about your uploaded documents — "
                "I’ll pull answers straight from your files."
            )
        return (
            "Hi there! I’m your document assistant. Upload a PDF, Word file, or text, "
            "and I can answer questions grounded in that content. What would you like to explore?"
        )
    if "thank" in t or t in ("thx", "ty", "cheers"):
        return "You’re welcome! Ask another question anytime."
    if any(x in t for x in ("bye", "goodbye", "see you", "later", "cya")):
        return "Take care! I’m here whenever you want to dig back into your documents."
    if has_documents:
        return "I’m ready when you are — try asking about something in your documents."
    return "I’m here to help. Upload a document when you can, then ask me anything about it."


def _casual_reply(message: str, has_documents: bool) -> str:
    generated = _ask_openai_compatible_casual(message, has_documents)
    if generated:
        return generated
    return _fallback_casual(message, has_documents)


# ---------------------------------------------------------------------------
# Citations
# ---------------------------------------------------------------------------

def _build_citations(
    docs: list[str], metadatas: list[dict], limit: int = 3
) -> list[str]:
    citations: list[str] = []
    for idx, (doc, meta) in enumerate(zip(docs, metadatas)):
        filename = (meta or {}).get("filename", "unknown")
        chunk = (meta or {}).get("chunk", idx)
        page = (meta or {}).get("page")
        snippet = re.sub(r"\s+", " ", doc).strip()[:120]
        loc = f"chunk {chunk}"
        if page is not None:
            loc += f", page {page}"
        citations.append(f"{filename} ({loc}): {snippet}...")
        if len(citations) >= limit:
            break
    return citations


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def index_document(
    file_path: str, filename: str, uploaded_by: str, owner_admin: str
) -> str:
    collection = _get_collection()
    # FIX: removed the redundant _extract_text() call that was discarded.
    segments = _extract_segments(file_path)
    chunk_records = _chunk_segments(segments)
    chunks = [c["text"] for c in chunk_records]
    normalized_chunks = [_normalize_text_for_hashing(chunk) for chunk in chunks]
    chunk_hashes = [_sha256_hexdigest(chunk) for chunk in normalized_chunks]
    doc_content_hash = _sha256_hexdigest("\n".join(normalized_chunks))
    doc_id = str(uuid4())

    ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "doc_id": doc_id,
            "filename": filename,
            "chunk": i,
            "page": chunk_records[i].get("page"),
            "chunk_hash": chunk_hashes[i],
            "doc_content_hash": doc_content_hash,
            "uploaded_by": uploaded_by,
            "owner_admin": owner_admin,
        }
        for i in range(len(chunks))
    ]
    collection.add(ids=ids, documents=chunks, metadatas=metadatas)

    now = datetime.now(UTC)
    # Supersede older versions with the same filename or identical content hash.
    documents_collection.update_many(
        {
            "owner_admin": owner_admin,
            "superseded": {"$ne": True},
            "$or": [
                {"filename": filename},
                {"content_hash": doc_content_hash},
            ],
        },
        {
            "$set": {
                "superseded": True,
                "superseded_at": now,
                "superseded_reason": "newer_version_uploaded",
            }
        },
    )

    documents_collection.insert_one(
        {
            "doc_id": doc_id,
            "filename": filename,
            "uploaded_by": uploaded_by,
            "owner_admin": owner_admin,
            "chunks": len(chunks),
            "content_hash": doc_content_hash,
            "superseded": False,
            "created_at": now,
        }
    )
    return doc_id


def delete_document(doc_id: str, tenant_id: str, uploads_dir: Path) -> bool:
    """Remove document from MongoDB, Chroma, and disk. Returns False if not found or wrong tenant."""
    doc = documents_collection.find_one({"doc_id": doc_id, "owner_admin": tenant_id})
    if not doc:
        return False

    collection = _get_collection()
    batch = collection.get(where={"doc_id": doc_id}, include=[])
    ids = batch.get("ids") or []
    if ids:
        collection.delete(ids=ids)

    documents_collection.delete_one({"doc_id": doc_id, "owner_admin": tenant_id})

    filename = doc.get("filename")
    if filename:
        file_path = uploads_dir / filename
        if file_path.is_file():
            try:
                file_path.unlink()
            except OSError:
                pass
    return True


def list_documents_for_tenant(tenant_id: str) -> list[dict]:
    cursor = documents_collection.find(
        {"owner_admin": tenant_id},
        {"_id": 0},
    ).sort("created_at", -1)
    return list(cursor)


def ask_rag(
    question: str, top_k: int = 4, current_user: dict | None = None
) -> tuple[str, list[str]]:
    collection = _get_collection()

    tenant_id = _tenant_id_for_user(current_user)
    active_docs_by_filename = (
        _latest_active_docs_by_filename(tenant_id) if tenant_id else {}
    )
    allowed_filenames = sorted(active_docs_by_filename.keys())
    has_docs = bool(allowed_filenames)
    if _is_pure_small_talk(question):
        return _casual_reply(question, has_docs), []

    if not allowed_filenames:
        return "No accessible documents are indexed for this account yet.", []

    # FIX: only narrow to matched files when the question explicitly names one;
    # otherwise search ALL allowed files so older documents are not silently skipped.
    matched_filenames = _infer_filename_filter(question, allowed_filenames)
    candidate_filenames = (
        [f for f in matched_filenames if f in allowed_filenames]
        if matched_filenames
        else allowed_filenames
    )

    # FIX: guard against an empty list before hitting ChromaDB.
    if not candidate_filenames:
        return "No accessible documents are indexed for this account yet.", []

    candidate_doc_ids = [
        active_docs_by_filename[f]["doc_id"]
        for f in candidate_filenames
        if f in active_docs_by_filename and active_docs_by_filename[f].get("doc_id")
    ]
    if not candidate_doc_ids:
        return "No accessible documents are indexed for this account yet.", []

    where_filter: dict = {
        "$and": [
            {"owner_admin": tenant_id},
            {"doc_id": {"$in": candidate_doc_ids}},
        ]
    }

    results = collection.query(
        query_texts=[question],
        n_results=max(top_k * 3, 12),
        include=["documents", "metadatas", "distances"],
        where=where_filter,
    )
    docs: list[str] = results.get("documents", [[]])[0]
    metadatas: list[dict] = results.get("metadatas", [[]])[0]
    distances: list[float] = results.get("distances", [[]])[0]

    if tenant_id and metadatas:
        doc_ids = sorted(
            {
                m.get("doc_id")
                for m in metadatas
                if isinstance(m, dict) and m.get("doc_id")
            }
        )
        doc_lookup: dict[str, dict] = {}
        if doc_ids:
            cursor = documents_collection.find(
                {"owner_admin": tenant_id, "doc_id": {"$in": doc_ids}},
                {"_id": 0, "doc_id": 1, "created_at": 1, "content_hash": 1},
            )
            doc_lookup = {d["doc_id"]: d for d in cursor if d.get("doc_id")}

        for meta in metadatas:
            if not isinstance(meta, dict):
                continue
            doc_id = meta.get("doc_id")
            if not doc_id:
                continue
            mongo_doc = doc_lookup.get(doc_id) or {}
            meta["doc_created_at"] = mongo_doc.get("created_at")
            meta["doc_content_hash"] = meta.get("doc_content_hash") or mongo_doc.get(
                "content_hash"
            )

    docs, metadatas = _rerank_retrieval(
        question, docs, metadatas, distances, top_k=max(top_k, 6)
    )

    # FIX: remove near-duplicate chunks that arise from chunking overlap.
    docs, metadatas = _deduplicate_chunks(docs, metadatas)

    retrieved_sources = sorted({m.get("filename", "unknown") for m in metadatas if m})

    if not docs:
        return "I could not find relevant information in the indexed documents.", []

    # --- Generic LLM answer generation ---
    context = _truncate_context("\n\n".join(docs))
    sources = retrieved_sources
    citations = _build_citations(docs, metadatas, limit=3)
    extractive_answer = _answer_from_context(question, docs)
    fallback_answer = f"Top relevant context:\n\n{context[:1800]}"

    provider = settings.llm_provider.lower().strip()
    generated_answer: str | None = None

    if provider in {"openai", "groq"}:
        generated_answer = _ask_openai_compatible(question, context)
    else:
        generated_answer = None

    def _with_citations(answer: str) -> str:
        if citations:
            return answer + "\n\nCitations:\n- " + "\n- ".join(citations)
        return answer

    if generated_answer:
        return _with_citations(generated_answer), sources

    if extractive_answer.strip():
        notice = (
            "LLM provider is not reachable. Returning best extractive answer from retrieved chunks:\n"
            + extractive_answer
        )
        return _with_citations(notice), sources

    return _with_citations(fallback_answer), sources