"""
Skill Normalization Engine
Maintains canonical skill definitions, category taxonomies, and alias/synonym mappings.
Guarantees consistent canonical skill names across API, Firestore, and ML scoring.
"""
from typing import Dict, List, Optional, Tuple
import re

# Canonical skill definitions with primary category and alias list
CANONICAL_SKILL_DEFINITIONS: Dict[str, Dict[str, any]] = {
    # Programming Languages & Core Tech
    "JavaScript": {
        "category": "LANGUAGES",
        "description": "ECMAScript language for web & server applications",
        "aliases": ["javascript", "js", "java script", "ecmascript", "es6", "es2020", "esnext", "vanilla js"],
    },
    "TypeScript": {
        "category": "LANGUAGES",
        "description": "Typed superset of JavaScript providing compile-time safety",
        "aliases": ["typescript", "ts"],
    },
    "Python": {
        "category": "LANGUAGES",
        "description": "High-level versatile language for data science, AI, and backend systems",
        "aliases": ["python", "py", "python3", "python 3", "cpython"],
    },
    "Java": {
        "category": "LANGUAGES",
        "description": "Object-oriented language for enterprise architectures and Android",
        "aliases": ["java", "core java", "java 17", "java 21", "jvm"],
    },
    "C++": {
        "category": "LANGUAGES",
        "description": "High-performance compiled systems programming language",
        "aliases": ["c++", "cpp", "cplusplus"],
    },
    "C#": {
        "category": "LANGUAGES",
        "description": "Modern, type-safe, object-oriented language for .NET platforms",
        "aliases": ["c#", "csharp", "c sharp", ".net c#"],
    },
    "Go (Golang)": {
        "category": "LANGUAGES",
        "description": "Fast, concurrent systems and cloud infrastructure language",
        "aliases": ["go", "golang", "go (golang)"],
    },
    "Rust": {
        "category": "LANGUAGES",
        "description": "Memory-safe systems programming language",
        "aliases": ["rust", "rustlang"],
    },
    "SQL": {
        "category": "DATABASES",
        "description": "Structured Query Language for relational database querying",
        "aliases": ["sql", "structured query language", "ansi sql"],
    },
    "HTML5 & CSS3": {
        "category": "TECHNICAL",
        "description": "Core semantic web standards and responsive styling specifications",
        "aliases": ["html", "html5", "css", "css3", "html/css", "html5 & css3", "html5 and css3"],
    },
    "Bash / Shell Scripting": {
        "category": "TOOLS",
        "description": "CLI scripting for automation and UNIX system administration",
        "aliases": ["bash", "shell", "sh", "zsh", "bash scripting", "shell scripting", "bash / shell scripting"],
    },

    # Frontend Frameworks & Libraries
    "React.js": {
        "category": "FRAMEWORKS",
        "description": "Component-based declarative UI library by Meta",
        "aliases": ["react", "react.js", "reactjs", "react js"],
    },
    "Next.js": {
        "category": "FRAMEWORKS",
        "description": "React production framework with SSR, ISR, and App Router",
        "aliases": ["next.js", "nextjs", "next js", "next"],
    },
    "Vue.js": {
        "category": "FRAMEWORKS",
        "description": "Progressive JavaScript framework for building user interfaces",
        "aliases": ["vue", "vue.js", "vuejs", "vue 3"],
    },
    "Tailwind CSS": {
        "category": "FRAMEWORKS",
        "description": "Utility-first modern CSS framework for rapid UI styling",
        "aliases": ["tailwind", "tailwindcss", "tailwind css"],
    },
    "Redux / Zustand": {
        "category": "FRAMEWORKS",
        "description": "Predictable state management libraries for modern web apps",
        "aliases": ["redux", "zustand", "redux toolkit", "rtk", "redux / zustand"],
    },

    # Backend Frameworks & Runtimes
    "FastAPI": {
        "category": "FRAMEWORKS",
        "description": "Modern high-performance Python ASGI web framework with OpenAPI",
        "aliases": ["fastapi", "fast api", "fast-api"],
    },
    "Node.js": {
        "category": "FRAMEWORKS",
        "description": "Asynchronous event-driven JavaScript server runtime",
        "aliases": ["node", "node.js", "nodejs", "node js"],
    },
    "Django": {
        "category": "FRAMEWORKS",
        "description": "High-level batteries-included Python web framework",
        "aliases": ["django", "django rest framework", "drf"],
    },
    "Spring Boot": {
        "category": "FRAMEWORKS",
        "description": "Production-ready enterprise Java application framework",
        "aliases": ["spring boot", "springboot", "spring"],
    },
    "GraphQL": {
        "category": "FRAMEWORKS",
        "description": "Declarative API query language and runtime execution engine",
        "aliases": ["graphql", "graph ql", "apollo graphql"],
    },
    "REST API Architecture": {
        "category": "TECHNICAL",
        "description": "Representational state transfer principles for scalable web APIs",
        "aliases": ["rest", "rest api", "restful api", "rest apis", "rest api architecture"],
    },

    # Databases & Caching
    "PostgreSQL": {
        "category": "DATABASES",
        "description": "Advanced open-source object-relational database management system",
        "aliases": ["postgresql", "postgres", "psql", "pgsql"],
    },
    "MySQL": {
        "category": "DATABASES",
        "description": "Widely used open-source relational database system",
        "aliases": ["mysql", "my sql"],
    },
    "MongoDB": {
        "category": "DATABASES",
        "description": "Document-oriented distributed NoSQL database system",
        "aliases": ["mongodb", "mongo", "mongo db"],
    },
    "Redis": {
        "category": "DATABASES",
        "description": "In-memory key-value data store for low-latency caching and pub/sub",
        "aliases": ["redis", "redis cache"],
    },

    # Cloud, DevOps & Infrastructure
    "Docker": {
        "category": "TOOLS",
        "description": "Containerization platform for reliable application packaging",
        "aliases": ["docker", "docker containers", "dockerfile"],
    },
    "Kubernetes": {
        "category": "CLOUD",
        "description": "Automated container orchestration and cluster management",
        "aliases": ["kubernetes", "k8s"],
    },
    "Amazon Web Services (AWS)": {
        "category": "CLOUD",
        "description": "Comprehensive enterprise cloud computing infrastructure platform",
        "aliases": ["aws", "amazon web services", "amazon web services (aws)", "ec2", "s3", "lambda"],
    },
    "Google Cloud Platform (GCP)": {
        "category": "CLOUD",
        "description": "Google modular cloud computing services and AI infrastructure",
        "aliases": ["gcp", "google cloud", "google cloud platform"],
    },
    "CI/CD Pipelines": {
        "category": "TOOLS",
        "description": "Automated continuous integration and deployment workflows",
        "aliases": ["ci/cd", "cicd", "ci cd", "github actions", "gitlab ci", "ci/cd pipelines"],
    },
    "Git & GitHub": {
        "category": "TOOLS",
        "description": "Distributed version control system and collaborative code review",
        "aliases": ["git", "github", "git & github", "git and github", "version control"],
    },
    "Terraform": {
        "category": "CLOUD",
        "description": "Infrastructure as Code declarative provisioning tool",
        "aliases": ["terraform", "iac"],
    },

    # AI, Machine Learning & Data Science
    "Machine Learning": {
        "category": "TECHNICAL",
        "description": "Algorithms that infer patterns directly from empirical training data",
        "aliases": ["machine learning", "ml", "applied ml"],
    },
    "Deep Learning": {
        "category": "TECHNICAL",
        "description": "Neural network architectures for representation learning",
        "aliases": ["deep learning", "dl", "neural networks"],
    },
    "PyTorch": {
        "category": "FRAMEWORKS",
        "description": "Dynamic tensor computation and deep learning framework",
        "aliases": ["pytorch", "torch"],
    },
    "TensorFlow / Keras": {
        "category": "FRAMEWORKS",
        "description": "End-to-end open-source machine learning and neural network platform",
        "aliases": ["tensorflow", "tf", "keras", "tensorflow / keras"],
    },
    "scikit-learn": {
        "category": "FRAMEWORKS",
        "description": "Python library for classical statistical machine learning algorithms",
        "aliases": ["scikit-learn", "sklearn", "scikit learn"],
    },
    "Pandas & NumPy": {
        "category": "TOOLS",
        "description": "High-performance scientific array computing and tabular data analysis",
        "aliases": ["pandas", "numpy", "pandas & numpy", "pandas and numpy"],
    },
    "Natural Language Processing (NLP)": {
        "category": "TECHNICAL",
        "description": "Computational linguistics, text analysis, and semantic understanding",
        "aliases": ["nlp", "natural language processing"],
    },
    "Large Language Models (LLMs)": {
        "category": "TECHNICAL",
        "description": "Foundational generative models, fine-tuning, RAG, and prompt design",
        "aliases": ["llm", "llms", "large language models", "generative ai", "genai", "prompt engineering"],
    },

    # Core Engineering & Architecture
    "Data Structures & Algorithms": {
        "category": "TECHNICAL",
        "description": "Foundational algorithmic problem solving, trees, graphs, and dynamic programming",
        "aliases": ["dsa", "data structures", "algorithms", "data structures & algorithms", "data structures and algorithms"],
    },
    "System Design": {
        "category": "TECHNICAL",
        "description": "Designing scalable, fault-tolerant distributed systems and architectures",
        "aliases": ["system design", "distributed systems", "system architecture", "system design & architecture"],
    },
    "Automated Testing": {
        "category": "TECHNICAL",
        "description": "Unit, integration, and end-to-end software verification (pytest, jest)",
        "aliases": ["testing", "unit testing", "automated testing", "tdd", "integration testing", "pytest", "jest"],
    },

    # Soft Skills & Professional Competencies
    "Problem Solving": {
        "category": "SOFT",
        "description": "Structured analytical decomposition of complex engineering problems",
        "aliases": ["problem solving", "analytical thinking", "critical thinking"],
    },
    "Technical Communication": {
        "category": "SOFT",
        "description": "Clear articulation of technical trade-offs, documentation, and design reviews",
        "aliases": ["communication", "technical communication", "technical writing", "documentation"],
    },
    "Agile & Scrum": {
        "category": "SOFT",
        "description": "Iterative software development lifecycle management and sprint planning",
        "aliases": ["agile", "scrum", "agile & scrum", "sprint planning", "kanban"],
    },
}

# Build reverse lookup map for fast normalized alias resolution
_ALIAS_LOOKUP: Dict[str, str] = {}
for canonical_name, data in CANONICAL_SKILL_DEFINITIONS.items():
    # Direct lowercased name
    _ALIAS_LOOKUP[canonical_name.lower().strip()] = canonical_name
    for alias in data.get("aliases", []):
        _ALIAS_LOOKUP[alias.lower().strip()] = canonical_name


def clean_skill_string(raw_text: str) -> str:
    """Cleans punctuation, extraneous whitespace, and symbols for uniform comparison."""
    if not raw_text:
        return ""
    # Normalize multiple whitespace
    cleaned = re.sub(r"\s+", " ", raw_text.strip())
    return cleaned


def normalize_skill_name(raw_name: str) -> Tuple[str, str, str]:
    """
    Normalizes any input skill alias into its canonical form.
    Returns: (canonical_name, category, description)
    If unknown, capitalizes cleanly and defaults to 'TECHNICAL'.
    """
    cleaned = clean_skill_string(raw_name)
    key = cleaned.lower()

    # Exact alias match
    if key in _ALIAS_LOOKUP:
        canonical = _ALIAS_LOOKUP[key]
        info = CANONICAL_SKILL_DEFINITIONS[canonical]
        return canonical, info["category"], info["description"]

    # Partial / substring heuristics for common patterns
    if "react" in key and "native" not in key:
        info = CANONICAL_SKILL_DEFINITIONS["React.js"]
        return "React.js", info["category"], info["description"]
    if "postgres" in key:
        info = CANONICAL_SKILL_DEFINITIONS["PostgreSQL"]
        return "PostgreSQL", info["category"], info["description"]
    if "mongo" in key:
        info = CANONICAL_SKILL_DEFINITIONS["MongoDB"]
        return "MongoDB", info["category"], info["description"]
    if "fastapi" in key or "fast-api" in key:
        info = CANONICAL_SKILL_DEFINITIONS["FastAPI"]
        return "FastAPI", info["category"], info["description"]
    if "next" in key and "step" not in key:
        info = CANONICAL_SKILL_DEFINITIONS["Next.js"]
        return "Next.js", info["category"], info["description"]
    if "docker" in key:
        info = CANONICAL_SKILL_DEFINITIONS["Docker"]
        return "Docker", info["category"], info["description"]
    if "kubernetes" in key or key == "k8s":
        info = CANONICAL_SKILL_DEFINITIONS["Kubernetes"]
        return "Kubernetes", info["category"], info["description"]
    if "aws" in key or "amazon web" in key:
        info = CANONICAL_SKILL_DEFINITIONS["Amazon Web Services (AWS)"]
        return "Amazon Web Services (AWS)", info["category"], info["description"]

    # Fallback to Title Cased version
    title_cased = cleaned.title()
    return title_cased, "TECHNICAL", f"Proficiency in {title_cased}"


def get_canonical_skills_list(category: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, any]]:
    """Returns list of canonical skills matching category or search query."""
    results = []
    search_lower = search.lower().strip() if search else ""
    cat_upper = category.upper().strip() if category else ""

    for name, data in CANONICAL_SKILL_DEFINITIONS.items():
        if cat_upper and cat_upper != "ALL" and data["category"] != cat_upper:
            continue
        if search_lower:
            match_name = search_lower in name.lower()
            match_desc = search_lower in data["description"].lower()
            match_alias = any(search_lower in a for a in data.get("aliases", []))
            if not (match_name or match_desc or match_alias):
                continue

        results.append({
            "name": name,
            "category": data["category"],
            "description": data["description"],
            "aliases": data.get("aliases", []),
        })

    results.sort(key=lambda x: x["name"])
    return results


def get_skill_slug(skill_name: str) -> str:
    """Creates a deterministic URL/document-safe slug for a skill name."""
    return re.sub(r"[^a-z0-9]+", "_", skill_name.lower().strip()).strip("_")
