# CareerAI Retrieval-Augmented Generation (RAG) & Embeddings

## 1. LLM API Abstraction Layer
Located in `src/lib/ai/llmProvider.ts` and `backend/ai/llmProvider.ts`:
- **Interface**: `ILLMProvider`
  - `generateCompletion(prompt: string, options?: LLMOptions): Promise<string>`
  - `generateEmbedding(text: string): Promise<number[]>`
  - `chat(messages: LLMMessage[], systemPrompt?: string): Promise<string>`
- **Providers**:
  - `GeminiProvider`: Google Gemini 1.5 Flash via REST API with strict 3000ms `AbortSignal.timeout`.
  - `OpenAIProvider`: OpenAI GPT-4o-mini & `text-embedding-3-small`.
  - `DeterministicFallbackProvider`: Zero-network deterministic provider using semantic cluster hashing.
  - `LLMProviderFactory`: Automatic cascade fallback ensuring 100% platform availability.

## 2. Embeddings Engine
Located in `src/lib/ai/embeddings.ts`:
- Generates normalized dense semantic vector representations.
- `cosineSimilarity(v1, v2)`: Computes dot-product cosine distance.
- `findMostSimilar(queryVec, docs, topK)`: Ranks candidate documents by vector similarity.

## 3. RAG Service
Located in `src/lib/ai/ragService.ts`:
- **Knowledge Ingestion**: Indexes 20+ tech career tracks, core skill taxonomies, and career guidance playbooks.
- **Context Retrieval**: Vector similarity search retrieving top-$k$ domain contexts.
- **Grounded Answering**: Augments AI assistant system prompt with retrieved context snippets and returns explicit citations.
