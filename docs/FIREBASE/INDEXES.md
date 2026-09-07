# 📑 Cloud Firestore Indexes Reference

The file `firestore.indexes.json` declares all required composite indexes.

## 1. Index Definitions & Justification

| Collection | Indexed Fields | Query Justification |
| :--- | :--- | :--- |
| `assessment_attempts` | `userId` ASC, `completedAt` DESC | Fetches candidate's latest diagnostic scores without client sorting. |
| `career_recommendations` | `userId` ASC, `match_score` DESC | Powers dashboard career ranking ordered by match percentage. |
| `skill_gaps` | `userId` ASC, `severity` ASC | Returns critical skill deficiencies prioritized for roadmap remediation. |
| `roadmap_items` | `roadmapId` ASC, `month` ASC | Displays 6-month curriculum items in sequential calendar order. |
| `chat_messages` | `sessionId` ASC, `createdAt` ASC | Streams chat transcripts chronologically. |
| `notifications` | `userId` ASC, `createdAt` DESC | Displays most recent alerts in candidate notification tray. |
| `audit_logs` | `userId` ASC, `timestamp` DESC | Allows security team to audit specific user actions chronologically. |
