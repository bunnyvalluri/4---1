# 📊 Skill Gap API Reference

Computes explicit skill differentials, deficiency severity, and targeted remediation steps.

## 1. List Skill Gaps
- **Endpoint**: `GET /api/v1/recommendations/skill-gaps`
- **Access**: Authenticated
- **Query Parameters**:
  - `career_id` (optional string): Filter to a specific target career.
- **Response** (`200 OK`):
  ```json
  [
    {
      "skill_name": "Kubernetes",
      "category": "CLOUD",
      "user_proficiency": 2,
      "required_proficiency": 4,
      "severity": "CRITICAL",
      "is_required": true,
      "recommended_action": "Complete hands-on container orchestration modules and deploy multi-pod deployments."
    },
    {
      "skill_name": "Terraform",
      "category": "TOOL",
      "user_proficiency": 1,
      "required_proficiency": 3,
      "severity": "HIGH",
      "is_required": false,
      "recommended_action": "Study Infrastructure as Code (IaC) syntax and provision modular AWS resources."
    }
  ]
  ```
