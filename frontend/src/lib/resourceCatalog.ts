/**
 * Resource Catalog & Selection Engine for CareerAI Frontend.
 *
 * Integrates verified official learning resources from:
 * 1. W3Schools (https://www.w3schools.com/)
 * 2. GeeksforGeeks (https://www.geeksforgeeks.org/)
 *
 * Legal & Content Integrity:
 * - Stores metadata, topics, and real verified URLs ONLY.
 * - Does NOT scrape, copy, or store copyrighted tutorial or article content.
 * - Respects original sources with clear attribution and direct external links.
 * - Implements level-based calibration (BEGINNER, INTERMEDIATE, ADVANCED).
 * - Deduplicates resources and provides fallback when no verified URL exists.
 */

export interface VerifiedResource {
  id: string;
  provider: 'W3SCHOOLS' | 'GEEKSFORGEEKS';
  title: string;
  url: string;
  topic: string;
  skill: string;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  resourceType: 'TUTORIAL' | 'REFERENCE' | 'ROADMAP' | 'EXERCISE' | 'PRACTICE' | 'ARTICLE' | 'PROBLEM_SET';
  description: string;
  whyRecommended: string;
  isVerified: boolean;
}

export const RESOURCE_CATALOG: VerifiedResource[] = [
  // ==========================================
  // PYTHON
  // ==========================================
  {
    id: 'w3s-py-tut',
    provider: 'W3SCHOOLS',
    title: 'Python Tutorial: Syntax, Variables & Control Flow',
    url: 'https://www.w3schools.com/python/',
    topic: 'Python Basics',
    skill: 'Python',
    skillLevel: 'BEGINNER',
    resourceType: 'TUTORIAL',
    description: 'Foundational Python syntax, control structures, data structures, and functions with interactive sandbox examples.',
    whyRecommended: 'Structured beginner tutorial with hands-on exercises to build clean syntax habits.',
    isVerified: true,
  },
  {
    id: 'w3s-py-ex',
    provider: 'W3SCHOOLS',
    title: 'Python Interactive Coding Exercises',
    url: 'https://www.w3schools.com/python/python_exercises.asp',
    topic: 'Python Fundamentals',
    skill: 'Python',
    skillLevel: 'BEGINNER',
    resourceType: 'EXERCISE',
    description: 'Comprehensive set of interactive Python programming exercises covering lists, dictionaries, functions, and OOP.',
    whyRecommended: 'Quick validation drills to reinforce core language memory and syntax fluency.',
    isVerified: true,
  },
  {
    id: 'gfg-py-prog',
    provider: 'GEEKSFORGEEKS',
    title: 'Python Programming Language: Comprehensive Guide',
    url: 'https://www.geeksforgeeks.org/python-programming-language/',
    topic: 'Advanced Python',
    skill: 'Python',
    skillLevel: 'INTERMEDIATE',
    resourceType: 'REFERENCE',
    description: 'Deep dive into Python internals, memory model, decorators, generators, asynchronous programming, and standard library modules.',
    whyRecommended: 'In-depth conceptual guide for intermediate developers scaling beyond basics to idiomatic backend architecture.',
    isVerified: true,
  },

  // ==========================================
  // FASTAPI & WEB APIS
  // ==========================================
  {
    id: 'gfg-fastapi-tut',
    provider: 'GEEKSFORGEEKS',
    title: 'FastAPI Tutorial: Asynchronous REST Architecture',
    url: 'https://www.geeksforgeeks.org/fastapi-tutorial/',
    topic: 'FastAPI',
    skill: 'FastAPI',
    skillLevel: 'INTERMEDIATE',
    resourceType: 'TUTORIAL',
    description: 'Guide to building scalable asynchronous microservices, request validation with Pydantic, dependency injection, and OpenAPI schemas.',
    whyRecommended: 'Core framework tutorial tailored to modern production backend engineering practices.',
    isVerified: true,
  },
  {
    id: 'gfg-rest-api',
    provider: 'GEEKSFORGEEKS',
    title: 'REST API Architecture & HTTP Standards',
    url: 'https://www.geeksforgeeks.org/rest-api-introduction/',
    topic: 'API Design',
    skill: 'REST APIs',
    skillLevel: 'BEGINNER',
    resourceType: 'TUTORIAL',
    description: 'Principles of RESTful design, idempotency, HTTP verbs, status codes, and API contract design.',
    whyRecommended: 'Industry-standard design foundation for building clean, predictable API contracts.',
    isVerified: true,
  },

  // ==========================================
  // SQL, POSTGRESQL & DATABASES
  // ==========================================
  {
    id: 'w3s-sql-tut',
    provider: 'W3SCHOOLS',
    title: 'SQL Tutorial & Relational Database Querying',
    url: 'https://www.w3schools.com/sql/',
    topic: 'SQL',
    skill: 'SQL',
    skillLevel: 'BEGINNER',
    resourceType: 'TUTORIAL',
    description: 'Interactive guide to writing SELECT queries, JOINs, aggregations, subqueries, and table constraints.',
    whyRecommended: 'Gold standard reference for mastering relational query syntax and set operations.',
    isVerified: true,
  },
  {
    id: 'w3s-sql-ex',
    provider: 'W3SCHOOLS',
    title: 'SQL Interactive Practice Exercises',
    url: 'https://www.w3schools.com/sql/sql_exercises.asp',
    topic: 'SQL Practice',
    skill: 'SQL',
    skillLevel: 'BEGINNER',
    resourceType: 'EXERCISE',
    description: 'Hands-on SQL practice challenges covering complex multi-table joins and data manipulation.',
    whyRecommended: 'Immediate feedback exercises to build query fluency before tackling database migrations.',
    isVerified: true,
  },
  {
    id: 'w3s-pg-tut',
    provider: 'W3SCHOOLS',
    title: 'PostgreSQL Tutorial: Advanced Relational Engine',
    url: 'https://www.w3schools.com/postgresql/',
    topic: 'PostgreSQL',
    skill: 'PostgreSQL',
    skillLevel: 'INTERMEDIATE',
    resourceType: 'TUTORIAL',
    description: 'PostgreSQL-specific types, JSONB, indexing strategies, sequence management, and connection configuration.',
    whyRecommended: 'Practical guide to configuring and querying production-grade PostgreSQL databases.',
    isVerified: true,
  },
  {
    id: 'gfg-pg-tut',
    provider: 'GEEKSFORGEEKS',
    title: 'PostgreSQL Tutorial: Indexing, Transactions & Schemas',
    url: 'https://www.geeksforgeeks.org/postgresql-tutorial/',
    topic: 'Database Architecture',
    skill: 'PostgreSQL',
    skillLevel: 'ADVANCED',
    resourceType: 'REFERENCE',
    description: 'Deep dive into PostgreSQL query plans (EXPLAIN ANALYZE), B-Tree vs GIN indexes, MVCC, and transaction isolation levels.',
    whyRecommended: 'Vital for senior backend engineers optimizing slow queries and concurrency bottlenecks.',
    isVerified: true,
  },
  {
    id: 'gfg-dbms-tut',
    provider: 'GEEKSFORGEEKS',
    title: 'DBMS Architecture: ACID, Normalization & Storage',
    url: 'https://www.geeksforgeeks.org/dbms/',
    topic: 'Database Theory',
    skill: 'Database Design',
    skillLevel: 'INTERMEDIATE',
    resourceType: 'TUTORIAL',
    description: 'Relational database theory, Boyce-Codd normal forms, concurrency control, and deadlocks.',
    whyRecommended: 'Critical interview preparation and foundational design for backend engineers.',
    isVerified: true,
  },

  // ==========================================
  // DOCKER, CONTAINERS & CLOUD
  // ==========================================
  {
    id: 'gfg-docker-tut',
    provider: 'GEEKSFORGEEKS',
    title: 'Docker Tutorial: Containerization from Scratch to Compose',
    url: 'https://www.geeksforgeeks.org/docker-tutorial/',
    topic: 'Docker',
    skill: 'Docker',
    skillLevel: 'BEGINNER',
    resourceType: 'TUTORIAL',
    description: 'Container concepts, Dockerfile creation, multi-stage builds, volume management, and Docker Compose networks.',
    whyRecommended: 'End-to-end practical walkthrough for packaging and isolating backend microservices.',
    isVerified: true,
  },
  {
    id: 'gfg-devops-tut',
    provider: 'GEEKSFORGEEKS',
    title: 'DevOps Engineering & Automation Practices',
    url: 'https://www.geeksforgeeks.org/devops-tutorial/',
    topic: 'DevOps',
    skill: 'DevOps',
    skillLevel: 'INTERMEDIATE',
    resourceType: 'TUTORIAL',
    description: 'Overview of continuous delivery pipelines, infrastructure as code, monitoring, and staging workflows.',
    whyRecommended: 'Bridges the gap between raw code development and production operations.',
    isVerified: true,
  },
  {
    id: 'gfg-cicd-art',
    provider: 'GEEKSFORGEEKS',
    title: 'CI/CD Pipeline Architecture: Automation & Delivery',
    url: 'https://www.geeksforgeeks.org/what-is-cicd/',
    topic: 'CI/CD',
    skill: 'CI/CD',
    skillLevel: 'INTERMEDIATE',
    resourceType: 'ARTICLE',
    description: 'Architecting automated continuous integration and continuous deployment pipelines for zero-downtime releases.',
    whyRecommended: 'Key baseline guide for setting up GitHub Actions or GitLab CI test suites.',
    isVerified: true,
  },
  {
    id: 'gfg-cloud-tut',
    provider: 'GEEKSFORGEEKS',
    title: 'Cloud Computing Concepts & Service Models',
    url: 'https://www.geeksforgeeks.org/cloud-computing/',
    topic: 'Cloud Architecture',
    skill: 'Cloud Architecture',
    skillLevel: 'INTERMEDIATE',
    resourceType: 'TUTORIAL',
    description: 'IaaS, PaaS, and Serverless architectures, object storage, identity access management, and high availability.',
    whyRecommended: 'Core conceptual guide for candidates targeting cloud backend and DevOps roles.',
    isVerified: true,
  },

  // ==========================================
  // SYSTEM DESIGN & ARCHITECTURE
  // ==========================================
  {
    id: 'gfg-sys-design',
    provider: 'GEEKSFORGEEKS',
    title: 'System Design Tutorial: High-Scale Distributed Systems',
    url: 'https://www.geeksforgeeks.org/system-design-tutorial/',
    topic: 'System Design',
    skill: 'System Design',
    skillLevel: 'ADVANCED',
    resourceType: 'ROADMAP',
    description: 'Scalability patterns, load balancing, caching strategies, rate limiting, microservices, and event-driven architectures.',
    whyRecommended: 'Authoritative system design curriculum essential for Senior/Mid-level engineering interview clearance.',
    isVerified: true,
  },
  {
    id: 'gfg-microservices-art',
    provider: 'GEEKSFORGEEKS',
    title: 'Microservices Architecture: Design Patterns & Trade-offs',
    url: 'https://www.geeksforgeeks.org/microservices-architecture/',
    topic: 'Microservices',
    skill: 'Microservices',
    skillLevel: 'ADVANCED',
    resourceType: 'ARTICLE',
    description: 'Decomposition strategies, API gateways, service discovery, distributed tracing, and saga transaction patterns.',
    whyRecommended: 'Essential guidance for decomposing monolithic codebases into resilient services.',
    isVerified: true,
  },

  // ==========================================
  // DATA STRUCTURES & ALGORITHMS (DSA)
  // ==========================================
  {
    id: 'w3s-dsa-tut',
    provider: 'W3SCHOOLS',
    title: 'Data Structures & Algorithms Tutorial',
    url: 'https://www.w3schools.com/dsa/',
    topic: 'DSA Fundamentals',
    skill: 'Data Structures',
    skillLevel: 'BEGINNER',
    resourceType: 'TUTORIAL',
    description: 'Visual animations and step-by-step explanations of basic arrays, stacks, queues, linked lists, and sorting algorithms.',
    whyRecommended: 'Gentle visual introduction for candidates building computational problem-solving intuition.',
    isVerified: true,
  },
  {
    id: 'gfg-dsa-roadmap',
    provider: 'GEEKSFORGEEKS',
    title: 'DSA Roadmap: Learn Data Structures and Algorithms',
    url: 'https://www.geeksforgeeks.org/dsa-tutorial-learn-data-structures-and-algorithms/',
    topic: 'DSA Comprehensive',
    skill: 'Data Structures & Algorithms',
    skillLevel: 'INTERMEDIATE',
    resourceType: 'ROADMAP',
    description: 'Structured DSA curriculum covering time/space complexity, trees, graphs, dynamic programming, and greedy algorithms.',
    whyRecommended: 'The industry benchmark DSA roadmap for software engineering interview preparation.',
    isVerified: true,
  },
  {
    id: 'gfg-algo-fund',
    provider: 'GEEKSFORGEEKS',
    title: 'Fundamentals of Algorithms: Design & Complexity Analysis',
    url: 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/',
    topic: 'Algorithms',
    skill: 'Algorithms',
    skillLevel: 'ADVANCED',
    resourceType: 'REFERENCE',
    description: 'Algorithmic paradigms (divide & conquer, dynamic programming, backtracking) with asymptotic analysis and proofs.',
    whyRecommended: 'Rigorous theoretical and practical foundation for senior technical problem-solving rounds.',
    isVerified: true,
  },
  {
    id: 'gfg-dsa-practice',
    provider: 'GEEKSFORGEEKS',
    title: 'GeeksforGeeks Interactive Problem Solving & Coding Practice',
    url: 'https://www.geeksforgeeks.org/explore?page=1&sortBy=submissions',
    topic: 'Problem Solving',
    skill: 'Problem Solving',
    skillLevel: 'INTERMEDIATE',
    resourceType: 'PROBLEM_SET',
    description: 'Curated collection of company-tagged interview coding challenges with online compiler and test execution.',
    whyRecommended: 'Hands-on coding challenges to test edge cases, time limits, and space constraints.',
    isVerified: true,
  },

  // ==========================================
  // FRONTEND & JAVASCRIPT / TYPESCRIPT / REACT
  // ==========================================
  {
    id: 'w3s-html-tut',
    provider: 'W3SCHOOLS',
    title: 'HTML5 Tutorial: Semantic Web Structure',
    url: 'https://www.w3schools.com/html/',
    topic: 'HTML',
    skill: 'HTML5',
    skillLevel: 'BEGINNER',
    resourceType: 'TUTORIAL',
    description: 'Semantic HTML elements, web accessibility (a11y), forms, media integration, and DOM structure.',
    whyRecommended: 'The standard beginner guide for mastering accessible document structure.',
    isVerified: true,
  },
  {
    id: 'w3s-css-tut',
    provider: 'W3SCHOOLS',
    title: 'CSS3 Tutorial: Responsive Layouts & Styling',
    url: 'https://www.w3schools.com/css/',
    topic: 'CSS',
    skill: 'CSS3',
    skillLevel: 'BEGINNER',
    resourceType: 'TUTORIAL',
    description: 'Flexbox, CSS Grid, media queries, animations, and modern responsive design patterns.',
    whyRecommended: 'Comprehensive layout guide with live interactive editors for visual styling.',
    isVerified: true,
  },
  {
    id: 'w3s-js-tut',
    provider: 'W3SCHOOLS',
    title: 'JavaScript Tutorial: Modern ES6+ Foundations',
    url: 'https://www.w3schools.com/js/',
    topic: 'JavaScript',
    skill: 'JavaScript',
    skillLevel: 'BEGINNER',
    resourceType: 'TUTORIAL',
    description: 'Core JavaScript syntax, asynchronous promises, async/await, closures, and browser DOM manipulation.',
    whyRecommended: 'Essential starting point for client-side and full stack engineering.',
    isVerified: true,
  },
  {
    id: 'w3s-ts-tut',
    provider: 'W3SCHOOLS',
    title: 'TypeScript Tutorial: Static Type Systems',
    url: 'https://www.w3schools.com/typescript/',
    topic: 'TypeScript',
    skill: 'TypeScript',
    skillLevel: 'INTERMEDIATE',
    resourceType: 'TUTORIAL',
    description: 'Type annotations, interfaces, generics, utility types, union types, and tsconfig compiler options.',
    whyRecommended: 'Clear practical guide to writing robust, type-safe enterprise code.',
    isVerified: true,
  },
  {
    id: 'w3s-react-tut',
    provider: 'W3SCHOOLS',
    title: 'React Tutorial: Components, Hooks & State',
    url: 'https://www.w3schools.com/react/',
    topic: 'React',
    skill: 'React',
    skillLevel: 'BEGINNER',
    resourceType: 'TUTORIAL',
    description: 'Component composition, JSX, useState, useEffect, custom hooks, and React Router navigation.',
    whyRecommended: 'Accessible tutorial explaining component lifecycles and modern hook patterns.',
    isVerified: true,
  },
  {
    id: 'gfg-react-tut',
    provider: 'GEEKSFORGEEKS',
    title: 'ReactJS Architecture: Advanced Patterns & State Management',
    url: 'https://www.geeksforgeeks.org/react-tutorial/',
    topic: 'Advanced React',
    skill: 'React',
    skillLevel: 'INTERMEDIATE',
    resourceType: 'TUTORIAL',
    description: 'Context API, React Fiber reconciliation, performance memoization (useMemo/useCallback), and SSR.',
    whyRecommended: 'Deep technical overview covering internal rendering mechanics and production optimization.',
    isVerified: true,
  },

  // ==========================================
  // DATA SCIENCE & MACHINE LEARNING
  // ==========================================
  {
    id: 'w3s-numpy-tut',
    provider: 'W3SCHOOLS',
    title: 'NumPy Tutorial: N-Dimensional Array Computing',
    url: 'https://www.w3schools.com/python/numpy/',
    topic: 'NumPy',
    skill: 'NumPy',
    skillLevel: 'BEGINNER',
    resourceType: 'TUTORIAL',
    description: 'Array indexing, slicing, broadcasting, vectorization, and mathematical operations for numerical data.',
    whyRecommended: 'Fast, practical tutorial for vector math foundation required in data pipelines and ML.',
    isVerified: true,
  },
  {
    id: 'w3s-pandas-tut',
    provider: 'W3SCHOOLS',
    title: 'Pandas Tutorial: DataFrames & Data Manipulation',
    url: 'https://www.w3schools.com/python/pandas/',
    topic: 'Pandas',
    skill: 'Pandas',
    skillLevel: 'INTERMEDIATE',
    resourceType: 'TUTORIAL',
    description: 'DataFrame cleaning, filtering, grouping, merging, and time series transformations.',
    whyRecommended: 'Essential guide for feature engineering and data preprocessing workflows.',
    isVerified: true,
  },
  {
    id: 'w3s-ml-tut',
    provider: 'W3SCHOOLS',
    title: 'Machine Learning Tutorial: Core Supervised Models',
    url: 'https://www.w3schools.com/python/python_ml_getting_started.asp',
    topic: 'Machine Learning',
    skill: 'Machine Learning',
    skillLevel: 'BEGINNER',
    resourceType: 'TUTORIAL',
    description: 'Regression, classification, decision trees, train/test split, and confusion matrices using Python.',
    whyRecommended: 'Intuitive beginner tutorial with concrete code demonstrations of core algorithms.',
    isVerified: true,
  },
  {
    id: 'gfg-ml-tut',
    provider: 'GEEKSFORGEEKS',
    title: 'Machine Learning Guide: Theory, Math & Algorithms',
    url: 'https://www.geeksforgeeks.org/machine-learning/',
    topic: 'Machine Learning Deep Dive',
    skill: 'Machine Learning',
    skillLevel: 'INTERMEDIATE',
    resourceType: 'ROADMAP',
    description: 'Comprehensive ML mathematics, gradient descent, bias-variance tradeoff, regularization, and model evaluation.',
    whyRecommended: 'Thorough theoretical backing essential for data science and AI engineering interviews.',
    isVerified: true,
  },
  {
    id: 'gfg-dl-tut',
    provider: 'GEEKSFORGEEKS',
    title: 'Deep Learning Tutorial: Neural Networks & Architectures',
    url: 'https://www.geeksforgeeks.org/deep-learning-tutorial/',
    topic: 'Deep Learning',
    skill: 'Deep Learning',
    skillLevel: 'ADVANCED',
    resourceType: 'TUTORIAL',
    description: 'Perceptrons, backpropagation, CNNs, RNNs, and Transformer self-attention architectures.',
    whyRecommended: 'Detailed mathematical and architectural walk-through for advanced AI engineering tracks.',
    isVerified: true,
  },

  // ==========================================
  // TESTING, GIT & BEST PRACTICES
  // ==========================================
  {
    id: 'w3s-git-tut',
    provider: 'W3SCHOOLS',
    title: 'Git & GitHub Tutorial: Version Control Workflows',
    url: 'https://www.w3schools.com/git/',
    topic: 'Git',
    skill: 'Git',
    skillLevel: 'BEGINNER',
    resourceType: 'TUTORIAL',
    description: 'Git initialization, staging, commit workflows, branches, merge conflicts, and remote pushes to GitHub.',
    whyRecommended: 'Clear visual walkthrough of daily version control commands used in professional teams.',
    isVerified: true,
  },
  {
    id: 'gfg-testing-tut',
    provider: 'GEEKSFORGEEKS',
    title: 'Software Testing Fundamentals: Unit, Integration & E2E',
    url: 'https://www.geeksforgeeks.org/software-testing-basics/',
    topic: 'Testing',
    skill: 'Testing',
    skillLevel: 'INTERMEDIATE',
    resourceType: 'TUTORIAL',
    description: 'Testing pyramids, test-driven development (TDD), mocking, assertions, and test fixtures.',
    whyRecommended: 'Essential engineering rigor to ensure reliable CI/CD delivery and zero regressions.',
    isVerified: true,
  },
  {
    id: 'gfg-interview-prep',
    provider: 'GEEKSFORGEEKS',
    title: 'Software Developer Technical Interview Preparation',
    url: 'https://www.geeksforgeeks.org/interview-preparation-for-software-developer/',
    topic: 'Interview Prep',
    skill: 'Technical Interviewing',
    skillLevel: 'ADVANCED',
    resourceType: 'PRACTICE',
    description: 'Company-tested technical interview questions, behavioral rubrics, system design walkthroughs, and coding rounds.',
    whyRecommended: 'Direct industry preparation for final candidate interview clearing.',
    isVerified: true,
  },
];

export class ResourceSelectionEngine {
  public static findResourcesForSkill(
    skillName: string,
    currentLevel: string = 'BEGINNER',
    targetLevel: string = 'INTERMEDIATE',
    limit: number = 2
  ): VerifiedResource[] {
    const skillLower = skillName.toLowerCase().trim();
    const candidates: VerifiedResource[] = [];

    // 1. Direct Skill Name Match
    for (const res of RESOURCE_CATALOG) {
      const resSkillLower = res.skill.toLowerCase();
      if (resSkillLower === skillLower || skillLower.includes(resSkillLower) || resSkillLower.includes(skillLower)) {
        candidates.push(res);
      }
    }

    // 2. Fuzzy Topic / Synonyms
    if (candidates.length === 0) {
      const synonyms: Record<string, string[]> = {
        fastapi: ['python', 'rest apis', 'rest api'],
        django: ['python', 'backend'],
        postgresql: ['sql', 'database design'],
        docker: ['devops', 'cloud architecture'],
        kubernetes: ['docker', 'devops', 'cloud architecture'],
        'react.js': ['react', 'javascript'],
        'next.js': ['react', 'typescript'],
        algorithms: ['data structures & algorithms', 'problem solving'],
        'data structures': ['data structures', 'data structures & algorithms'],
        'unit testing': ['testing'],
        pytest: ['testing', 'python'],
        'ci/cd': ['devops', 'git'],
        'github actions': ['ci/cd', 'devops'],
      };

      const mapped = synonyms[skillLower] || [];
      for (const res of RESOURCE_CATALOG) {
        const resSkill = res.skill.toLowerCase();
        const resTopic = res.topic.toLowerCase();
        if (mapped.some((syn) => resSkill.includes(syn) || resTopic.includes(syn))) {
          candidates.push(res);
        }
      }
    }

    // If no verified match found, strictly return empty array
    if (candidates.length === 0) {
      return [];
    }

    // Sort by level calibration
    const scoreCandidate = (res: VerifiedResource) => {
      let score = 0;
      if (currentLevel.toUpperCase() === 'BEGINNER') {
        if (res.provider === 'W3SCHOOLS') score += 15;
        if (res.skillLevel === 'BEGINNER') score += 10;
        if (['TUTORIAL', 'EXERCISE'].includes(res.resourceType)) score += 5;
      } else {
        if (res.provider === 'GEEKSFORGEEKS') score += 15;
        if (['INTERMEDIATE', 'ADVANCED'].includes(res.skillLevel)) score += 10;
        if (['ROADMAP', 'REFERENCE', 'PROBLEM_SET'].includes(res.resourceType)) score += 5;
      }
      return score;
    };

    candidates.sort((a, b) => scoreCandidate(b) - scoreCandidate(a));

    // Deduplicate
    const seen = new Set<string>();
    const deduped: VerifiedResource[] = [];
    for (const c of candidates) {
      if (!seen.has(c.url)) {
        seen.add(c.url);
        deduped.push(c);
        if (deduped.length >= limit) break;
      }
    }

    return deduped;
  }

  public static getFallbackMessage(): string {
    return 'No verified learning resource is currently available for this topic.';
  }
}
