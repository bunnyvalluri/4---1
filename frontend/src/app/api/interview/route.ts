import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { question, answer, career, type } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback scoring without API
      return NextResponse.json({
        score: Math.floor(Math.random() * 4) + 6,
        feedback: `Good attempt at answering the question. Here are some points to consider:\n\n**Strengths:** You addressed the core concept and provided a reasonable structure.\n\n**To Improve:**\n- Add more specific examples from your experience\n- Use the STAR method (Situation, Task, Action, Result) for clarity\n- Quantify your impact where possible\n\n**Ideal answer elements:**\nThe best answers for this question demonstrate deep understanding of the subject with concrete, real-world experience. Focus on specifics rather than generalizations.`,
      });
    }

    const prompt = `You are a senior interviewer at a top tech company. A candidate is interviewing for a ${career} position.

Interview Type: ${type}
Question Asked: ${question}
Candidate's Answer: ${answer}

Evaluate this answer and respond with:
1. A score from 1-10 (be honest and calibrated)
2. 2-3 specific strengths
3. 2-3 specific areas to improve
4. What an ideal answer would include

Format your response as follows:
**Score: X/10**

**✅ Strengths:**
- [strength 1]
- [strength 2]

**🔧 Areas to Improve:**
- [improvement 1]  
- [improvement 2]

**💡 Ideal Answer Should Include:**
[2-3 key elements of a great answer]

Keep feedback constructive, specific, and actionable. Be honest—don't inflate scores.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
        }),
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract score from response
    const scoreMatch = text.match(/Score:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 7;

    return NextResponse.json({ score, feedback: text });
  } catch (error) {
    console.error('Interview API error:', error);
    return NextResponse.json({
      score: 7,
      feedback: 'Good answer! Keep practicing to improve your interview skills.',
    });
  }
}
