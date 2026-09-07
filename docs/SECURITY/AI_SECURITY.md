# 🤖 AI Security & Prompt Guardrails

## 1. Prompt Injection Mitigation
All untrusted candidate inputs (bios, custom messages) are isolated within strict delimiters when constructed into LLM prompts.

## 2. Data Leakage Prevention
External AI API calls only receive anonymized user summaries. Internal database credentials, system instructions, and other candidates' data are isolated.
