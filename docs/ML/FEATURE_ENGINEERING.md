# ⚙️ Feature Engineering & Preprocessing

Located in `backend/app/ml/preprocessing.py` and `backend/app/ml/similarity.py`:

## 1. Skill Name Normalization
Skills are canonicalized to avoid duplicate entries due to capitalization or punctuation:
```python
def normalize_skill_name(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9+#]", "", name.lower().strip())
    # Canonical mappings: "js" -> "javascript", "py" -> "python"
    aliases = {"js": "javascript", "py": "python", "k8s": "kubernetes"}
    return aliases.get(cleaned, cleaned)
```

---

## 2. TF-IDF Semantic Interest Representation
- Profile bio text and target career overviews are vectorized using Scikit-learn's `TfidfVectorizer(stop_words='english', ngram_range=(1, 2))`.
- Cosine similarity measures geometric alignment between candidate interest vectors and career descriptions.
