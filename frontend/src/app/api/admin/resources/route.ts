import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export interface LearningResource {
  id: string;
  title: string;
  url: string;
  type: 'Documentation' | 'Course' | 'Tutorial' | 'Book' | 'Certification';
  provider: string;
  skill: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isFree: boolean;
  rating: number;
  description: string;
  createdAt: string;
}

// Global in-memory resource catalog
let resourcesDb: LearningResource[] = [
  {
    id: 'res-py-1',
    title: 'Official Python 3 Documentation & Language Reference',
    url: 'https://docs.python.org/3/tutorial/',
    type: 'Documentation',
    provider: 'Python Software Foundation',
    skill: 'Python',
    difficulty: 'Beginner',
    isFree: true,
    rating: 4.9,
    description: 'Comprehensive language syntax, standard library, and OOP best practices.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-py-2',
    title: 'Real Python: Advanced Patterns & Clean Architecture',
    url: 'https://realpython.com/',
    type: 'Tutorial',
    provider: 'Real Python',
    skill: 'Python',
    difficulty: 'Intermediate',
    isFree: false,
    rating: 4.8,
    description: 'Practical guides on concurrency, type hints, generators, and testing.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-js-1',
    title: 'MDN Web Docs: Modern JavaScript Handbook',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    type: 'Documentation',
    provider: 'Mozilla MDN',
    skill: 'JavaScript',
    difficulty: 'Beginner',
    isFree: true,
    rating: 4.95,
    description: 'The gold standard web documentation covering ES2024, async/await, and DOM APIs.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-ts-1',
    title: 'TypeScript Official Handbook & Type System Deep Dive',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    type: 'Documentation',
    provider: 'Microsoft',
    skill: 'TypeScript',
    difficulty: 'Intermediate',
    isFree: true,
    rating: 4.9,
    description: 'Generics, conditional types, utility types, and strict mode compiler configurations.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-rc-1',
    title: 'React.dev: Learn React & Component Architecture',
    url: 'https://react.dev/learn',
    type: 'Documentation',
    provider: 'Meta Open Source',
    skill: 'React',
    difficulty: 'Intermediate',
    isFree: true,
    rating: 4.9,
    description: 'Modern React hooks, server components, state synchronization, and performance optimization.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-fa-1',
    title: 'FastAPI High-Performance Async Python Microservices',
    url: 'https://fastapi.tiangolo.com/tutorial/',
    type: 'Documentation',
    provider: 'Tiangolo',
    skill: 'FastAPI',
    difficulty: 'Intermediate',
    isFree: true,
    rating: 4.92,
    description: 'Asynchronous route handlers, Pydantic validation, dependency injection, and OpenAPI schemas.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-dk-1',
    title: 'Docker Guides: Containerization & Multi-Stage Builds',
    url: 'https://docs.docker.com/get-started/',
    type: 'Documentation',
    provider: 'Docker Inc.',
    skill: 'Docker',
    difficulty: 'Beginner',
    isFree: true,
    rating: 4.85,
    description: 'Container architecture, Dockerfiles, caching strategies, and Compose orchestration.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-k8s-1',
    title: 'Kubernetes Up & Running: Enterprise Cluster Orchestration',
    url: 'https://kubernetes.io/docs/tutorials/',
    type: 'Course',
    provider: 'Cloud Native Computing Foundation (CNCF)',
    skill: 'Kubernetes',
    difficulty: 'Advanced',
    isFree: true,
    rating: 4.9,
    description: 'Pods, Deployments, StatefulSets, Ingress controllers, and zero-downtime rolling upgrades.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-ml-1',
    title: 'Google Machine Learning Crash Course with TensorFlow',
    url: 'https://developers.google.com/machine-learning/crash-course',
    type: 'Course',
    provider: 'Google AI',
    skill: 'Machine Learning',
    difficulty: 'Intermediate',
    isFree: true,
    rating: 4.88,
    description: 'Gradient descent, loss functions, neural network regularization, and practical hyperparameter tuning.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-dl-1',
    title: 'PyTorch Deep Learning Zero to Mastery',
    url: 'https://pytorch.org/tutorials/',
    type: 'Tutorial',
    provider: 'PyTorch Foundation',
    skill: 'Deep Learning',
    difficulty: 'Advanced',
    isFree: true,
    rating: 4.94,
    description: 'Tensors, autograd, convolution, transformers, and GPU distributed training pipelines.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-sql-1',
    title: 'PostgreSQL 16 Manual & Query Execution Plans',
    url: 'https://www.postgresql.org/docs/current/',
    type: 'Documentation',
    provider: 'PostgreSQL Global Development Group',
    skill: 'PostgreSQL',
    difficulty: 'Intermediate',
    isFree: true,
    rating: 4.87,
    description: 'B-tree indexing, EXPLAIN ANALYZE execution inspection, transactions, and ACID constraints.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-sec-1',
    title: 'OWASP Top 10 Enterprise Web Application Security Risks',
    url: 'https://owasp.org/www-project-top-ten/',
    type: 'Book',
    provider: 'OWASP Foundation',
    skill: 'Cybersecurity',
    difficulty: 'Advanced',
    isFree: true,
    rating: 4.96,
    description: 'Injection prevention, broken authentication, cryptographic failures, and security misconfigurations.',
    createdAt: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');

    const searchParams = req.nextUrl.searchParams;
    const query = (searchParams.get('q') || searchParams.get('search') || '').toLowerCase().trim();
    const typeFilter = searchParams.get('type') || 'all';
    const skillFilter = searchParams.get('skill') || 'all';

    let filtered = [...resourcesDb];

    if (query) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.skill.toLowerCase().includes(query) ||
          r.provider.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((r) => r.type.toLowerCase() === typeFilter.toLowerCase());
    }

    if (skillFilter !== 'all') {
      filtered = filtered.filter((r) => r.skill.toLowerCase() === skillFilter.toLowerCase());
    }

    const stats = {
      total: resourcesDb.length,
      documentation: resourcesDb.filter((r) => r.type === 'Documentation').length,
      courses: resourcesDb.filter((r) => r.type === 'Course').length,
      tutorials: resourcesDb.filter((r) => r.type === 'Tutorial').length,
      freePercentage: Math.round(
        (resourcesDb.filter((r) => r.isFree).length / (resourcesDb.length || 1)) * 100
      ),
    };

    return NextResponse.json({ resources: filtered, stats });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED' || err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });
    }
    console.error('Resources API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve resources.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');

    const body = await req.json();
    const { title, url, type, provider, skill, difficulty, isFree, description } = body;

    if (!title || !url || !provider || !skill) {
      return NextResponse.json(
        { error: 'Title, URL, provider, and skill are required.' },
        { status: 400 }
      );
    }

    const newResource: LearningResource = {
      id: `res-custom-${Date.now()}`,
      title: title.trim(),
      url: url.trim(),
      type: type || 'Documentation',
      provider: provider.trim(),
      skill: skill.trim(),
      difficulty: difficulty || 'Intermediate',
      isFree: Boolean(isFree ?? true),
      rating: 4.9,
      description: description?.trim() || 'Curated learning resource for career skill progression.',
      createdAt: new Date().toISOString(),
    };

    resourcesDb.unshift(newResource);

    return NextResponse.json({ success: true, resource: newResource });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED' || err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });
    }
    console.error('Create resource API error:', error);
    return NextResponse.json({ error: 'Failed to create resource.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required.' }, { status: 400 });
    }

    resourcesDb = resourcesDb.filter((r) => r.id !== id);

    return NextResponse.json({ success: true, message: 'Resource removed.' });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED' || err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });
    }
    console.error('Delete resource API error:', error);
    return NextResponse.json({ error: 'Failed to delete resource.' }, { status: 500 });
  }
}
