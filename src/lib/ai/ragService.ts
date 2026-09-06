/**
 * Retrieval-Augmented Generation (RAG) Subsystem
 * Chunks, indexes, and retrieves contextual domain knowledge to ground LLM responses in real data.
 */

import { EmbeddingsEngine } from './embeddings';
import { LLMProviderFactory, LLMMessage } from './llmProvider';
import { prisma } from '../db';

export interface RAGKnowledgeChunk {
  id: string;
  source: string;
  category: string;
  title: string;
  content: string;
  embedding: number[];
}

export interface RAGRetrievalResult {
  chunk: RAGKnowledgeChunk;
  similarityScore: number;
}

export class RAGService {
  private static knowledgeIndex: RAGKnowledgeChunk[] = [];
  private static isInitialized = false;

  /**
   * Initializes the vector knowledge base by extracting and indexing
   * career track requirements, skill taxonomy, and learning roadmap playbooks.
   */
  public static async initializeIndex(): Promise<void> {
    if (this.isInitialized && this.knowledgeIndex.length > 0) return;

    try {
      const careers = await prisma.career.findMany({
        include: {
          skills: {
            include: { skill: true },
          },
        },
      });

      const chunks: RAGKnowledgeChunk[] = [];

      for (const c of careers) {
        const skillsList = c.skills.map((s) => s.skill.name).join(', ');
        const text = `Career Track: ${c.title}. Category: ${c.category}. Overview: ${c.overview}. Requirements: ${c.educationReqs}. Key Skills: ${skillsList}. Salary: ${c.salaryRange}.`;

        const embedding = await EmbeddingsEngine.getEmbedding(text);
        chunks.push({
          id: `career-${c.id}`,
          source: 'CareerCatalog',
          category: c.category,
          title: c.title,
          content: text,
          embedding,
        });
      }

      // Add foundational career guidance playbooks
      const guidancePlaybooks = [
        {
          id: 'playbook-ats-optimization',
          source: 'ResumeGuide',
          category: 'Resume',
          title: 'ATS Resume Optimization Playbook',
          content: 'ATS optimization requires matching hard skill keywords, using single-column formats, quantifying achievements with percentages or performance improvements, and avoiding tables or embedded graphics.',
        },
        {
          id: 'playbook-skill-gap-closing',
          source: 'LearningStrategy',
          category: 'Roadmap',
          title: 'Strategic Skill Gap Closing Strategy',
          content: 'Close skill gaps by pairing theoretical tutorials with production deployments. Spend 30% of time learning syntax and 70% implementing capstone projects with automated CI/CD and databases.',
        },
        {
          id: 'playbook-interview-prep',
          source: 'InterviewGuide',
          category: 'Interview',
          title: 'Technical System Design & Aptitude Prep',
          content: 'Prepare for technical interviews by combining cognitive problem solving (algorithms, space-time complexity) with distributed systems design (caching, load balancing, relational indexing).',
        },
      ];

      for (const p of guidancePlaybooks) {
        const embedding = await EmbeddingsEngine.getEmbedding(p.content);
        chunks.push({
          ...p,
          embedding,
        });
      }

      this.knowledgeIndex = chunks;
      this.isInitialized = true;
      console.log(`[RAGService] Successfully indexed ${chunks.length} knowledge chunks.`);
    } catch (err) {
      console.warn('[RAGService] Knowledge base indexing fallback:', err);
    }
  }

  /**
   * Retrieves top-k most relevant knowledge chunks using cosine vector similarity.
   */
  public static async retrieveRelevantContext(query: string, topK: number = 3): Promise<RAGRetrievalResult[]> {
    await this.initializeIndex();

    if (this.knowledgeIndex.length === 0) return [];

    const queryEmbedding = await EmbeddingsEngine.getEmbedding(query);
    const scored = this.knowledgeIndex.map((chunk) => ({
      chunk,
      similarityScore: EmbeddingsEngine.cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    scored.sort((a, b) => b.similarityScore - a.similarityScore);
    return scored.slice(0, topK);
  }

  /**
   * Answers candidate inquiries by grounding generation in retrieved knowledge chunks (RAG).
   */
  public static async generateGroundedAnswer(
    userQuery: string,
    chatHistory: LLMMessage[] = [],
    candidateContext?: {
      targetRole?: string;
      topSkills?: string[];
      topSkillGap?: string;
      roadmapProgress?: number;
    }
  ): Promise<{
    answer: string;
    citations: { title: string; source: string; score: number }[];
  }> {
    const retrieved = await this.retrieveRelevantContext(userQuery, 3);
    const citations = retrieved.map((r) => ({
      title: r.chunk.title,
      source: r.chunk.source,
      score: Math.round(r.similarityScore * 100),
    }));

    const contextSnippets = retrieved
      .map((r, i) => `[Context Item ${i + 1}] (${r.chunk.source} - ${r.chunk.title}): ${r.chunk.content}`)
      .join('\n\n');

    const candidatePromptSnippet = candidateContext
      ? `Candidate Status:\n- Target Role: ${candidateContext.targetRole || 'Software Engineering'}\n- Verified Skills: ${candidateContext.topSkills?.join(', ') || 'TypeScript, React'}\n- Primary Skill Gap: ${candidateContext.topSkillGap || 'System Architecture'}\n- Roadmap Progress: ${candidateContext.roadmapProgress || 0}%\n`
      : '';

    const systemPrompt = `You are Aura, an elite AI Career Counselor and Technical Advisor.
Ground all your advice strictly in the provided domain knowledge contexts and the candidate's verified profile data.
Always be concise, encouraging, and actionable. Avoid vague platitudes.

${candidatePromptSnippet}

Verified Knowledge Context (RAG):
${contextSnippets}`;

    const provider = LLMProviderFactory.getActiveProvider();
    const messages: LLMMessage[] = [...chatHistory, { role: 'user', content: userQuery }];

    const answer = await provider.chat(messages, systemPrompt);

    return {
      answer,
      citations,
    };
  }
}
