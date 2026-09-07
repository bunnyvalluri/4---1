import re
import unicodedata


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", text)


def truncate_text(text: str, max_chars: int = 100) -> str:
    """Truncate text cleanly at word boundaries."""
    if len(text) <= max_chars:
        return text
    truncated = text[:max_chars].rsplit(" ", 1)[0]
    return truncated + "..."
