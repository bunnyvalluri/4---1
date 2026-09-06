/**
 * Unified LLM Provider Abstraction Layer
 * Decouples application logic from specific model providers (Gemini, OpenAI, Claude, Local Fallback).
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface ILLMProvider {
  name: string;
  isAvailable(): boolean;
  generateCompletion(prompt: string, options?: LLMOptions): Promise<string>;
  generateEmbedding(text: string): Promise<number[]>;
  chat(messages: LLMMessage[], systemPrompt?: string, options?: LLMOptions): Promise<string>;
}

// -------------------------------------------------------------
// 1. Google Gemini Provider
// -------------------------------------------------------------
export class GeminiProvider implements ILLMProvider {
  public name = 'Google Gemini';
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 10 && !this.apiKey.startsWith('AQ.Ab8'));
  }

  public async generateCompletion(prompt: string, options?: LLMOptions): Promise<string> {
    const timeout = options?.timeoutMs || 3000;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 800,
        },
      }),
      signal: AbortSignal.timeout(timeout),
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    // Generate embedding via Gemini Embedding API or fallback to semantic hashing
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text }] },
        }),
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const data = await res.json();
        return data?.embedding?.values || [];
      }
    } catch {
      // Graceful fallback to dense deterministic embedding
    }
    return DeterministicFallbackProvider.hashEmbed(text);
  }

  public async chat(messages: LLMMessage[], systemPrompt?: string, options?: LLMOptions): Promise<string> {
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (systemPrompt) {
      contents.unshift({
        role: 'user',
        parts: [{ text: `System Instruction: ${systemPrompt}` }],
      });
    }

    const timeout = options?.timeoutMs || 3000;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 800,
        },
      }),
      signal: AbortSignal.timeout(timeout),
    });

    if (!res.ok) throw new Error(`Gemini Chat error: ${res.statusText}`);
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

// -------------------------------------------------------------
// 2. OpenAI Provider (GPT-4o / GPT-4o-mini / Embeddings)
// -------------------------------------------------------------
export class OpenAIProvider implements ILLMProvider {
  public name = 'OpenAI';
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.startsWith('sk-'));
  }

  public async generateCompletion(prompt: string, options?: LLMOptions): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 800,
      }),
      signal: AbortSignal.timeout(options?.timeoutMs || 3000),
    });

    if (!res.ok) throw new Error(`OpenAI API error: ${res.statusText}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
      signal: AbortSignal.timeout(2500),
    });

    if (!res.ok) return DeterministicFallbackProvider.hashEmbed(text);
    const data = await res.json();
    return data?.data?.[0]?.embedding || DeterministicFallbackProvider.hashEmbed(text);
  }

  public async chat(messages: LLMMessage[], systemPrompt?: string, options?: LLMOptions): Promise<string> {
    const formatted = [...messages];
    if (systemPrompt) {
      formatted.unshift({ role: 'system', content: systemPrompt });
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: formatted,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 800,
      }),
      signal: AbortSignal.timeout(options?.timeoutMs || 3000),
    });

    if (!res.ok) throw new Error(`OpenAI Chat error: ${res.statusText}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  }
}

// -------------------------------------------------------------
// 3. Deterministic Local Model Provider (Zero Downtime Fallback)
// -------------------------------------------------------------
export class DeterministicFallbackProvider implements ILLMProvider {
  public name = 'Local Deterministic Intelligence';

  public isAvailable(): boolean {
    return true; // Always operational
  }

  public static hashEmbed(text: string, dim: number = 64): number[] {
    const vec = new Array(dim).fill(0.0);
    const clean = text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
    const tokens = clean.split(/\s+/).filter(Boolean);

    // 1. Semantic Domain Cluster Projection
    const DOMAIN_CLUSTERS: Record<string, number[]> = {
      web: [0, 1, 2, 3], // web, react, next, frontend, ui, html, css, js, ts
      data: [10, 11, 12, 13], // data, ai, ml, python, learning, model
      cloud: [20, 21, 22, 23], // cloud, devops, docker, kubernetes, aws
      security: [30, 31, 32, 33], // security, cyber, crypto, network
    };

    tokens.forEach((t) => {
      // Cluster matching
      for (const [domain, slots] of Object.entries(DOMAIN_CLUSTERS)) {
        if (
          (domain === 'web' && /react|next|front|web|ui|interface|script|html|css/.test(t)) ||
          (domain === 'data' && /data|ml|ai|python|learn|model|neural|torch/.test(t)) ||
          (domain === 'cloud' && /cloud|devops|docker|k8s|kubernetes|aws|azure/.test(t)) ||
          (domain === 'security' && /sec|cyber|crypto|network|defend|auth|hack/.test(t))
        ) {
          slots.forEach((s) => (vec[s] += 1.5));
        }
      }

      // Character 3-gram hashing for subword semantics
      for (let i = 0; i <= t.length - 3; i++) {
        const trigram = t.substring(i, i + 3);
        let h = 0;
        for (let j = 0; j < trigram.length; j++) {
          h = (h << 5) - h + trigram.charCodeAt(j);
          h |= 0;
        }
        vec[Math.abs(h) % dim] += 0.5;
      }

      // Token hash
      let tokenHash = 0;
      for (let i = 0; i < t.length; i++) {
        tokenHash = (tokenHash << 5) - tokenHash + t.charCodeAt(i);
        tokenHash |= 0;
      }
      vec[Math.abs(tokenHash) % dim] += 1.0;
    });

    // L2 Normalize
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1.0;
    return vec.map((v) => v / norm);
  }

  public async generateCompletion(prompt: string): Promise<string> {
    return `Analysis based on profile requirements:\n- Prioritize core foundational skills highlighted in your diagnostic.\n- Build practical portfolio items directly aligned with industry benchmarks.`;
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    return DeterministicFallbackProvider.hashEmbed(text);
  }

  public async chat(messages: LLMMessage[], systemPrompt?: string): Promise<string> {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content.toLowerCase() || '';

    if (lastUserMsg.includes('skill') || lastUserMsg.includes('gap')) {
      return `To close your primary skill gaps, dedicate 5-8 hours weekly to targeted hands-on projects. Follow your 6-month roadmap milestones and complete the practical exercises in your Skills dashboard.`;
    }
    if (lastUserMsg.includes('resume') || lastUserMsg.includes('ats')) {
      return `For maximum ATS impact, quantify your accomplishments (e.g. 'Optimized API query latency by 35%') and feature exact keywords from your target career path.`;
    }
    if (lastUserMsg.includes('roadmap') || lastUserMsg.includes('project')) {
      return `I recommend starting with Milestone 1 of your roadmap. Focusing on architectural foundations before full-stack integration will give you the strongest portfolio advantage.`;
    }

    return `Hello! I'm Aura, your AI Career Advisor. Based on your active profile and target career path, I can help you understand your skill gaps, optimize your resume for ATS screening, and navigate your 6-month learning roadmap. What would you like to explore?`;
  }
}

// -------------------------------------------------------------
// 4. LLM Provider Factory with Automatic Cascade Fallback
// -------------------------------------------------------------
export class LLMProviderFactory {
  private static providers: ILLMProvider[] = [
    new GeminiProvider(),
    new OpenAIProvider(),
    new DeterministicFallbackProvider(),
  ];

  public static getActiveProvider(): ILLMProvider {
    for (const provider of this.providers) {
      if (provider.isAvailable()) {
        return provider;
      }
    }
    return new DeterministicFallbackProvider();
  }

  public static async executeWithFallback<T>(
    operation: (provider: ILLMProvider) => Promise<T>,
    fallbackResult: T
  ): Promise<T> {
    for (const provider of this.providers) {
      if (!provider.isAvailable()) continue;
      try {
        return await operation(provider);
      } catch (err) {
        console.warn(`[LLMFactory] Provider ${provider.name} failed, falling back:`, err);
      }
    }
    return fallbackResult;
  }
}
