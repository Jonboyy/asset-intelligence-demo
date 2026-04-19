import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("POSTGRES_HOST", "localhost")
os.environ.setdefault("POSTGRES_DB", "asset_intelligence")
os.environ.setdefault("POSTGRES_USER", "asset_admin")
os.environ.setdefault("POSTGRES_PASSWORD", "asset_admin_dev")
os.environ.setdefault("POSTGRES_PORT", "5433")

os.environ.setdefault("LLM_PROVIDER", "test")
os.environ.setdefault("LLM_API_KEY", "test-api-key")
os.environ.setdefault("LLM_MODEL", "test-model")
os.environ.setdefault("LLM_BASE_URL", "https://example.com/v1")

os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("APP_NAME", "Asset Intelligence Assistant API Test")
os.environ.setdefault("APP_DEBUG", "true")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")