import certifi
from pymongo import MongoClient

from app.core.config import settings

mongo_kwargs = {
    "serverSelectionTimeoutMS": 10000,
}

# Atlas/SRV connections on Windows are more reliable with explicit CA bundle.
if settings.mongo_uri.startswith("mongodb+srv://"):
    mongo_kwargs["tlsCAFile"] = certifi.where()

client = MongoClient(settings.mongo_uri, **mongo_kwargs)
db = client[settings.mongo_db]

users_collection = db["users"]
documents_collection = db["documents"]
refresh_tokens_collection = db["refresh_tokens"]
chat_sessions_collection = db["chat_sessions"]
