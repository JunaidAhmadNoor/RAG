# RAG Role-Based Chat System

Production-style starter project for a RAG platform with:

- Admin and user roles
- JWT access token + refresh token authentication
- Admin-only multi-document upload and indexing
- Shared chat experience for both admin and user
- React + Ant Design frontend with modern UI
- FastAPI + MongoDB + Chroma vector DB backend

## Tech Stack

- Frontend: React, Vite, Ant Design, Axios, Zustand
- Backend: FastAPI, PyMongo, python-jose, passlib
- RAG: ChromaDB + Sentence Transformers + OpenAI-compatible LLM APIs (Groq recommended)
- Database: MongoDB

## Project Structure

- `frontend`: React UI
- `backend`: FastAPI APIs and RAG pipeline

## Backend Setup

1. Go to backend:
   - `cd backend`
2. Create virtual environment:
   - `python -m venv .venv`
   - Windows: `.venv\Scripts\activate`
3. Install dependencies:
   - `pip install -r requirements.txt`
4. Create `.env` from `.env.example` and set secrets.
5. Configure your LLM provider in `.env` (Groq recommended):
   - `LLM_PROVIDER=groq`
   - `LLM_API_KEY=your_groq_api_key`
   - `LLM_BASE_URL=https://api.groq.com/openai/v1`
   - `LLM_MODEL=llama-3.3-70b-versatile`
6. Run API:
   - `uvicorn app.main:app --reload --port 8000`

## Frontend Setup

1. Go to frontend:
   - `cd frontend`
2. Install dependencies:
   - `npm install`
3. Start app:
   - `npm run dev`

Frontend runs on `http://localhost:5173`, backend on `http://localhost:8000`.

## Default Flow

1. Register an admin account.
2. Login as admin and upload one or multiple documents.
3. Ask questions in the chat page.
4. Register/login as normal user and chat with same indexed documents.

## Notes

- Default LLM provider is Groq via `LLM_PROVIDER=groq`.
- OpenAI-compatible providers are supported via `LLM_PROVIDER=openai` (or `groq`) and `LLM_API_KEY`/`LLM_BASE_URL`/`LLM_MODEL`.
- If no LLM provider is reachable, backend falls back to extractive answers from retrieved chunks.
"# RAG" 
