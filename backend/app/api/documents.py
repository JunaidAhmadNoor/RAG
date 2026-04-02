from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.deps import admin_required, upload_allowed
from app.services.rag_service import delete_document, index_document, list_documents_for_tenant

router = APIRouter(prefix="/api/documents", tags=["documents"])
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload")
async def upload_document(file: UploadFile = File(...), current_user=Depends(upload_allowed)):
    ext = Path(file.filename).suffix.lower()
    allowed = {".txt", ".md", ".pdf", ".docx"}
    if ext not in allowed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File type not supported")

    file_path = UPLOAD_DIR / file.filename
    content = await file.read()
    file_path.write_bytes(content)

    owner_admin = current_user.get("owner_admin") or current_user["username"]
    doc_id = index_document(str(file_path), file.filename, current_user["username"], owner_admin)
    return {"message": "Document uploaded and indexed", "doc_id": doc_id}


@router.get("")
def list_documents(current_user=Depends(admin_required)):
    tenant_id = current_user.get("owner_admin") or current_user["username"]
    docs = list_documents_for_tenant(tenant_id)
    return {"documents": docs}


@router.delete("/{doc_id}")
def remove_document(doc_id: str, current_user=Depends(admin_required)):
    tenant_id = current_user.get("owner_admin") or current_user["username"]
    ok = delete_document(doc_id, tenant_id, UPLOAD_DIR)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return {"message": "Document deleted"}
