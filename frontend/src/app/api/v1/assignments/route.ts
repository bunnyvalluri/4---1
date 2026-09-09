import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

const DEFAULT_ASSIGNMENTS = [
  {
    id: 'asgn_swe_01',
    title: 'Build a Production REST API with FastAPI & PostgreSQL',
    description: 'Architect and deploy an asynchronous REST API service with JWT authentication, Neon database pooling, and GitHub Actions CI validation.',
    difficulty: 'Intermediate',
    estimatedHours: 6,
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Pytest', 'CI/CD'],
    prerequisites: ['Basic Python syntax', 'Relational database schema concepts'],
    instructions: 'Clone the starter repository, implement the required API routes, run pytest locally, and push to GitHub to trigger automated validation.',
    requirements: [
      'Stateless JWT authorization with Bearer token header verification',
      'Asynchronous session pooling with Neon PostgreSQL',
      'Pytest unit test suite achieving minimum 85% code coverage',
      'Multi-stage Dockerfile producing lean production container',
    ],
    acceptanceCriteria: [
      'FastAPI server starts on port 8000',
      '18/18 Unit tests pass in GitHub Actions',
      'Docker build exit code 0',
      'Ruff / Bandit security audit passed',
    ],
    submissionType: 'GITHUB',
    starterRepoUrl: 'https://github.com/candidate/careerai-backend-assignment-01',
    status: 'AVAILABLE',
    score: 89.0,
  },
  {
    id: 'asgn_swe_02',
    title: 'High-Concurrency Caching & Rate Limiting with Redis',
    description: 'Implement distributed rate-limiting and cache-aside patterns to handle 50,000+ RPS.',
    difficulty: 'Advanced',
    estimatedHours: 8,
    skills: ['Redis', 'Distributed Systems', 'System Design', 'FastAPI'],
    prerequisites: ['asgn_swe_01'],
    instructions: 'Integrate Redis sliding window rate limiter and cache invalidation listeners.',
    requirements: [
      'Sliding window log rate limiter middleware',
      'Cache-aside strategy with TTL and pub/sub cache invalidation',
    ],
    acceptanceCriteria: [
      'Zero cache stampede under 100 concurrent threads',
      'Rate limiter throttles excess requests with 429 status code',
    ],
    submissionType: 'GITHUB',
    starterRepoUrl: 'https://github.com/candidate/careerai-backend-assignment-02',
    status: 'LOCKED',
    score: 0.0,
  },
];

export async function GET(req: NextRequest) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${FASTAPI_URL}/api/v1/assignments`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Fallback gracefully to default assignments in serverless deployment
  }

  return NextResponse.json(DEFAULT_ASSIGNMENTS);
}
