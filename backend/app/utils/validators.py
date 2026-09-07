import re
from typing import Optional


def is_valid_email(email: str) -> bool:
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return bool(re.match(pattern, email.strip()))


def is_valid_phone(phone: Optional[str]) -> bool:
    if not phone:
        return True
    # Allow digits, spaces, hyphens, parentheses, plus
    clean = re.sub(r"[\s\-\(\)\+]", "", phone)
    return clean.isdigit() and 7 <= len(clean) <= 15


def is_allowed_file_extension(filename: str, allowed_extensions: set = None) -> bool:
    if allowed_extensions is None:
        allowed_extensions = {".pdf", ".docx", ".doc", ".txt"}
    return any(filename.lower().endswith(ext) for ext in allowed_extensions)
