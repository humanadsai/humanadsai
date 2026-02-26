"""Configuration and environment variable loading."""

import os
from pathlib import Path

# Project root (humanads-imggen/)
PROJECT_ROOT = Path(__file__).parent.parent.parent

# Default paths
PROMPTS_DIR = PROJECT_ROOT / "prompts"
OUTPUT_DIR = PROJECT_ROOT / "output"
DB_PATH = OUTPUT_DIR / "imggen.db"

# Template files
MASTER_TEMPLATE = PROMPTS_DIR / "master-template.yaml"
BLACKLIST_FILE = PROMPTS_DIR / "blacklist.txt"
WHITELIST_FILE = PROMPTS_DIR / "whitelist.txt"


def get_openai_key() -> str:
    """Get OpenAI API key from environment."""
    key = os.environ.get("OPENAI_API_KEY", "")
    if not key:
        raise ValueError(
            "OPENAI_API_KEY not set. Export it: export OPENAI_API_KEY=sk-..."
        )
    return key
