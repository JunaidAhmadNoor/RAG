from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.schemas.chat import ChatRequest, ChatResponse, NewSessionResponse
from app.services.chat_session_service import (
    append_turn,
    assert_session_owner,
    create_session,
    delete_session,
    list_sessions_for_user,
    set_title_if_new,
)
from app.services.rag_service import ask_rag

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/sessions")
def list_sessions(current_user=Depends(get_current_user)):
    return list_sessions_for_user(current_user["username"])


@router.post("/sessions", status_code=201, response_model=NewSessionResponse)
def new_session(current_user=Depends(get_current_user)):
    sid = create_session(current_user["username"])
    return NewSessionResponse(session_id=sid, title="New chat")


@router.get("/sessions/{session_id}")
def get_session_detail(session_id: str, current_user=Depends(get_current_user)):
    return assert_session_owner(session_id, current_user["username"])


@router.delete("/sessions/{session_id}", status_code=204)
def remove_session(session_id: str, current_user=Depends(get_current_user)):
    delete_session(session_id, current_user["username"])


@router.post("", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest, current_user=Depends(get_current_user)):
    username = current_user["username"]
    if payload.session_id:
        doc = assert_session_owner(payload.session_id, username)
        session_id = payload.session_id
        prior_empty = len(doc.get("messages") or []) == 0
    else:
        session_id = create_session(username)
        prior_empty = True

    answer, sources = ask_rag(payload.message, payload.top_k, current_user=current_user)
    append_turn(session_id, username, payload.message, answer, sources)
    if prior_empty:
        set_title_if_new(session_id, username, payload.message)

    return ChatResponse(answer=answer, sources=sources, session_id=session_id)
