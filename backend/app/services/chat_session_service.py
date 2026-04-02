from datetime import UTC, datetime
from uuid import uuid4

from fastapi import HTTPException, status

from app.db.mongodb import chat_sessions_collection


def _now() -> datetime:
    return datetime.now(UTC)


def create_session(username: str, title: str = "New chat") -> str:
    session_id = str(uuid4())
    chat_sessions_collection.insert_one(
        {
            "session_id": session_id,
            "username": username,
            "title": title,
            "messages": [],
            "created_at": _now(),
            "updated_at": _now(),
        }
    )
    return session_id


def list_sessions_for_user(username: str, limit: int = 100) -> list[dict]:
    cursor = (
        chat_sessions_collection.find({"username": username}, {"_id": 0})
        .sort("updated_at", -1)
        .limit(limit)
    )
    out: list[dict] = []
    for doc in cursor:
        out.append(
            {
                "session_id": doc["session_id"],
                "title": doc.get("title") or "Chat",
                "updated_at": doc.get("updated_at"),
                "created_at": doc.get("created_at"),
            }
        )
    return out


def get_session(session_id: str, username: str) -> dict | None:
    return chat_sessions_collection.find_one(
        {"session_id": session_id, "username": username},
        {"_id": 0},
    )


def assert_session_owner(session_id: str, username: str) -> dict:
    doc = get_session(session_id, username)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    return doc


def delete_session(session_id: str, username: str) -> None:
    result = chat_sessions_collection.delete_one(
        {"session_id": session_id, "username": username}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")


def append_turn(
    session_id: str,
    username: str,
    user_message: str,
    assistant_message: str,
    sources: list[str],
) -> None:
    assert_session_owner(session_id, username)
    chat_sessions_collection.update_one(
        {"session_id": session_id, "username": username},
        {
            "$push": {
                "messages": {
                    "$each": [
                        {"role": "user", "content": user_message},
                        {
                            "role": "assistant",
                            "content": assistant_message,
                            "sources": sources,
                        },
                    ]
                }
            },
            "$set": {"updated_at": _now()},
        },
    )


def set_title_if_new(session_id: str, username: str, user_first_line: str) -> None:
    doc = get_session(session_id, username)
    if not doc or doc.get("title") not in ("New chat", None, ""):
        return
    title = user_first_line.strip().replace("\n", " ")
    if len(title) > 72:
        title = title[:69] + "..."
    chat_sessions_collection.update_one(
        {"session_id": session_id, "username": username},
        {"$set": {"title": title or "Chat", "updated_at": _now()}},
    )
