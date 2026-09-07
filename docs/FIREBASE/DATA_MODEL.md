# 📊 Complete Firestore Data Model Reference

Exhaustive specification of all **25 Required Collections**.

---

### 1. `users/{userId}`
- **Doc ID**: `userId` (Firebase Auth UID)
- **Ownership**: User-owned (`isOwner(userId)`)
- **Fields**:
  - `uid` (string, required)
  - `email` (string, required)
  - `displayName` (string, optional)
  - `role` (string, required: `"USER"` | `"ADMIN"`)
  - `emailVerified` (boolean, required)
  - `createdAt` (ISO timestamp, immutable)
  - `updatedAt` (ISO timestamp)

### 2. `profiles/{userId}`
- **Doc ID**: `userId`
- **Ownership**: User-owned
- **Fields**:
  - `userId` (string, required)
  - `bio` (string, optional)
  - `degree` (string, optional)
  - `careerGoals` (string, optional)
  - `interests` (array of strings, optional)
  - `workExperienceYears` (float, optional)
  - `githubUrl` (string, optional)
  - `linkedinUrl` (string, optional)
  - `updatedAt` (ISO timestamp)

### 3. `education/{educationId}`
- **Doc ID**: Auto-generated
- **Ownership**: `resource.data.userId == request.auth.uid`
- **Fields**: `userId`, `institution`, `degree`, `gradYear`, `cgpa`, `createdAt`.

### 4. `experiences/{experienceId}`
- **Doc ID**: Auto-generated
- **Ownership**: `resource.data.userId == request.auth.uid`
- **Fields**: `userId`, `company`, `role`, `startDate`, `endDate`, `highlights` (array).

### 5. `skills/{skillId}`
- **Doc ID**: Normalized skill slug (e.g., `python`, `kubernetes`)
- **Ownership**: Global Catalog (Read: Authenticated, Write: Admin)
- **Fields**: `name`, `category` (`TECHNICAL`, `SOFT`, `CLOUD`, `TOOL`, `DATABASE`), `description`.

### 6. `user_skills/{userId_skillId}`
- **Doc ID**: Deterministic `${userId}_${skillName}`
- **Ownership**: User-owned
- **Fields**: `userId`, `skillName`, `proficiency` (int: 1–5), `category`, `updatedAt`.

### 7. `interests/{interestId}`
- **Doc ID**: Slug
- **Ownership**: Global Catalog (Admin write)
- **Fields**: `name`, `description`, `industry`.

### 8. `certifications/{certId}`
- **Doc ID**: Auto-generated
- **Ownership**: User-owned
- **Fields**: `userId`, `title`, `issuingOrganization`, `issueDate`, `credentialUrl`.

### 9. `projects/{projectId}`
- **Doc ID**: Slug / Auto-generated
- **Ownership**: Global Catalog
- **Fields**: `title`, `description`, `techStack` (array), `difficulty`, `learningObjectives` (array).

### 10. `careers/{careerId}`
- **Doc ID**: Slug (e.g., `cloud-solutions-architect`)
- **Ownership**: Global Catalog
- **Fields**: `title`, `overview`, `salaryRange`, `growthRate`, `experienceLevel`, `aptitudeBenchmarks` (map).

### 11. `career_skills/{careerId_skillId}`
- **Doc ID**: Auto-generated or compound
- **Ownership**: Global Catalog
- **Fields**: `careerId`, `skillName`, `isRequired` (bool), `minProficiency` (1–5), `weight` (float).

### 12. `assessments/{assessmentId}`
- **Doc ID**: Slug
- **Ownership**: Global Catalog
- **Fields**: `title`, `category`, `durationMinutes`, `totalQuestions`.

### 13. `questions/{questionId}`
- **Doc ID**: Auto-generated
- **Ownership**: Global Catalog (Admin write, answers hidden on read)
- **Fields**: `question`, `category`, `difficulty`, `options` (array of maps), `correctAnswer`, `explanation`.

### 14. `assessment_attempts/{attemptId}`
- **Doc ID**: Auto-generated
- **Ownership**: User-owned
- **Fields**: `userId`, `overallScore`, `categoryScores` (map), `durationSeconds`, `completedAt`.

### 15. `answers/{answerId}`
- **Doc ID**: Auto-generated
- **Ownership**: User-owned
- **Fields**: `userId`, `questionId`, `selectedOption`, `isCorrect` (bool), `createdAt`.

### 16. `career_recommendations/{userId_careerId}`
- **Doc ID**: `${userId}_${careerId}`
- **Ownership**: User-owned
- **Fields**: `userId`, `careerId`, `careerTitle`, `matchScore` (float), `breakdown` (map), `matchingSkills`, `missingSkills`.

### 17. `skill_gaps/{userId_careerId_skillId}`
- **Doc ID**: Deterministic compound key
- **Ownership**: User-owned
- **Fields**: `userId`, `careerId`, `skillName`, `userProficiency`, `requiredProficiency`, `severity` (`CRITICAL`, `HIGH`, `MODERATE`, `LOW`).

### 18. `roadmaps/{userId_careerId}`
- **Doc ID**: `${userId}_${careerId}`
- **Ownership**: User-owned
- **Fields**: `userId`, `careerId`, `careerTitle`, `durationMonths`, `totalItemsCount`, `completedItemsCount`.

### 19. `roadmap_items/{roadmapId_month_X}`
- **Doc ID**: Deterministic key
- **Ownership**: User-owned
- **Fields**: `roadmapId`, `userId`, `month` (1–6), `title`, `description`, `tasks` (array of maps), `isCompleted`.

### 20. `resumes/{resumeId}`
- **Doc ID**: UUID
- **Ownership**: User-owned
- **Fields**: `userId`, `resumeId`, `originalFilename`, `storagePath`, `mimeType`, `fileSizeBytes`, `createdAt`.

### 21. `resume_analyses/{resumeId}`
- **Doc ID**: UUID matching resume
- **Ownership**: User-owned
- **Fields**: `userId`, `resumeId`, `atsScore`, `summary`, `extractedSkills`, `missingSkills`, `weakBulletPoints`, `recommendations`.

### 22. `chat_sessions/{sessionId}`
- **Doc ID**: UUID
- **Ownership**: User-owned
- **Fields**: `userId`, `title`, `createdAt`, `updatedAt`.

### 23. `chat_messages/{messageId}`
- **Doc ID**: Auto-generated
- **Ownership**: User-owned
- **Fields**: `sessionId`, `userId`, `role` (`user` | `assistant`), `content`, `createdAt`.

### 24. `notifications/{notifId}`
- **Doc ID**: Auto-generated
- **Ownership**: User-owned
- **Fields**: `userId`, `title`, `message`, `read` (bool), `type`, `createdAt`.

### 25. `audit_logs/{logId}`
- **Doc ID**: Auto-generated
- **Ownership**: Read: Admin, Write: Backend Service
- **Fields**: `userId`, `action`, `resource`, `metadata` (map), `timestamp`.
