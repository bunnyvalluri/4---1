import re
from typing import List, Set

# Common skill alias dictionary for normalization
SKILL_ALIASES = {
    "js": "javascript",
    "ts": "typescript",
    "py": "python",
    "golang": "go",
    "react": "react.js",
    "reactjs": "react.js",
    "next": "next.js",
    "nextjs": "next.js",
    "vue": "vue.js",
    "vuejs": "vue.js",
    "postgres": "postgresql",
    "pg": "postgresql",
    "k8s": "kubernetes",
    "tf": "tensorflow",
    "pt": "pytorch",
    "aws": "amazon web services",
    "gcp": "google cloud platform",
}


def normalize_text(text: str) -> str:
    """Lowercase and strip punctuation/extra spaces from text."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s\.\+\#-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_skill_name(name: str) -> str:
    """Normalize a single skill name using aliases and standard casing."""
    clean = normalize_text(name)
    return SKILL_ALIASES.get(clean, clean)


def extract_keywords(text: str) -> List[str]:
    """Tokenize and return unique words/tokens longer than 2 characters."""
    normalized = normalize_text(text)
    tokens = re.split(r"[\s,;]+", normalized)
    return [t for t in tokens if len(t) > 2]
