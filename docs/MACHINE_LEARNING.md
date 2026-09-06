# CareerAI Machine Learning Subsystem

The CareerAI platform implements a dual-engine architecture combining Python ML models with TypeScript hybrid business logic.

## Technology Stack
- **Language**: Python 3.13
- **Libraries**: `scikit-learn` (v1.8.0), `pandas` (v3.0.1), `numpy` (v2.5.2), `joblib` (v1.5.3)

## Components
```
backend/ml/
├── career_recommender.py       # Core inference engine with CLI & IPC support
├── train_models.py             # Supervised Random Forest training pipeline
├── test_ml_engine.py           # Unit test suite verifying persona rankings
└── models/
    └── career_classifier.joblib # Serialized model artifact
```

## Model Architecture
1. **Feature Engineering**:
   - Tabular candidate profile representation via `pandas.DataFrame`.
   - Cognitive aptitude vector: $\vec{A} = [L, Q, V, An, PS]$ normalized to $[0, 100]$.
   - Educational degree hierarchy weightings (Bachelors, Masters, PhD).
2. **Text Representation & Embeddings**:
   - `sklearn.feature_extraction.text.TfidfVectorizer(ngram_range=(1, 2))` generates dense term-frequency inverse-document frequency vectors across candidate skills, projects, and target descriptions.
   - `sklearn.metrics.pairwise.cosine_similarity` computes semantic affinity against career catalog embeddings.
3. **Supervised Suitability Classifier**:
   - `RandomForestClassifier(n_estimators=50, max_depth=8)` predicts multi-class career suitability probabilities.
4. **Explainability & Attribution**:
   - Every recommendation produces a transparent 6-factor attribution breakdown:
     - Verified Skills Overlap (30%)
     - Semantic Domain Similarity (20%)
     - Cognitive Aptitude Alignment (20%)
     - Career Role & Interest Affinity (15%)
     - Experience & Practical Seniority (10%)
     - Education Tier Compatibility (5%)

## Running Tests
```bash
python -m unittest backend/ml/test_ml_engine.py
```
