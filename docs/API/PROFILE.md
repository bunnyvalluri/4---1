# 📋 Profile API Reference

Manages candidate professional preferences, academic backgrounds, and social profiles.

## 1. Get Candidate Profile
- **Endpoint**: `GET /api/v1/profile`
- **Access**: Authenticated
- **Response** (`200 OK`):
  ```json
  {
    "id": "prof_123",
    "userId": "cuid_user_123",
    "phone": "+1-555-0199",
    "location": "San Francisco, CA",
    "bio": "Aspiring Backend and Cloud Architect passionate about scalable distributed systems.",
    "degree": "B.S. Computer Science",
    "branch": "Software Engineering",
    "college": "State University",
    "gradYear": 2025,
    "cgpa": 3.85,
    "interests": ["Distributed Systems", "Cloud Computing", "Machine Learning"],
    "preferredIndustries": ["Fintech", "Enterprise SaaS"],
    "preferredRoles": ["Backend Engineer", "Cloud Solutions Architect"],
    "workExperienceYears": 1.5,
    "githubUrl": "https://github.com/alexj",
    "linkedinUrl": "https://linkedin.com/in/alexj"
  }
  ```

---

## 2. Update Candidate Profile
- **Endpoint**: `PUT /api/v1/profile`
- **Access**: Authenticated
- **Request Body**: Partial or full update of profile attributes.
- **Response** (`200 OK`): Updated profile entity.
