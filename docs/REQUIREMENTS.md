# 📋 System Requirements Specification

## 1. Functional Requirements (FR)

### FR-01: Authentication & User Management
- The system must provide secure JWT-based authentication using HS256 signatures with 24-hour expiration.
- Passwords must be hashed using salted Bcrypt before storage.
- Support candidate and administrator roles with role-based route guards.

### FR-02: Profile & Skill Matrix Management
- Candidates must manage academic history, GPA, graduation year, target roles, preferred industries, and bio.
- Candidates must self-rate technical, soft, framework, and database proficiencies on a 1–5 scale.
- Admin users can manage and expand the global skills taxonomy (100+ standard skills).

### FR-03: Cognitive & Psychometric Diagnostic Engine
- The system must present categorized aptitude questions across 5 core cognitive axes:
  - `LOGICAL`, `QUANTITATIVE`, `ANALYTICAL`, `VERBAL`, and `PROBLEM_SOLVING`.
- Questions must support timed sessions and automated grading.
- Score reports must detail percentage proficiencies mapped to career benchmark standards.

### FR-04: Multi-Factor Career Recommendation Engine
- The engine must compute career match rankings using a weighted composite formula:
  $$\text{Match} = (\text{Skills} \times 0.40) + (\text{Aptitude} \times 0.25) + (\text{Interest} \times 0.20) + (\text{Experience} \times 0.15)$$
- Return matching skills, missing skills, and detailed dimensional breakdowns.

### FR-05: Skill Gap Severity Analysis
- Analyze missing required and optional skills against target career profiles.
- Classify gaps into `CRITICAL`, `HIGH`, `MODERATE`, and `LOW` severity levels.

### FR-06: Dynamic 6-Month Roadmap Generation
- Generate structured 6-phase learning plans with tasks, milestone objectives, and checklist states.
- Allow users to toggle milestone tasks with persistent progress updates.

### FR-07: PyMuPDF ATS Resume Scanner
- Accept PDF and DOCX document uploads up to 10MB.
- Extract clean text, parse standard headers (`Experience`, `Education`, `Skills`, `Projects`).
- Detect weak action verbs (`responsible for`, `worked on`) and suggest XYZ-action alternatives.
- Compute composite ATS readability score (0–100%).

### FR-08: AI Career Assistant & SSE Streaming
- Provide interactive chat sessions with conversational memory.
- Support real-time token streaming via Server-Sent Events (`text/event-stream`).

---

## 2. Non-Functional Requirements (NFR)

| ID | Category | Metric / Specification |
| :--- | :--- | :--- |
| **NFR-01** | Performance | Recommendation calculation $\le 200\text{ms}$ for 50 careers. |
| **NFR-02** | Latency | AI Assistant SSE time-to-first-chunk $\le 450\text{ms}$. |
| **NFR-03** | Scalability | Asynchronous non-blocking I/O handling $500+$ concurrent sessions. |
| **NFR-04** | Availability | $99.9\%$ uptime targeting stateless container deployment. |
| **NFR-05** | Security | OWASP Top 10 compliance, input sanitization, parameterized SQL queries. |
| **NFR-06** | Usability | WCAG 2.1 AA accessible UI with modern clean design. |
