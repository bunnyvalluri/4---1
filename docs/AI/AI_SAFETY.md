# 🛡️ AI Safety, Guardrails & Moderation

## 1. Hallucination Mitigation
- System instructions strictly forbid recommending fabricated tools or fake salary benchmarks.
- Fallback to curated platform career database when generative confidence is low.

---

## 2. Prompt Injection Defense
- User input is wrapped within explicit boundary delimiters (`User Question: <text>`).
- System instructions explicitly mandate ignoring user attempts to override safety rules or system prompts.

---

## 3. PII Redaction
- Resumes undergo sanitization; Social Security Numbers and phone patterns are filtered before external LLM calls.
