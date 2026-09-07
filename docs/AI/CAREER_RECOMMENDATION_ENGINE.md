# 🎯 Career Recommendation Engine

## 1. Engine Overview
Located in `backend/app/ai/career_recommender.py` and `backend/app/ml/scoring.py`, this engine computes compatibility scores between a candidate's holistic profile and all registered careers.

## 2. Recommendation Pipeline
1. **User Profile Retrieval**: Extracts user skills, ratings (1–5), aptitude category scores, bio, and experience.
2. **Career Matrix Loading**: Retrieves career prerequisites, required proficiencies, weights, and aptitude benchmarks.
3. **Multi-Factor Scoring**: Evaluates four core sub-scores:
   - Technical Skill Match ($40\%$)
   - Cognitive Aptitude Alignment ($25\%$)
   - Semantic Interest Similarity ($20\%$)
   - Experience Factor ($15\%$)
4. **Ranking & Sorting**: Sorts careers descending by `match_score` and returns top matches with matching/missing skills.
