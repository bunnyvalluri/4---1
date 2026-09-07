import numpy as np
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def compute_vector_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """Compute cosine similarity between two numerical vectors."""
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(np.dot(vec_a, vec_b) / (norm_a * norm_b))


def compute_text_similarity(text_a: str, text_b: str) -> float:
    """Compute TF-IDF cosine similarity between two text snippets."""
    if not text_a or not text_b:
        return 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform([text_a, text_b])
        score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(score)
    except Exception:
        # Fallback to Jaccard similarity if TF-IDF cannot be fit (e.g. all words are stop words)
        set_a = set(text_a.lower().split())
        set_b = set(text_b.lower().split())
        union = set_a.union(set_b)
        if not union:
            return 0.0
        return float(len(set_a.intersection(set_b)) / len(union))


def compute_jaccard_similarity(set_a: set, set_b: set) -> float:
    """Compute Jaccard similarity between two sets."""
    if not set_a or not set_b:
        return 0.0
    intersection = set_a.intersection(set_b)
    union = set_a.union(set_b)
    return float(len(intersection) / len(union)) if union else 0.0
