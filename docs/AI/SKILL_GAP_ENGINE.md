# 📊 Skill Gap Analysis Engine

## 1. Severity Classification
The engine evaluates missing or under-proficient skills for a target career and assigns a severity rating:

| Deficiency | Required Skill? | Assigned Severity | Action Trigger |
| :--- | :--- | :--- | :--- |
| $\Delta \ge 2$ | Yes | **`CRITICAL`** | Immediate Phase 1 Roadmap Priority |
| $\Delta = 1$ | Yes | **`HIGH`** | Phase 2 Framework Immersion |
| $\Delta \ge 2$ | No (Optional) | **`MODERATE`** | Phase 3/4 Elective Project |
| $\Delta = 1$ | No (Optional) | **`LOW`** | General reading / self-study |

Where $\Delta = \text{Required Proficiency} - \text{User Proficiency}$.
