# 🔬 Unit Testing

Unit tests focus on deterministic domain algorithms without external network or database dependencies.

## 1. Scoring Logic Tests
Located in `backend/tests/test_recommendations.py` and `test_skill_gaps.py`:
- Verifies weighted skill match calculations.
- Tests aptitude benchmark ratios and edge cases ($0\%$ score, $100\%$ score).
- Ensures experience curve calculations map correctly to `Entry`, `Mid`, and `Senior` thresholds.

## 2. Running Unit Tests
```bash
python -m pytest backend/tests/test_recommendations.py backend/tests/test_skill_gaps.py -v
```
