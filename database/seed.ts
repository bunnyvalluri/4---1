import { PrismaClient, SkillCategory, AptitudeCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  // 1. Seed Users (Admin and Demo User)
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123456', salt);
  const demoPassword = await bcrypt.hash('Password@123', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@careerai.dev' },
    update: { passwordHash: adminPassword, role: 'ADMIN' },
    create: {
      name: 'System Administrator',
      email: 'admin@careerai.dev',
      passwordHash: adminPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'alex@example.com' },
    update: { passwordHash: demoPassword },
    create: {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      passwordHash: demoPassword,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      profile: {
        create: {
          phone: '+1 (555) 349-2810',
          location: 'San Francisco, CA / Hybrid',
          bio: 'Final-year Computer Science student passionate about distributed systems, cloud computing, and applied Machine Learning.',
          degree: 'Bachelor of Technology (B.Tech)',
          branch: 'Computer Science and Engineering',
          college: 'University Institute of Technology',
          gradYear: 2026,
          cgpa: 8.7,
          interests: ['Artificial Intelligence', 'Cloud Native Systems', 'Open Source', 'Microservices'],
          preferredIndustries: ['Enterprise Software / SaaS', 'AI & Data Tech', 'FinTech'],
          preferredRoles: ['Full Stack Developer', 'AI/ML Engineer', 'Backend Engineer'],
          preferredLocations: ['San Francisco', 'Remote', 'Seattle', 'New York'],
          careerGoals: 'To build high-scale cloud-native distributed backends and deploy machine learning models to production.',
          workExperienceYears: 1.0,
          githubUrl: 'https://github.com/alexjohnson-dev',
          linkedinUrl: 'https://linkedin.com/in/alexjohnson-demo',
        },
      },
    },
  });

  console.log(`✅ Seeded users: Admin (${admin.email}) and Demo (${demoUser.email})`);

  // 2. Comprehensive Skills Catalog (100+ skills)
  const skillsData: { name: string; category: SkillCategory; description: string }[] = [
    // Programming Languages & Core Tech
    { name: 'JavaScript', category: SkillCategory.TECHNICAL, description: 'ECMAScript language for web & server applications' },
    { name: 'TypeScript', category: SkillCategory.TECHNICAL, description: 'Typed superset of JavaScript providing compile-time type safety' },
    { name: 'Python', category: SkillCategory.TECHNICAL, description: 'High-level versatile language for data science, AI, and backend' },
    { name: 'Java', category: SkillCategory.TECHNICAL, description: 'Object-oriented language for enterprise architectures and Android' },
    { name: 'C++', category: SkillCategory.TECHNICAL, description: 'High-performance systems programming language' },
    { name: 'Go (Golang)', category: SkillCategory.TECHNICAL, description: 'Fast, concurrent systems and cloud infrastructure language' },
    { name: 'Rust', category: SkillCategory.TECHNICAL, description: 'Memory-safe systems programming language with zero-cost abstractions' },
    { name: 'C#', category: SkillCategory.TECHNICAL, description: 'Modern object-oriented language for .NET and gaming' },
    { name: 'PHP', category: SkillCategory.TECHNICAL, description: 'Server scripting language for web development' },
    { name: 'Ruby', category: SkillCategory.TECHNICAL, description: 'Dynamic, object-oriented language known for Rails framework' },
    { name: 'SQL', category: SkillCategory.TECHNICAL, description: 'Structured Query Language for relational database querying' },
    { name: 'HTML5 & CSS3', category: SkillCategory.TECHNICAL, description: 'Core semantic web standards and styling specifications' },
    { name: 'Bash / Shell Scripting', category: SkillCategory.TECHNICAL, description: 'CLI scripting for automation and UNIX system administration' },

    // Frontend Frameworks & Libraries
    { name: 'React.js', category: SkillCategory.FRAMEWORK, description: 'Component-based UI library by Meta' },
    { name: 'Next.js', category: SkillCategory.FRAMEWORK, description: 'React production framework with SSR and App Router' },
    { name: 'Vue.js', category: SkillCategory.FRAMEWORK, description: 'Progressive JavaScript framework for building user interfaces' },
    { name: 'Angular', category: SkillCategory.FRAMEWORK, description: 'Google platform for scalable enterprise web applications' },
    { name: 'Tailwind CSS', category: SkillCategory.FRAMEWORK, description: 'Utility-first modern CSS framework' },
    { name: 'Redux / Zustand', category: SkillCategory.FRAMEWORK, description: 'Predictable state management libraries for web apps' },
    { name: 'Svelte', category: SkillCategory.FRAMEWORK, description: 'Cybernetically enhanced reactive web compiler' },

    // Backend Frameworks & Runtimes
    { name: 'Node.js', category: SkillCategory.FRAMEWORK, description: 'Chrome V8 asynchronous event-driven JavaScript runtime' },
    { name: 'Express.js', category: SkillCategory.FRAMEWORK, description: 'Minimalist web framework for Node.js' },
    { name: 'FastAPI', category: SkillCategory.FRAMEWORK, description: 'Modern high-performance Python ASGI web framework' },
    { name: 'Django', category: SkillCategory.FRAMEWORK, description: 'Batteries-included high-level Python web framework' },
    { name: 'Spring Boot', category: SkillCategory.FRAMEWORK, description: 'Production-ready enterprise Java framework' },
    { name: 'ASP.NET Core', category: SkillCategory.FRAMEWORK, description: 'Cross-platform high-performance .NET framework' },
    { name: 'GraphQL', category: SkillCategory.FRAMEWORK, description: 'Query language for declarative API interactions' },
    { name: 'gRPC & Protocol Buffers', category: SkillCategory.FRAMEWORK, description: 'High-performance microservice RPC framework' },

    // Databases & Caching
    { name: 'PostgreSQL', category: SkillCategory.DATABASE, description: 'Advanced open-source object-relational database' },
    { name: 'MySQL', category: SkillCategory.DATABASE, description: 'Widely used open-source relational database system' },
    { name: 'MongoDB', category: SkillCategory.DATABASE, description: 'Document-oriented NoSQL database system' },
    { name: 'Redis', category: SkillCategory.DATABASE, description: 'In-memory key-value data store for caching and pub/sub' },
    { name: 'Elasticsearch', category: SkillCategory.DATABASE, description: 'Distributed search and analytics engine' },
    { name: 'Prisma ORM', category: SkillCategory.DATABASE, description: 'Next-generation type-safe Node.js and TypeScript ORM' },
    { name: 'Apache Cassandra', category: SkillCategory.DATABASE, description: 'Distributed wide-column NoSQL store for high throughput' },

    // AI, ML & Data Science
    { name: 'Machine Learning', category: SkillCategory.TECHNICAL, description: 'Supervised, unsupervised, and reinforcement learning paradigms' },
    { name: 'Deep Learning', category: SkillCategory.TECHNICAL, description: 'Multi-layer neural networks, CNNs, RNNs, and Transformers' },
    { name: 'PyTorch', category: SkillCategory.FRAMEWORK, description: 'Open-source deep learning framework based on Torch' },
    { name: 'TensorFlow / Keras', category: SkillCategory.FRAMEWORK, description: 'End-to-end machine learning platform by Google' },
    { name: 'scikit-learn', category: SkillCategory.FRAMEWORK, description: 'Predictive data analysis and traditional ML in Python' },
    { name: 'Pandas & NumPy', category: SkillCategory.FRAMEWORK, description: 'Data structures, multidimensional arrays, and numerical computing' },
    { name: 'Natural Language Processing (NLP)', category: SkillCategory.TECHNICAL, description: 'Text processing, LLMs, tokenization, and sentiment analysis' },
    { name: 'Computer Vision', category: SkillCategory.TECHNICAL, description: 'Image recognition, object detection (YOLO), and OpenCV' },
    { name: 'Large Language Models (LLMs) & RAG', category: SkillCategory.TECHNICAL, description: 'Prompt engineering, vector embeddings, LangChain, and RAG' },
    { name: 'MLOps & Model Deployment', category: SkillCategory.TECHNICAL, description: 'CI/CD for ML, MLflow, model serving, and feature stores' },

    // Cloud, DevOps & Infrastructure
    { name: 'Docker', category: SkillCategory.TOOL, description: 'Containerization platform for isolated application packaging' },
    { name: 'Kubernetes', category: SkillCategory.CLOUD, description: 'Production-grade container orchestration system' },
    { name: 'AWS (Amazon Web Services)', category: SkillCategory.CLOUD, description: 'EC2, S3, Lambda, ECS, RDS, and cloud architectures' },
    { name: 'Microsoft Azure', category: SkillCategory.CLOUD, description: 'Enterprise cloud computing platform and services' },
    { name: 'Google Cloud Platform (GCP)', category: SkillCategory.CLOUD, description: 'Cloud computing and AI infrastructure suite' },
    { name: 'Terraform / IaC', category: SkillCategory.TOOL, description: 'Infrastructure as code provisioning across clouds' },
    { name: 'CI/CD Pipelines (GitHub Actions)', category: SkillCategory.TOOL, description: 'Automated testing, building, and deployment workflows' },
    { name: 'Linux Administration', category: SkillCategory.TECHNICAL, description: 'Server administration, permissions, networking, systemd' },

    // Cybersecurity
    { name: 'Network Security', category: SkillCategory.TECHNICAL, description: 'Firewalls, VPNs, IDS/IPS, and packet inspection (Wireshark)' },
    { name: 'Ethical Hacking & PenTesting', category: SkillCategory.TECHNICAL, description: 'Vulnerability assessment, Metasploit, Burp Suite, OWASP' },
    { name: 'Cryptography', category: SkillCategory.TECHNICAL, description: 'Symmetric/asymmetric encryption, hashing, TLS/SSL, PKI' },
    { name: 'Security Information & Event Management (SIEM)', category: SkillCategory.TOOL, description: 'Splunk, ELK security analytics, incident response' },
    { name: 'Identity & Access Management (IAM)', category: SkillCategory.TECHNICAL, description: 'OAuth2, OpenID Connect, SAML, zero-trust architecture' },

    // Mobile & Cross Platform
    { name: 'Flutter', category: SkillCategory.FRAMEWORK, description: 'Google multi-platform UI toolkit using Dart' },
    { name: 'React Native', category: SkillCategory.FRAMEWORK, description: 'Cross-platform mobile apps using React and JavaScript' },
    { name: 'Swift / iOS', category: SkillCategory.TECHNICAL, description: 'Native Apple iOS app development with Swift & SwiftUI' },
    { name: 'Kotlin / Android', category: SkillCategory.TECHNICAL, description: 'Modern concise language for native Android apps' },

    // Design & Product
    { name: 'Figma', category: SkillCategory.TOOL, description: 'Collaborative cloud interface design and wireframing tool' },
    { name: 'User Research & Usability Testing', category: SkillCategory.SOFT, description: 'Qualitative user interviews, personas, and heuristic reviews' },
    { name: 'Design Systems & Wireframing', category: SkillCategory.TECHNICAL, description: 'Component libraries, design tokens, responsive typography' },
    { name: 'Agile & Scrum Methodologies', category: SkillCategory.SOFT, description: 'Sprint planning, user stories, retrospectives, and Jira' },
    { name: 'Product Roadmapping & Metrics', category: SkillCategory.TECHNICAL, description: 'KPI tracking, North Star metrics, A/B testing, OKRs' },

    // Quality Assurance & Testing
    { name: 'Automated Testing (Jest / Vitest)', category: SkillCategory.TOOL, description: 'Unit testing, snapshot testing, mock assertions' },
    { name: 'End-to-End Testing (Playwright / Cypress)', category: SkillCategory.TOOL, description: 'Browser automation, regression tests, user journeys' },
    { name: 'API Testing (Postman / REST Assured)', category: SkillCategory.TOOL, description: 'Contract testing, load testing, status validation' },

    // Blockchain & Web3
    { name: 'Solidity', category: SkillCategory.TECHNICAL, description: 'Smart contract programming for Ethereum Virtual Machine' },
    { name: 'Web3.js / Ethers.js', category: SkillCategory.FRAMEWORK, description: 'Client-side blockchain interaction libraries' },
    { name: 'Smart Contract Auditing', category: SkillCategory.TECHNICAL, description: 'Reentrancy, gas optimization, formal verification' },

    // Essential Soft Skills
    { name: 'Analytical Thinking', category: SkillCategory.SOFT, description: 'Breaking down complex problems into verifiable components' },
    { name: 'Problem Solving', category: SkillCategory.SOFT, description: 'Algorithm design, debugging mindset, creative synthesis' },
    { name: 'Communication & Presentation', category: SkillCategory.SOFT, description: 'Articulating technical concepts to diverse stakeholders' },
    { name: 'Team Collaboration', category: SkillCategory.SOFT, description: 'Cross-functional teamwork, code reviews, empathetic pair programming' },
    { name: 'Time Management', category: SkillCategory.SOFT, description: 'Prioritization, delivery estimation, milestone execution' },
    { name: 'Continuous Learning', category: SkillCategory.SOFT, description: 'Rapid adaptation to emerging technologies and paradigms' },
  ];

  const skillMap = new Map<string, string>();
  for (const s of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      update: { category: s.category, description: s.description },
      create: s,
    });
    skillMap.set(s.name, skill.id);
  }
  console.log(`✅ Seeded ${skillsData.length} skills into catalog.`);

  // Attach sample skills to demo user
  const userSkillNames = [
    { name: 'JavaScript', prof: 4 },
    { name: 'TypeScript', prof: 3 },
    { name: 'Python', prof: 4 },
    { name: 'React.js', prof: 4 },
    { name: 'Node.js', prof: 3 },
    { name: 'SQL', prof: 4 },
    { name: 'PostgreSQL', prof: 3 },
    { name: 'Docker', prof: 2 },
    { name: 'Machine Learning', prof: 3 },
    { name: 'Pandas & NumPy', prof: 3 },
    { name: 'Problem Solving', prof: 4 },
    { name: 'Team Collaboration', prof: 4 },
  ];

  for (const us of userSkillNames) {
    const sId = skillMap.get(us.name);
    if (sId) {
      await prisma.userSkill.upsert({
        where: { userId_skillId: { userId: demoUser.id, skillId: sId } },
        update: { proficiency: us.prof },
        create: {
          userId: demoUser.id,
          skillId: sId,
          proficiency: us.prof,
          verified: true,
        },
      });
    }
  }

  // 3. 20+ Real Tech Careers with Benchmarks & Skills
  const careersData = [
    {
      title: 'Full Stack Developer',
      slug: 'full-stack-developer',
      category: 'Software Engineering',
      description: 'Designs and implements both client-side interactive UIs and scalable server-side architectures, databases, and APIs.',
      salaryRange: '$85,000 - $145,000 / yr',
      demandLevel: 'Very High',
      experienceLevel: 'Entry to Senior',
      overview: 'Full Stack Developers bridge user experience with backend architecture. They work with modern web frameworks, SQL/NoSQL databases, RESTful & GraphQL APIs, and cloud deployments.',
      educationReqs: 'B.Tech/BS in Computer Science, Software Engineering, IT, or equivalent demonstrable project experience.',
      aptitudeReqs: { LOGICAL: 75, QUANTITATIVE: 65, VERBAL: 65, ANALYTICAL: 80, PROBLEM_SOLVING: 85 },
      commonJobTitles: ['Full Stack Software Engineer', 'Web Applications Engineer', 'MERN / Next.js Developer'],
      requiredSkills: ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'SQL', 'PostgreSQL', 'HTML5 & CSS3', 'Problem Solving'],
      preferredSkills: ['Next.js', 'Docker', 'Redis', 'CI/CD Pipelines (GitHub Actions)', 'Tailwind CSS'],
    },
    {
      title: 'AI / Machine Learning Engineer',
      slug: 'ai-ml-engineer',
      category: 'Artificial Intelligence & Data',
      description: 'Researches, builds, and deploys scalable machine learning algorithms, deep neural networks, and LLM-powered pipelines.',
      salaryRange: '$110,000 - $185,000 / yr',
      demandLevel: 'Extreme',
      experienceLevel: 'Entry to Staff',
      overview: 'AI/ML Engineers develop state-of-the-art predictive models, NLP applications, and computer vision systems. They turn mathematical algorithms into resilient production services with MLOps.',
      educationReqs: 'BS/MS in Computer Science, Data Science, Artificial Intelligence, Mathematics, or related quantitative field.',
      aptitudeReqs: { LOGICAL: 85, QUANTITATIVE: 85, VERBAL: 65, ANALYTICAL: 90, PROBLEM_SOLVING: 90 },
      commonJobTitles: ['ML Engineer', 'Applied AI Scientist', 'Deep Learning Specialist', 'LLM Engineer'],
      requiredSkills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Pandas & NumPy', 'Problem Solving', 'Analytical Thinking'],
      preferredSkills: ['TensorFlow / Keras', 'Large Language Models (LLMs) & RAG', 'MLOps & Model Deployment', 'Docker', 'FastAPI'],
    },
    {
      title: 'Frontend Developer',
      slug: 'frontend-developer',
      category: 'Software Engineering',
      description: 'Crafts responsive, accessible, high-performance, and visually captivating web interfaces for modern SaaS platforms.',
      salaryRange: '$75,000 - $130,000 / yr',
      demandLevel: 'High',
      experienceLevel: 'Entry to Senior',
      overview: 'Frontend Developers specialize in the browser environment, user interactions, animations, state management, and web vitals performance optimization.',
      educationReqs: 'Degree in Computer Science, Design & Technology, or self-directed portfolio.',
      aptitudeReqs: { LOGICAL: 70, QUANTITATIVE: 55, VERBAL: 70, ANALYTICAL: 75, PROBLEM_SOLVING: 75 },
      commonJobTitles: ['Frontend Engineer', 'UI Software Developer', 'React Developer'],
      requiredSkills: ['JavaScript', 'TypeScript', 'React.js', 'HTML5 & CSS3', 'Tailwind CSS', 'Problem Solving'],
      preferredSkills: ['Next.js', 'Redux / Zustand', 'Automated Testing (Jest / Vitest)', 'Figma'],
    },
    {
      title: 'Backend Developer',
      slug: 'backend-developer',
      category: 'Software Engineering',
      description: 'Architects robust microservices, database schemas, authentication layers, caching strategies, and mission-critical APIs.',
      salaryRange: '$90,000 - $150,000 / yr',
      demandLevel: 'Very High',
      experienceLevel: 'Entry to Senior',
      overview: 'Backend Engineers build the engine behind modern applications, ensuring maximum uptime, sub-millisecond response times, and bulletproof security.',
      educationReqs: 'B.Tech/BS in Computer Science, Information Systems, or related engineering discipline.',
      aptitudeReqs: { LOGICAL: 80, QUANTITATIVE: 70, VERBAL: 60, ANALYTICAL: 85, PROBLEM_SOLVING: 85 },
      commonJobTitles: ['Backend Engineer', 'API Developer', 'Systems Architect', 'Node.js / Go Engineer'],
      requiredSkills: ['Node.js', 'Python', 'SQL', 'PostgreSQL', 'Redis', 'Problem Solving', 'Analytical Thinking'],
      preferredSkills: ['Go (Golang)', 'FastAPI', 'Docker', 'gRPC & Protocol Buffers', 'Linux Administration'],
    },
    {
      title: 'Data Scientist',
      slug: 'data-scientist',
      category: 'Artificial Intelligence & Data',
      description: 'Unearths actionable business intelligence, discovers statistical patterns, and formulates predictive modeling experiments.',
      salaryRange: '$100,000 - $160,000 / yr',
      demandLevel: 'High',
      experienceLevel: 'Entry to Lead',
      overview: 'Data Scientists combine domain expertise, advanced statistical inference, hypothesis testing, and machine learning to inform executive strategy.',
      educationReqs: 'BS/MS in Statistics, Mathematics, Computer Science, Economics, or Data Analytics.',
      aptitudeReqs: { LOGICAL: 80, QUANTITATIVE: 85, VERBAL: 70, ANALYTICAL: 90, PROBLEM_SOLVING: 85 },
      commonJobTitles: ['Data Scientist', 'Statistical Modeling Analyst', 'Quantitative Researcher'],
      requiredSkills: ['Python', 'SQL', 'Pandas & NumPy', 'Machine Learning', 'scikit-learn', 'Analytical Thinking'],
      preferredSkills: ['Deep Learning', 'Natural Language Processing (NLP)', 'Communication & Presentation'],
    },
    {
      title: 'Data Analyst',
      slug: 'data-analyst',
      category: 'Artificial Intelligence & Data',
      description: 'Transforms raw operational datasets into insightful dashboards, reports, and clear growth metrics.',
      salaryRange: '$65,000 - $105,000 / yr',
      demandLevel: 'High',
      experienceLevel: 'Entry to Mid',
      overview: 'Data Analysts work directly with cross-functional business units to query data warehouses, track KPIs, and create automated visualization dashboards.',
      educationReqs: 'Bachelor degree in Business Analytics, Computer Science, Finance, or Mathematics.',
      aptitudeReqs: { LOGICAL: 70, QUANTITATIVE: 75, VERBAL: 70, ANALYTICAL: 80, PROBLEM_SOLVING: 70 },
      commonJobTitles: ['Business Intelligence Analyst', 'Data Insights Specialist', 'Analytics Consultant'],
      requiredSkills: ['SQL', 'Python', 'Pandas & NumPy', 'Analytical Thinking', 'Communication & Presentation'],
      preferredSkills: ['PostgreSQL', 'Product Roadmapping & Metrics'],
    },
    {
      title: 'Cloud & DevOps Engineer',
      slug: 'cloud-devops-engineer',
      category: 'Cloud & Infrastructure',
      description: 'Automates cloud infrastructure, manages container orchestration, ensures zero-downtime CI/CD pipelines, and scales clusters.',
      salaryRange: '$95,000 - $160,000 / yr',
      demandLevel: 'Very High',
      experienceLevel: 'Entry to Principal',
      overview: 'Cloud & DevOps Engineers automate the lifecycle of software delivery, treating infrastructure as code and ensuring rock-solid site reliability (SRE).',
      educationReqs: 'B.Tech/BS in Computer Science, IT, or equivalent cloud certifications (AWS/Azure/CKA).',
      aptitudeReqs: { LOGICAL: 80, QUANTITATIVE: 65, VERBAL: 65, ANALYTICAL: 85, PROBLEM_SOLVING: 85 },
      commonJobTitles: ['Site Reliability Engineer (SRE)', 'Platform Engineer', 'Cloud Infrastructure Engineer'],
      requiredSkills: ['Docker', 'Kubernetes', 'AWS (Amazon Web Services)', 'Linux Administration', 'CI/CD Pipelines (GitHub Actions)', 'Problem Solving'],
      preferredSkills: ['Terraform / IaC', 'Go (Golang)', 'Bash / Shell Scripting', 'Python'],
    },
    {
      title: 'Cybersecurity Analyst',
      slug: 'cybersecurity-analyst',
      category: 'Security & Operations',
      description: 'Monitors enterprise digital networks, conducts threat hunting, analyzes security incidents, and enforces defenses.',
      salaryRange: '$80,000 - $140,000 / yr',
      demandLevel: 'Very High',
      experienceLevel: 'Entry to Senior',
      overview: 'Cybersecurity Analysts protect critical digital infrastructure from cyber threats, malware, data breaches, and sophisticated intrusions.',
      educationReqs: 'Degree in Cybersecurity, Computer Science, Information Assurance, or Security+ / CEH.',
      aptitudeReqs: { LOGICAL: 85, QUANTITATIVE: 65, VERBAL: 70, ANALYTICAL: 85, PROBLEM_SOLVING: 85 },
      commonJobTitles: ['SOC Analyst', 'Information Security Officer', 'Incident Response Analyst'],
      requiredSkills: ['Network Security', 'Linux Administration', 'Cryptography', 'Analytical Thinking', 'Problem Solving'],
      preferredSkills: ['Ethical Hacking & PenTesting', 'Security Information & Event Management (SIEM)', 'Identity & Access Management (IAM)'],
    },
    {
      title: 'Mobile App Developer',
      slug: 'mobile-app-developer',
      category: 'Software Engineering',
      description: 'Builds native and cross-platform mobile apps for iOS and Android with sleek touch gestures and offline-first persistence.',
      salaryRange: '$80,000 - $135,000 / yr',
      demandLevel: 'Moderate to High',
      experienceLevel: 'Entry to Senior',
      overview: 'Mobile Developers build the pocket software people interact with daily, focusing on device hardware integration, battery efficiency, and App Store guidelines.',
      educationReqs: 'Degree in Computer Science or demonstrated mobile portfolio on App Store / Play Store.',
      aptitudeReqs: { LOGICAL: 75, QUANTITATIVE: 60, VERBAL: 65, ANALYTICAL: 75, PROBLEM_SOLVING: 80 },
      commonJobTitles: ['iOS Developer', 'Android Engineer', 'Flutter / React Native Specialist'],
      requiredSkills: ['JavaScript', 'TypeScript', 'React Native', 'Flutter', 'Problem Solving'],
      preferredSkills: ['Swift / iOS', 'Kotlin / Android', 'SQL'],
    },
    {
      title: 'UI/UX Product Designer',
      slug: 'ui-ux-designer',
      category: 'Design & Product',
      description: 'Researches customer friction points, designs wireframes and intuitive user journeys, and establishes scalable design systems.',
      salaryRange: '$75,000 - $130,000 / yr',
      demandLevel: 'High',
      experienceLevel: 'Entry to Lead',
      overview: 'UI/UX Designers ensure that digital applications are not only aesthetically captivating, but effortless to navigate, inclusive, and ergonomic.',
      educationReqs: 'Degree in Human-Computer Interaction (HCI), Graphic Design, Psychology, or Computer Science.',
      aptitudeReqs: { LOGICAL: 65, QUANTITATIVE: 50, VERBAL: 80, ANALYTICAL: 80, PROBLEM_SOLVING: 75 },
      commonJobTitles: ['Product Designer', 'Interaction Designer', 'UX Researcher'],
      requiredSkills: ['Figma', 'Design Systems & Wireframing', 'User Research & Usability Testing', 'Communication & Presentation'],
      preferredSkills: ['HTML5 & CSS3', 'Tailwind CSS', 'Team Collaboration'],
    },
    {
      title: 'Product Manager',
      slug: 'product-manager',
      category: 'Design & Product',
      description: 'Defines product vision, orchestrates engineering and design roadmaps, prioritizes feature backlogs, and maximizes customer ROI.',
      salaryRange: '$95,000 - $165,000 / yr',
      demandLevel: 'High',
      experienceLevel: 'Mid to Director',
      overview: 'Product Managers sit at the intersection of business, technology, and user experience to launch products that deliver measurable market impact.',
      educationReqs: 'Degree in Engineering, Computer Science, or Business Administration (MBA).',
      aptitudeReqs: { LOGICAL: 80, QUANTITATIVE: 75, VERBAL: 85, ANALYTICAL: 85, PROBLEM_SOLVING: 85 },
      commonJobTitles: ['Technical Product Manager (TPM)', 'Associate Product Manager (APM)', 'Group Product Manager'],
      requiredSkills: ['Product Roadmapping & Metrics', 'Agile & Scrum Methodologies', 'Analytical Thinking', 'Communication & Presentation', 'Team Collaboration'],
      preferredSkills: ['SQL', 'User Research & Usability Testing', 'Problem Solving'],
    },
    {
      title: 'QA & Test Automation Engineer',
      slug: 'qa-engineer',
      category: 'Software Engineering',
      description: 'Designs automated end-to-end testing suites, regression pipelines, and performance benchmarks to guarantee software quality.',
      salaryRange: '$70,000 - $120,000 / yr',
      demandLevel: 'Moderate',
      experienceLevel: 'Entry to Senior',
      overview: 'QA Engineers are the guardians of stability, using modern automated test runners to catch defects before code ever reaches production.',
      educationReqs: 'Degree in Computer Science, IT, or related technical field.',
      aptitudeReqs: { LOGICAL: 75, QUANTITATIVE: 60, VERBAL: 65, ANALYTICAL: 80, PROBLEM_SOLVING: 80 },
      commonJobTitles: ['SDET (Software Development Engineer in Test)', 'Quality Assurance Engineer', 'Automation Specialist'],
      requiredSkills: ['JavaScript', 'Python', 'Automated Testing (Jest / Vitest)', 'End-to-End Testing (Playwright / Cypress)', 'Problem Solving'],
      preferredSkills: ['API Testing (Postman / REST Assured)', 'CI/CD Pipelines (GitHub Actions)', 'Docker'],
    },
    {
      title: 'Data Engineer',
      slug: 'data-engineer',
      category: 'Artificial Intelligence & Data',
      description: 'Constructs fault-tolerant data pipelines, ETL workflows, data lakehouses, and stream-processing infrastructure.',
      salaryRange: '$95,000 - $160,000 / yr',
      demandLevel: 'Very High',
      experienceLevel: 'Entry to Principal',
      overview: 'Data Engineers build the plumbing that moves petabytes of information securely and reliably from operational databases into analytical warehouses.',
      educationReqs: 'B.Tech/BS in Computer Science, Software Engineering, or Information Systems.',
      aptitudeReqs: { LOGICAL: 80, QUANTITATIVE: 75, VERBAL: 60, ANALYTICAL: 85, PROBLEM_SOLVING: 85 },
      commonJobTitles: ['Big Data Engineer', 'ETL Pipeline Developer', 'Analytics Engineer'],
      requiredSkills: ['Python', 'SQL', 'PostgreSQL', 'Docker', 'Problem Solving', 'Analytical Thinking'],
      preferredSkills: ['Apache Cassandra', 'Go (Golang)', 'AWS (Amazon Web Services)', 'Redis'],
    },
    {
      title: 'Cybersecurity Engineer',
      slug: 'cybersecurity-engineer',
      category: 'Security & Operations',
      description: 'Architects and engineers defensible networks, cryptographic controls, zero-trust infrastructure, and automated security safeguards.',
      salaryRange: '$100,000 - $170,000 / yr',
      demandLevel: 'Very High',
      experienceLevel: 'Mid to Lead',
      overview: 'Cybersecurity Engineers build security systems rather than merely monitoring them, designing identity backbones, firewalls, and automated defense tools.',
      educationReqs: 'Degree in Cybersecurity, Computer Engineering, or Computer Science with CISSP / OSCP.',
      aptitudeReqs: { LOGICAL: 85, QUANTITATIVE: 75, VERBAL: 65, ANALYTICAL: 85, PROBLEM_SOLVING: 90 },
      commonJobTitles: ['Security Systems Engineer', 'AppSec Engineer', 'Cloud Security Architect'],
      requiredSkills: ['Network Security', 'Ethical Hacking & PenTesting', 'Cryptography', 'Linux Administration', 'Problem Solving'],
      preferredSkills: ['Identity & Access Management (IAM)', 'Python', 'Docker', 'AWS (Amazon Web Services)'],
    },
    {
      title: 'Natural Language Processing (NLP) Engineer',
      slug: 'nlp-engineer',
      category: 'Artificial Intelligence & Data',
      description: 'Specializes in computational linguistics, fine-tuning large language models, retrieval augmented generation, and semantic understanding.',
      salaryRange: '$115,000 - $190,000 / yr',
      demandLevel: 'Extreme',
      experienceLevel: 'Mid to Principal',
      overview: 'NLP Engineers enable machines to comprehend, translate, summarize, and generate human language with high precision.',
      educationReqs: 'MS/PhD or BS with strong research background in Computational Linguistics or Computer Science.',
      aptitudeReqs: { LOGICAL: 85, QUANTITATIVE: 80, VERBAL: 85, ANALYTICAL: 90, PROBLEM_SOLVING: 90 },
      commonJobTitles: ['NLP Specialist', 'LLM Alignment Engineer', 'Conversational AI Architect'],
      requiredSkills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Natural Language Processing (NLP)', 'Large Language Models (LLMs) & RAG'],
      preferredSkills: ['FastAPI', 'MLOps & Model Deployment', 'Docker'],
    },
    {
      title: 'Computer Vision Engineer',
      slug: 'computer-vision-engineer',
      category: 'Artificial Intelligence & Data',
      description: 'Develops visual understanding algorithms for autonomous vehicles, medical imaging, robotics, and edge camera processing.',
      salaryRange: '$110,000 - $180,000 / yr',
      demandLevel: 'High',
      experienceLevel: 'Entry to Senior',
      overview: 'Computer Vision Engineers train models to classify, detect, segment, and track objects in real-time video streams and multispectral images.',
      educationReqs: 'Degree in Computer Science, Robotics, Electrical Engineering, or Mathematics.',
      aptitudeReqs: { LOGICAL: 85, QUANTITATIVE: 85, VERBAL: 60, ANALYTICAL: 90, PROBLEM_SOLVING: 90 },
      commonJobTitles: ['Vision Systems Engineer', 'Perception Engineer', 'Image Processing Scientist'],
      requiredSkills: ['Python', 'C++', 'Computer Vision', 'Deep Learning', 'PyTorch', 'Problem Solving'],
      preferredSkills: ['TensorFlow / Keras', 'Docker', 'Linux Administration'],
    },
    {
      title: 'Blockchain Developer',
      slug: 'blockchain-developer',
      category: 'Software Engineering',
      description: 'Builds decentralized applications (dApps), smart contracts, token protocols, and cryptographic consensus systems.',
      salaryRange: '$100,000 - $175,000 / yr',
      demandLevel: 'Moderate to High',
      experienceLevel: 'Entry to Senior',
      overview: 'Blockchain Developers work at the bleeding edge of peer-to-peer computing, state machine consensus, and immutability.',
      educationReqs: 'Degree in Computer Science, Mathematics, Cryptography, or self-directed smart contract experience.',
      aptitudeReqs: { LOGICAL: 85, QUANTITATIVE: 80, VERBAL: 65, ANALYTICAL: 85, PROBLEM_SOLVING: 85 },
      commonJobTitles: ['Smart Contract Developer', 'Web3 Protocols Engineer', 'Solidity Architect'],
      requiredSkills: ['JavaScript', 'TypeScript', 'Solidity', 'Cryptography', 'Problem Solving'],
      preferredSkills: ['Web3.js / Ethers.js', 'Smart Contract Auditing', 'Go (Golang)', 'Rust'],
    },
    {
      title: 'Software Developer (Core & Systems)',
      slug: 'software-developer',
      category: 'Software Engineering',
      description: 'Designs high-reliability desktop, server, and core operating system components with optimal data structures and algorithmic complexity.',
      salaryRange: '$85,000 - $140,000 / yr',
      demandLevel: 'Very High',
      experienceLevel: 'Entry to Senior',
      overview: 'Core Software Developers write maintainable, tested, and high-throughput logic that powers modern operating systems, desktop suites, and business tools.',
      educationReqs: 'B.Tech/BS/MS in Computer Science, Software Engineering, or related technical discipline.',
      aptitudeReqs: { LOGICAL: 80, QUANTITATIVE: 75, VERBAL: 65, ANALYTICAL: 80, PROBLEM_SOLVING: 85 },
      commonJobTitles: ['Software Development Engineer (SDE)', 'Systems Programmer', 'Core Developer'],
      requiredSkills: ['Java', 'C++', 'SQL', 'Problem Solving', 'Analytical Thinking'],
      preferredSkills: ['Python', 'Docker', 'Linux Administration', 'Git/GitHub'],
    },
    {
      title: 'Cloud Solutions Architect',
      slug: 'cloud-solutions-architect',
      category: 'Cloud & Infrastructure',
      description: 'Designs multi-region resilient cloud infrastructures, disaster recovery protocols, cost optimization plans, and cloud migrations.',
      salaryRange: '$120,000 - $200,000 / yr',
      demandLevel: 'Extreme',
      experienceLevel: 'Senior to Principal',
      overview: 'Cloud Architects define the enterprise blueprint for how dozens of microservices, databases, networks, and caches interact smoothly on the public cloud.',
      educationReqs: 'BS in Computer Science or IT plus Professional AWS / Azure / GCP Solutions Architect Certifications.',
      aptitudeReqs: { LOGICAL: 85, QUANTITATIVE: 70, VERBAL: 80, ANALYTICAL: 90, PROBLEM_SOLVING: 85 },
      commonJobTitles: ['Enterprise Cloud Architect', 'Lead Solutions Engineer', 'Cloud Migration Director'],
      requiredSkills: ['AWS (Amazon Web Services)', 'Docker', 'Kubernetes', 'Linux Administration', 'Network Security', 'Communication & Presentation'],
      preferredSkills: ['Microsoft Azure', 'Google Cloud Platform (GCP)', 'Terraform / IaC', 'CI/CD Pipelines (GitHub Actions)'],
    },
    {
      title: 'DevOps & Site Reliability Engineer',
      slug: 'site-reliability-engineer',
      category: 'Cloud & Infrastructure',
      description: 'Applies software engineering principles to operations to ensure 99.999% availability, automated self-healing, and rapid incident response.',
      salaryRange: '$105,000 - $175,000 / yr',
      demandLevel: 'Very High',
      experienceLevel: 'Mid to Staff',
      overview: 'SREs treat operations as a software problem, establishing error budgets, automated metric alerts, and self-healing cloud clusters.',
      educationReqs: 'B.Tech/BS in Computer Science or related practical systems experience.',
      aptitudeReqs: { LOGICAL: 85, QUANTITATIVE: 70, VERBAL: 65, ANALYTICAL: 85, PROBLEM_SOLVING: 90 },
      commonJobTitles: ['SRE', 'Reliability Architect', 'DevOps Specialist'],
      requiredSkills: ['Linux Administration', 'Docker', 'Kubernetes', 'CI/CD Pipelines (GitHub Actions)', 'Problem Solving', 'Python'],
      preferredSkills: ['Go (Golang)', 'Bash / Shell Scripting', 'AWS (Amazon Web Services)', 'Redis'],
    },
  ];

  for (const c of careersData) {
    const career = await prisma.career.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        category: c.category,
        description: c.description,
        salaryRange: c.salaryRange,
        demandLevel: c.demandLevel,
        experienceLevel: c.experienceLevel,
        overview: c.overview,
        educationReqs: c.educationReqs,
        aptitudeReqs: c.aptitudeReqs,
        commonJobTitles: c.commonJobTitles,
      },
      create: {
        title: c.title,
        slug: c.slug,
        category: c.category,
        description: c.description,
        salaryRange: c.salaryRange,
        demandLevel: c.demandLevel,
        experienceLevel: c.experienceLevel,
        overview: c.overview,
        educationReqs: c.educationReqs,
        aptitudeReqs: c.aptitudeReqs,
        commonJobTitles: c.commonJobTitles,
      },
    });

    // Link required skills
    for (const skillName of c.requiredSkills) {
      const sId = skillMap.get(skillName);
      if (sId) {
        await prisma.careerSkill.upsert({
          where: { careerId_skillId: { careerId: career.id, skillId: sId } },
          update: { isRequired: true, minProficiency: 4, weight: 1.5 },
          create: {
            careerId: career.id,
            skillId: sId,
            isRequired: true,
            minProficiency: 4,
            weight: 1.5,
          },
        });
      }
    }

    // Link preferred skills
    for (const skillName of c.preferredSkills) {
      const sId = skillMap.get(skillName);
      if (sId) {
        await prisma.careerSkill.upsert({
          where: { careerId_skillId: { careerId: career.id, skillId: sId } },
          update: { isRequired: false, minProficiency: 3, weight: 1.0 },
          create: {
            careerId: career.id,
            skillId: sId,
            isRequired: false,
            minProficiency: 3,
            weight: 1.0,
          },
        });
      }
    }
  }
  console.log(`✅ Seeded ${careersData.length} careers with skill dependencies.`);

  // 4. Aptitude Questions (25 realistic questions across 5 categories)
  const aptitudeQuestionsData: {
    category: AptitudeCategory;
    question: string;
    options: string[];
    correctOption: number;
    explanation: string;
    difficulty: string;
  }[] = [
    // LOGICAL REASONING
    {
      category: AptitudeCategory.LOGICAL,
      question: 'In a certain code, "CLOUD" is written as "DMPVE". How is "SYSTEM" written in that same code?',
      options: ['TZTUFN', 'SZTUFM', 'TYTUFN', 'TATUSN'],
      correctOption: 0,
      explanation: 'Each letter is shifted forward by 1 in the alphabet: S->T, Y->Z, S->T, T->U, E->F, M->N.',
      difficulty: 'Easy',
    },
    {
      category: AptitudeCategory.LOGICAL,
      question: 'Statements: All microservices run in containers. Some containers are managed by Kubernetes. Conclusions: I. Some microservices are managed by Kubernetes. II. All Kubernetes nodes host microservices.',
      options: ['Only conclusion I follows', 'Only conclusion II follows', 'Neither I nor II follows', 'Both I and II follow'],
      correctOption: 2,
      explanation: 'Since only "some containers" are in Kubernetes, we cannot conclude with certainty that the microservices containers specifically are among those without further premises.',
      difficulty: 'Medium',
    },
    {
      category: AptitudeCategory.LOGICAL,
      question: 'Look at this series: 2, 6, 12, 20, 30, ... What number should come next?',
      options: ['40', '42', '44', '48'],
      correctOption: 1,
      explanation: 'Differences between consecutive numbers increase by 2: +4, +6, +8, +10, so +12 -> 30 + 12 = 42 (or n*(n+1): 1*2, 2*3, 3*4, 4*5, 5*6, 6*7=42).',
      difficulty: 'Easy',
    },
    {
      category: AptitudeCategory.LOGICAL,
      question: 'Point A is 5km North of B. Point C is 12km East of B. What is the shortest direct line distance from A to C?',
      options: ['17 km', '13 km', '15 km', '14 km'],
      correctOption: 1,
      explanation: 'Using Pythagorean theorem: sqrt(5^2 + 12^2) = sqrt(25 + 144) = sqrt(169) = 13 km.',
      difficulty: 'Medium',
    },
    {
      category: AptitudeCategory.LOGICAL,
      question: 'Five servers (S1, S2, S3, S4, S5) are queued. S1 finishes before S3. S4 finishes after S2 but before S1. S5 finishes last. Which server finishes second?',
      options: ['S1', 'S2', 'S4', 'S3'],
      correctOption: 2,
      explanation: 'Order: S2 finishes first, then S4, then S1, then S3, then S5. The second server to finish is S4.',
      difficulty: 'Medium',
    },

    // QUANTITATIVE APTITUDE
    {
      category: AptitudeCategory.QUANTITATIVE,
      question: 'A cloud server processes 1,200 requests per minute with 4 CPU cores. If capacity scales linearly, how many requests can 7 CPU cores process in 30 seconds?',
      options: ['1,050', '2,100', '1,400', '1,200'],
      correctOption: 0,
      explanation: '1 core handles 1200 / 4 = 300 req/min. 7 cores handle 7 * 300 = 2100 req/min. In 30 seconds (0.5 min), 2100 * 0.5 = 1050 requests.',
      difficulty: 'Medium',
    },
    {
      category: AptitudeCategory.QUANTITATIVE,
      question: 'If the price of a cloud database cluster drops by 20% and its usage increases by 25%, what is the net effect on the company total spend for this service?',
      options: ['Decreases by 5%', 'Increases by 5%', 'Remains unchanged (0% change)', 'Increases by 2%'],
      correctOption: 2,
      explanation: 'New Spend = (0.80) * (1.25) = 1.00. Hence, there is no change in total spend.',
      difficulty: 'Medium',
    },
    {
      category: AptitudeCategory.QUANTITATIVE,
      question: 'An API response time has a mean of 120ms with standard deviation of 15ms. Assuming normal distribution, approximately what percentage of requests respond in under 150ms?',
      options: ['68%', '95%', '97.5%', '99.7%'],
      correctOption: 2,
      explanation: '150ms is (150-120)/15 = 2 standard deviations above the mean. The area under the normal curve below +2 sigma is approximately 97.7% (~97.5%).',
      difficulty: 'Hard',
    },
    {
      category: AptitudeCategory.QUANTITATIVE,
      question: 'A distributed queue receives 400 messages/sec and 2 workers can process 150 messages/sec each. How many additional workers are required to prevent queue backlog?',
      options: ['1 worker', '2 workers', '3 workers', '4 workers'],
      correctOption: 0,
      explanation: 'Current capacity = 2 * 150 = 300 msg/s. Deficit = 400 - 300 = 100 msg/s. 1 extra worker adds 150 msg/s, raising capacity to 450 msg/s, clearing backlog.',
      difficulty: 'Easy',
    },
    {
      category: AptitudeCategory.QUANTITATIVE,
      question: 'What is the sum of integers from 1 to 50 inclusive?',
      options: ['1,250', '1,275', '1,300', '1,325'],
      correctOption: 1,
      explanation: 'Sum = n*(n+1)/2 = 50 * 51 / 2 = 25 * 51 = 1275.',
      difficulty: 'Easy',
    },

    // VERBAL ABILITY
    {
      category: AptitudeCategory.VERBAL,
      question: 'Select the word that is most nearly OPPOSITE in meaning to "OBSOLETE":',
      options: ['Archaic', 'Contemporary', 'Redundant', 'Superfluous'],
      correctOption: 1,
      explanation: '"Obsolete" means outdated or no longer in use; "Contemporary" means modern and current.',
      difficulty: 'Easy',
    },
    {
      category: AptitudeCategory.VERBAL,
      question: 'Identify the sentence with correct grammatical agreement and syntax:',
      options: [
        'The committee have reached its decision unanimously.',
        'Neither the engineering lead nor the developers was available for comment.',
        'Each of the microservices requires its own independent database schema.',
        'Data from the production telemetry are showing an spike in latency.',
      ],
      correctOption: 2,
      explanation: '"Each" takes the singular pronoun "its" and singular verb "requires". In B, the verb should agree with the plural "developers" (were).',
      difficulty: 'Medium',
    },
    {
      category: AptitudeCategory.VERBAL,
      question: 'Complete the analogy — ALGORITHM : PROGRAM :: BLUEPRINT : ?',
      options: ['Draftsman', 'Building', 'Foundation', 'Architecture'],
      correctOption: 1,
      explanation: 'An algorithm is the abstract plan realized in a program, just as a blueprint is the abstract architectural plan realized in a building.',
      difficulty: 'Medium',
    },
    {
      category: AptitudeCategory.VERBAL,
      question: 'Choose the most precise term: "The engineering team achieved ________, ensuring that identical inputs consistently yield the exact same system output without side effects."',
      options: ['Concurrency', 'Idempotence', 'Redundancy', 'Elasticity'],
      correctOption: 1,
      explanation: 'Idempotence describes an operation where applying it multiple times yields the exact same outcome as a single execution.',
      difficulty: 'Hard',
    },
    {
      category: AptitudeCategory.VERBAL,
      question: 'Select the correct meaning of the idiom: "To iron out the bottlenecks":',
      options: [
        'To speed up CPU clock speed',
        'To resolve hindrances and streamline a workflow',
        'To press garments for an interview',
        'To compress disk storage',
      ],
      correctOption: 1,
      explanation: '"To iron out bottlenecks" means to detect and resolve obstacles that restrict throughput.',
      difficulty: 'Easy',
    },

    // ANALYTICAL THINKING
    {
      category: AptitudeCategory.ANALYTICAL,
      question: 'A system failure occurs only when both Database connection pool is exhausted AND Redis cache misses exceed 80%. If Redis cache miss is 92% but Database pool is only 40% full, does system failure occur?',
      options: ['Yes, because Redis miss rate is critically high', 'No, because both conditions must be met simultaneously', 'System enters warning mode only', 'Cannot be determined without CPU metric'],
      correctOption: 1,
      explanation: 'Logical AND demands both conditions to be true. Since the DB connection pool is not exhausted, the failure condition is not satisfied.',
      difficulty: 'Medium',
    },
    {
      category: AptitudeCategory.ANALYTICAL,
      question: 'You observe that web page bounce rates spike whenever the average DOMContentLoaded time exceeds 2.4 seconds. If optimizing image payloads reduces load time from 3.1s to 1.8s, what is the most reasonable analytical hypothesis?',
      options: [
        'Bounce rates will likely decrease because page load drops below the 2.4s threshold',
        'Bounce rates will stay unchanged because image size never affects user retention',
        'Bounce rates will double due to image caching overhead',
        'Server compute cost will increase proportionally to bounce reduction',
      ],
      correctOption: 0,
      explanation: 'Since the load time moves from above the friction threshold (3.1s > 2.4s) to comfortably below it (1.8s < 2.4s), user drop-off is expected to improve.',
      difficulty: 'Medium',
    },
    {
      category: AptitudeCategory.ANALYTICAL,
      question: 'A machine learning classifier predicts fraud. Precision is 90% and Recall is 50%. What does this imply about the model predictions?',
      options: [
        'When the model flags a transaction as fraud, it is almost always correct, but it misses half of all actual fraud cases.',
        'The model flags 90% of all fraud cases correctly, but has 50% false alarms.',
        'The model has an accuracy of 70% across all transactions.',
        'The dataset is perfectly balanced between fraudulent and legitimate events.',
      ],
      correctOption: 0,
      explanation: 'High precision (90%) means low false positives. Moderate recall (50%) means it detects only 50% of the true positive population.',
      difficulty: 'Hard',
    },
    {
      category: AptitudeCategory.ANALYTICAL,
      question: 'In an A/B test with 50,000 users per variant, Variant B generates a 3.4% conversion rate versus Variant A 3.1% (p-value = 0.008). Which conclusion is analytically rigorous?',
      options: [
        'Variant B has a statistically significant improvement at alpha = 0.05 level.',
        'The test was too small to draw any conclusions.',
        'Variant A is superior because p-value is below 0.05.',
        'The observed difference is entirely attributable to random noise.',
      ],
      correctOption: 0,
      explanation: 'A p-value of 0.008 is well below the standard 0.05 significance threshold, indicating the observed lift is statistically significant.',
      difficulty: 'Medium',
    },
    {
      category: AptitudeCategory.ANALYTICAL,
      question: 'Given three microservices X, Y, Z: X depends on Y, and Y depends on Z. If Z experiences a 500 error, what is the expected cascading failure pattern in the absence of circuit breakers?',
      options: [
        'Only Z fails; X and Y remain unaffected',
        'Both Y and X will likely experience timeout or error propagation',
        'X will succeed because it has no direct dependency on Z',
        'The network switch will reset automatically',
      ],
      correctOption: 1,
      explanation: 'Without isolation or circuit breakers, synchronous dependency failures cascade upstream: Z failing causes Y to block/fail, which causes X to fail.',
      difficulty: 'Easy',
    },

    // PROBLEM SOLVING
    {
      category: AptitudeCategory.PROBLEM_SOLVING,
      question: 'You need to find a single target value in a sorted array of 1,000,000 elements. What is the maximum number of comparisons required using Binary Search?',
      options: ['1,000,000', '500,000', '20', '100'],
      correctOption: 2,
      explanation: 'Binary search operates in O(log2 N). ceil(log2(1,000,000)) = ceil(19.93) = 20 comparisons.',
      difficulty: 'Medium',
    },
    {
      category: AptitudeCategory.PROBLEM_SOLVING,
      question: 'A web app experiences sudden high latency. The database CPU is at 99%, while app servers are at 15% CPU. What is the most effective immediate troubleshooting step?',
      options: [
        'Spin up 10 more app server instances',
        'Inspect slow query logs and active transactions to identify unindexed queries or table locks',
        'Restart the frontend build process',
        'Switch CSS frameworks',
      ],
      correctOption: 1,
      explanation: 'App servers are idle while database CPU is saturated. Inspecting slow queries and table locks addresses the root bottleneck immediately.',
      difficulty: 'Medium',
    },
    {
      category: AptitudeCategory.PROBLEM_SOLVING,
      question: 'You need to store and look up user session tokens with average time complexity O(1). Which data structure is best suited?',
      options: ['Binary Search Tree', 'Hash Map / Key-Value Store', 'Doubly Linked List', 'Sorted Array'],
      correctOption: 1,
      explanation: 'A Hash Map or in-memory key-value store (like Redis) provides average O(1) amortized lookup, insertion, and deletion.',
      difficulty: 'Easy',
    },
    {
      category: AptitudeCategory.PROBLEM_SOLVING,
      question: 'Two threads simultaneously execute `count = count + 1` on a shared variable without synchronization. What is the classic name for this bug and its resolution?',
      options: [
        'Memory leak; resolve by increasing RAM',
        'Race condition; resolve using mutex locks or atomic operations',
        'Stack overflow; resolve by avoiding recursion',
        'Deadlock; resolve by eliminating threads',
      ],
      correctOption: 1,
      explanation: 'Simultaneous read-modify-write without synchronization is a race condition. Mutexes, semaphores, or atomic instructions ensure thread safety.',
      difficulty: 'Medium',
    },
    {
      category: AptitudeCategory.PROBLEM_SOLVING,
      question: 'You are designing an image upload feature. Users frequently upload 25MB RAW images that crash mobile viewers. What architecture resolves this gracefully?',
      options: [
        'Reject all files larger than 100KB at the form level without user explanation',
        'Upload to object storage, trigger an async background worker to compress and generate multi-resolution WebP variants, and serve via CDN',
        'Store base64 strings directly in the relational database rows',
        'Tell mobile users to only view the site on desktop screens',
      ],
      correctOption: 1,
      explanation: 'Decoupling storage, async background transformation into modern web formats (WebP/AVIF), and CDN distribution is the cloud-native best practice.',
      difficulty: 'Medium',
    },
  ];

  for (const q of aptitudeQuestionsData) {
    await prisma.aptitudeQuestion.create({
      data: {
        category: q.category,
        question: q.question,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        difficulty: q.difficulty,
      },
    });
  }
  console.log(`✅ Seeded ${aptitudeQuestionsData.length} aptitude questions across 5 categories.`);

  // 5. Seed Project Recommendations for top careers
  const fullStackCareer = await prisma.career.findUnique({ where: { slug: 'full-stack-developer' } });
  if (fullStackCareer) {
    await prisma.projectRecommendation.createMany({
      data: [
        {
          careerId: fullStackCareer.id,
          title: 'Real-Time Collaborative Markdown Workspace',
          difficulty: 'Intermediate',
          techStack: ['Next.js', 'TypeScript', 'WebSockets / Socket.io', 'PostgreSQL', 'Tailwind CSS'],
          problemStatement: 'Remote teams need a zero-lag live collaborative documentation tool with real-time cursor awareness, document version history, and role-based permissions.',
          expectedOutcome: 'A deployed multi-tenant editor with JWT auth, live collaborative editing, document autosave, and export to PDF/Markdown.',
          skillsLearned: ['WebSockets', 'Full Stack Architecture', 'Optimistic UI Updates', 'PostgreSQL indexing'],
          estimatedDuration: '3-4 weeks',
          portfolioValue: 'High — Demonstrates real-time state synchronization, concurrency handling, and sleek UX.',
        },
        {
          careerId: fullStackCareer.id,
          title: 'Scalable Micro-SaaS E-Commerce Engine with Stripe Billing',
          difficulty: 'Advanced',
          techStack: ['React', 'Node.js', 'Redis', 'PostgreSQL', 'Docker', 'Stripe API'],
          problemStatement: 'Create a headless e-commerce store with automated inventory tracking, rate-limited checkout sessions, webhook handlers, and transactional email triggers.',
          expectedOutcome: 'Production deployment with 100% test coverage for checkout idempotency, Redis cart caching, and webhook processing.',
          skillsLearned: ['Payment Gateway Architecture', 'Webhook Reliability', 'Redis Caching', 'CI/CD Pipelines'],
          estimatedDuration: '4-5 weeks',
          portfolioValue: 'Extreme — Highly appealing to software companies seeking revenue-critical full stack engineers.',
        },
      ],
    });
  }

  const aiCareer = await prisma.career.findUnique({ where: { slug: 'ai-ml-engineer' } });
  if (aiCareer) {
    await prisma.projectRecommendation.createMany({
      data: [
        {
          careerId: aiCareer.id,
          title: 'Multi-Modal RAG Document Intelligence Engine',
          difficulty: 'Advanced',
          techStack: ['Python', 'FastAPI', 'PyTorch', 'Qdrant / ChromaDB', 'Gemini / OpenAI API', 'Docker'],
          problemStatement: 'Enterprises struggle to query heterogeneous PDF manuals containing diagrams, tables, and dense unstructured text with verifiable attribution.',
          expectedOutcome: 'An end-to-end vector search retrieval pipeline with chunking strategies, cross-encoder reranking, and citation-grounded answers.',
          skillsLearned: ['Retrieval Augmented Generation (RAG)', 'Vector Embeddings', 'FastAPI Microservice', 'Evaluation Metrics'],
          estimatedDuration: '4 weeks',
          portfolioValue: 'Extreme — Direct showcase of modern applied generative AI and vector database expertise.',
        },
        {
          careerId: aiCareer.id,
          title: 'End-to-End Predictive Maintenance Pipeline with MLOps',
          difficulty: 'Intermediate',
          techStack: ['Python', 'scikit-learn', 'Pandas', 'MLflow', 'Docker', 'Streamlit'],
          problemStatement: 'Industrial IoT equipment generates continuous sensor telemetry. Predict catastrophic mechanical failure 48 hours in advance using time-series features.',
          expectedOutcome: 'Trained XGBoost / LSTM model registered in MLflow model registry with automated drift detection and interactive dashboard.',
          skillsLearned: ['Time-Series Feature Engineering', 'MLflow Experiment Tracking', 'Model Explainability (SHAP)', 'Containerization'],
          estimatedDuration: '3 weeks',
          portfolioValue: 'High — Proves mathematical modeling plus disciplined engineering and deployment practices.',
        },
      ],
    });
  }

  console.log('✅ Seeded recommended projects.');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
