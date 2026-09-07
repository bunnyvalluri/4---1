# 🗄️ Database Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    User ||--o| Profile : has
    User ||--o{ UserSkill : possesses
    User ||--o{ AptitudeAttempt : completes
    User ||--o{ CareerRecommendation : receives
    User ||--o{ SkillGap : identifies
    User ||--o{ Roadmap : generates
    User ||--o{ ResumeAnalysis : uploads
    User ||--o{ ChatSession : initiates
    User ||--o{ Notification : receives

    Skill ||--o{ UserSkill : rated_by
    Skill ||--o{ CareerSkill : required_by
    Career ||--o{ CareerSkill : requires
    Career ||--o{ CareerRecommendation : recommends
    Roadmap ||--o{ RoadmapItem : contains
    ChatSession ||--o{ ChatMessage : contains

    User {
        string id PK
        string email UK
        string name
        string role
        string passwordHash
    }

    Profile {
        string id PK
        string userId FK
        string bio
        string degree
        float workExperienceYears
    }

    Skill {
        string id PK
        string name UK
        string category
    }

    Career {
        string id PK
        string title
        string slug UK
        string averageSalary
    }

    Roadmap {
        string id PK
        string userId FK
        string careerTitle
        int durationMonths
    }
```
