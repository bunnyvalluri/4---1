import os
import uuid
from typing import Tuple


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal and invalid characters."""
    base = os.path.basename(filename)
    safe_name = "".join(c for c in base if c.isalnum() or c in "._- ")
    return safe_name.strip()


def generate_unique_filename(original_filename: str) -> Tuple[str, str]:
    """Generates a unique filename while preserving extension."""
    safe_name = sanitize_filename(original_filename)
    name, ext = os.path.splitext(safe_name)
    unique_id = uuid.uuid4().hex[:12]
    unique_filename = f"{unique_id}_{safe_name}"
    return unique_filename, ext
