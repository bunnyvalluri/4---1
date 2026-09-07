# 📊 Machine Learning Feature Matrix

| Feature Name | Type | Range | Description |
| :--- | :--- | :--- | :--- |
| `user_skill_proficiencies` | Sparse Dict | $1 - 5$ | Self-rated technical and soft skill proficiencies |
| `career_skill_reqs` | Dict | $1 - 5$ | Minimum required proficiency per career skill |
| `career_skill_weights` | Float | $1.0 - 2.5$ | Criticality weight of required vs optional skills |
| `aptitude_scores` | Vector | $0 - 100$ | Diagnostic performance across 5 cognitive categories |
| `aptitude_benchmarks` | Vector | $0 - 100$ | Role-specific cognitive benchmark thresholds |
| `profile_bio_text` | String | $0 - 2000$ chars | Semantic candidate interest and career aspirations |
| `career_overview_text` | String | $100 - 1500$ chars| Semantic description of career responsibilities |
| `work_experience_years` | Float | $0 - 40$ | Candidate verified professional experience |
| `career_seniority_level`| String | `Entry`, `Mid`, `Senior` | Target experience expectation |
