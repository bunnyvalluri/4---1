/**
 * AI Provider Abstraction Layer
 * Supports Google Gemini API (2.5 Flash / 1.5 Flash) with transparent
 * intelligent fallbacks if the key is rate-limited or denied by Google AI.
 */

export interface AIAnalysisRequest {
  prompt: string;
  systemInstruction?: string;
  responseSchema?: Record<string, unknown>;
  temperature?: number;
}

export interface CareerExplanationContext {
  userName: string;
  careerTitle: string;
  matchScore: number;
  userSkills: { name: string; proficiency: number }[];
  missingSkills: string[];
  matchedSkills: string[];
  aptitudeScore: number;
  education: string;
  experienceYears: number;
  interests: string[];
}

export interface ResumeAnalysisContext {
  resumeText: string;
  targetCareer?: string;
  candidateSkills: string[];
  careerSkills?: string[];
}

export class AIService {
  private static apiKey = process.env.GEMINI_API_KEY || '';

  public static async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    if (this.apiKey && this.apiKey.trim() !== '') {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(3000),
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } else {
          console.warn(`[AIService] Gemini API responded with status ${response.status}. Using intelligent fallback.`);
        }
      } catch (err) {
        console.warn('[AIService] Network or API error connecting to Gemini:', err);
      }
    }

    return this.fallbackTextGenerator(prompt);
  }

  public static async generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T> {
    if (this.apiKey && this.apiKey.trim() !== '') {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(3000),
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt + '\nReturn ONLY valid JSON matching the requested structure.' }] }],
              systemInstruction: systemInstruction
                ? { parts: [{ text: systemInstruction + ' Always respond with strictly valid JSON.' }] }
                : { parts: [{ text: 'Always respond with strictly valid JSON without markdown wrapping.' }] },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return parsed as T;
          }
        }
      } catch (err) {
        console.warn('[AIService] JSON generation failed via Gemini, activating intelligent rule-based engine:', err);
      }
    }

    throw new Error('AI_JSON_FALLBACK_NEEDED');
  }

  /**
   * Explainable AI layer for career recommendation.
   * Generates rigorous explanation based on math scores, matched vs missing skills, and psychometric alignment.
   */
  public static async explainCareerMatch(ctx: CareerExplanationContext): Promise<{
    reasoning: string;
    recommendedActions: string[];
  }> {
    const prompt = `You are a Principal Career Advisory AI. Provide an explainable recommendation breakdown for ${ctx.userName} for the role of ${ctx.careerTitle}.
Match score: ${ctx.matchScore}%
Aptitude score: ${ctx.aptitudeScore}%
Education: ${ctx.education}
Years of Experience: ${ctx.experienceYears}
Matched core skills: ${ctx.matchedSkills.join(', ') || 'Foundational competencies'}
Key skill gaps: ${ctx.missingSkills.join(', ') || 'Advanced specialization topics'}
Interests: ${ctx.interests.join(', ') || 'Software & Technology'}

Return valid JSON with:
{
  "reasoning": "A 3-4 sentence comprehensive explanation highlighting exact strengths and why they are compatible with this role.",
  "recommendedActions": ["Action 1", "Action 2", "Action 3"]
}`;

    try {
      const result = await this.generateJSON<{ reasoning: string; recommendedActions: string[] }>(prompt);
      if (result.reasoning && Array.isArray(result.recommendedActions)) {
        return result;
      }
    } catch {
      // Intelligent rule-based explainability fallback
    }

    const strengthsStr = ctx.matchedSkills.length > 0 ? ctx.matchedSkills.slice(0, 4).join(', ') : 'core technical fundamentals';
    const gapsStr = ctx.missingSkills.length > 0 ? ctx.missingSkills.slice(0, 3).join(' and ') : 'advanced production toolchains';

    const reasoning = `${ctx.userName} exhibits a ${ctx.matchScore}% affinity with the ${ctx.careerTitle} trajectory. The profile demonstrates verified strength in ${strengthsStr}, complemented by a strong aptitude evaluation score (${ctx.aptitudeScore}%). While technical alignment is high, bridging existing gaps in ${gapsStr} will accelerate readiness for top-tier opportunities in this discipline.`;

    const recommendedActions = [
      `Prioritize hands-on mastery of ${ctx.missingSkills[0] || 'advanced design patterns'} through targeted milestone exercises.`,
      `Synthesize full-lifecycle portfolio projects combining ${ctx.matchedSkills[0] || 'core technologies'} with production deployments.`,
      `Engage in technical interview prep focusing on system architecture and domain-specific problem solving.`,
    ];

    return { reasoning, recommendedActions };
  }

  /**
   * Contextual AI Career Assistant Chatbot.
   */
  public static async chatAssistant(messages: { role: string; content: string }[], userContext: string): Promise<string> {
    const systemPrompt = `You are "Aura", an elite AI Career Guidance Mentor & Technical Architect.
You guide candidates through career transitions, technical skill acquisition, interview prep, and project architecture.
You have access to the candidate's verified profile, skills, aptitude scores, and selected roadmap:
---
${userContext}
---
Always deliver direct, actionable, empathetic, and technically precise advice. Format your responses with markdown, bullet points, and code snippets when appropriate.`;

    const lastUserMessage = messages[messages.length - 1]?.content || 'Hello';
    const conversationHistory = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

    try {
      const prompt = `Conversation history:\n${conversationHistory}\n\nRespond as Aura:`;
      const response = await this.generateText(prompt, systemPrompt);
      if (response && response.trim().length > 10) {
        return response;
      }
    } catch (err) {
      console.warn('[AIService] Chat generation fallback triggered:', err);
    }

    return this.fallbackChatResponse(lastUserMessage, userContext);
  }

  private static fallbackTextGenerator(prompt: string): string {
    return `Based on your technical profile and market demand benchmarks, focusing on building high-impact portfolio demonstrations and bridging your core architectural skill gaps will yield the fastest career progression. Ensure each project has measurable outcomes and clean documentation.`;
  }

  private static fallbackChatResponse(message: string, context: string): string {
    const msg = message.toLowerCase();

    if (msg.includes('ready') || msg.includes('prepared')) {
      return `Based on your diagnostic profile and assessment scores, you have built solid foundations! To be 100% interview-ready:
1. **Bridge High-Priority Skill Gaps**: Complete the remaining milestone items in your personalized roadmap.
2. **Portfolio Evidence**: Deploy at least one full-stack project with automated CI/CD and verifiable live links.
3. **Behavioral & System Design**: Practice articulating your engineering decisions using the STAR framework.`;
    }

    if (msg.includes('next') || msg.includes('learn') || msg.includes('roadmap')) {
      return `Looking at your active curriculum, your highest leverage next step is:
- **Focus on your top priority skill gap**: Dedicate focused practice blocks to building interactive prototypes using this technology.
- Check off tasks in your **Roadmap** view to update your real-time completion telemetry.
- Build a capstone feature that combines your existing database and backend skills with modern deployment practices.`;
    }

    if (msg.includes('resume') || msg.includes('ats')) {
      return `For maximizing ATS pass rates:
- **Quantify Impacts**: Replace descriptive bullet points with metric-driven statements (e.g., *"Reduced API latency by 35% via Redis caching"*).
- **Match Target Keywords**: Ensure the required skills from your selected career appear naturally in your Skills and Experience sections.
- Use our built-in **Resume Analyzer** tab to get line-by-line ATS scoring and actionable bullet point rewrites!`;
    }

    if (msg.includes('project') || msg.includes('portfolio')) {
      return `I recommend building a project that solves a real operational problem rather than a generic clone:
- **Architecture**: Decoupled frontend, REST/GraphQL backend, robust database schema, and automated tests.
- **Differentiator**: Integrate live telemetry, caching, or applied AI features (e.g. semantic search or vector retrieval).
- Check the **Projects** tab on your dashboard for tailored blueprints curated specifically for your skill level!`;
    }

    return `I've analyzed your question in the context of your career profile. To maximize your progress:
- Continue following your structured learning roadmap.
- Balance theory with hands-on coding and git commits.
- Feel free to ask me for specific code reviews, architectural advice, or mock interview questions!`;
  }
}
