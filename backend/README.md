# CareerAI Backend & Machine Learning Layer

This directory contains the server-side algorithms, AI recommendation engine, authentication services, resume parsing pipeline, and integration tests for the **CareerAI** platform.

## Architecture
- **Runtime**: Node.js / Next.js Server Runtimes
- **Database Access**: Prisma Client (`@prisma/client`)
- **Authentication**: JWT (JSON Web Tokens) with salted `bcryptjs` password hashes
- **AI Integration**: Google Gemini API (`@google/genai`) with 3000ms timeout fallbacks

## Subsystems
```
backend/
├── recommendationEngine.ts  # Transparent Hybrid ML Engine with 7 contributing factors
├── resumeParser.ts          # PDF & DOCX text extraction with ATS keyword scoring
├── gemini.ts                # Grounded AI Career Assistant ("Aura") client
├── roadmapService.ts        # 6-Month dynamic learning milestone generator
├── auth.ts                  # Secure authentication, session tokens & role guards
├── db.ts                    # Prisma singleton connection client
├── types.ts                 # Core TypeScript data contracts
├── tests/                   # End-to-end integration and algorithmic test suites
└── README.md                # Backend architecture documentation
```

## Hybrid Recommendation Algorithm
Calculates compatibility across 7 explainable dimensions:
$$\text{MatchScore} = 0.28(\text{Skills}) + 0.16(\text{Interests}) + 0.16(\text{Aptitude}) + 0.12(\text{Education}) + 0.10(\text{Experience}) + 0.10(\text{Preferences}) + 0.08(\text{ResumeSkills})$$
