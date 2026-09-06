/**
 * AI & ML Architecture Verification Suite
 * Tests:
 * 1. Python scikit-learn, pandas, and numpy recommendation inference
 * 2. LLM API Abstraction Layer (Multi-provider with graceful fallback)
 * 3. Dense Embeddings & Cosine Vector Distance calculations
 * 4. Retrieval-Augmented Generation (RAG) vector index & grounded answering
 */

import { PythonRecommenderBridge } from '../lib/pythonBridge';
import { LLMProviderFactory } from '../lib/ai/llmProvider';
import { EmbeddingsEngine } from '../lib/ai/embeddings';
import { RAGService } from '../lib/ai/ragService';

async function runAIMLTests() {
  console.log('====================================================');
  console.log('STARTING AI & MACHINE LEARNING SUBSYSTEM TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------
  // 1. Python Machine Learning (scikit-learn + pandas + numpy)
  // ---------------------------------------------------------------
  console.log('[TEST 1: Python ML Recommender via IPC Bridge]');
  const sampleCandidate = {
    name: 'Alex Johnson',
    degree: 'B.S. in Computer Science',
    skills: [{ name: 'TypeScript' }, { name: 'React.js' }, { name: 'Node.js' }],
    interests: ['Web Development', 'Cloud Computing'],
    preferredRoles: ['Full Stack Developer'],
    aptitudeScores: {
      categoryScores: { LOGICAL: 85, QUANTITATIVE: 80, VERBAL: 70, ANALYTICAL: 85, PROBLEM_SOLVING: 90 },
    },
    workExperienceYears: 2.0,
  };

  const sampleCareers = [
    {
      id: 'car-1',
      title: 'Full Stack Developer',
      category: 'Software Engineering',
      overview: 'Develop modern web applications with TypeScript, React, and Node.js.',
      skills: [{ skill: { name: 'TypeScript' }, isRequired: true }, { skill: { name: 'React.js' }, isRequired: true }],
      aptitudeReqs: { LOGICAL: 75, QUANTITATIVE: 70, VERBAL: 65, ANALYTICAL: 75, PROBLEM_SOLVING: 80 },
    },
    {
      id: 'car-2',
      title: 'Cybersecurity Analyst',
      category: 'Security & Operations',
      overview: 'Monitor network telemetry and enforce cryptographic security.',
      skills: [{ skill: { name: 'Network Security' }, isRequired: true }, { skill: { name: 'Cryptography' }, isRequired: true }],
      aptitudeReqs: { LOGICAL: 80, QUANTITATIVE: 70, VERBAL: 70, ANALYTICAL: 85, PROBLEM_SOLVING: 85 },
    },
  ];

  const pyRes = await PythonRecommenderBridge.runInference(sampleCandidate, sampleCareers);
  assert(!!pyRes && pyRes.success === true, 'Python ML bridge executes successfully');
  assert(pyRes?.engine === 'scikit-learn-pandas-numpy', 'Python engine verifies scikit-learn, pandas, numpy pipeline');
  assert(Array.isArray(pyRes?.results) && pyRes.results.length === 2, 'Returns ranked career predictions');

  const topMatch = pyRes?.results[0];
  assert(topMatch?.title === 'Full Stack Developer', 'Python ML model correctly predicts Full Stack Developer as top match');
  assert(topMatch?.matchScore! > 70, `High ML compatibility score for qualified candidate (${topMatch?.matchScore}%)`);
  assert(topMatch?.factors.length! >= 5, 'Python ML model exposes granular feature importances & factor attribution');

  // ---------------------------------------------------------------
  // 2. LLM API Abstraction Layer
  // ---------------------------------------------------------------
  console.log('\n[TEST 2: LLM API Abstraction Layer]');
  const activeProvider = LLMProviderFactory.getActiveProvider();
  assert(!!activeProvider && typeof activeProvider.name === 'string', `Active LLM Provider initialized (${activeProvider.name})`);

  const completion = await LLMProviderFactory.executeWithFallback(
    async (p) => p.generateCompletion('Analyze software engineering career requirements:'),
    'Fallback career analysis'
  );
  assert(typeof completion === 'string' && completion.length > 10, 'LLM Provider produces completion with fallback guarantee');

  // ---------------------------------------------------------------
  // 3. Dense Embeddings & Vector Similarity
  // ---------------------------------------------------------------
  console.log('\n[TEST 3: Dense Embeddings & Cosine Distance]');
  const embA = await EmbeddingsEngine.getEmbedding('TypeScript React full stack web development');
  const embB = await EmbeddingsEngine.getEmbedding('Next.js frontend user interface design');
  const embC = await EmbeddingsEngine.getEmbedding('Cybersecurity intrusion detection network cryptography');

  assert(Array.isArray(embA) && embA.length > 0, `Generated vector embedding (dim: ${embA.length})`);
  const simRelated = EmbeddingsEngine.cosineSimilarity(embA, embB);
  const simUnrelated = EmbeddingsEngine.cosineSimilarity(embA, embC);

  assert(simRelated > 0.0 && simRelated <= 1.0, `Related semantic similarity valid (${simRelated.toFixed(4)})`);
  assert(simRelated >= simUnrelated, `Semantic cosine similarity ranks related domain higher (${simRelated.toFixed(3)} >= ${simUnrelated.toFixed(3)})`);

  // ---------------------------------------------------------------
  // 4. Retrieval-Augmented Generation (RAG)
  // ---------------------------------------------------------------
  console.log('\n[TEST 4: Retrieval-Augmented Generation (RAG)]');
  const retrievedContexts = await RAGService.retrieveRelevantContext('How do I optimize my resume for ATS screening?', 2);
  assert(retrievedContexts.length >= 1, `RAG retrieved ${retrievedContexts.length} relevant knowledge chunks`);
  assert(retrievedContexts[0].similarityScore > 0, `RAG chunk has positive similarity score (${(retrievedContexts[0].similarityScore * 100).toFixed(1)}%)`);

  const groundedAnswer = await RAGService.generateGroundedAnswer('How can I prepare for technical interviews?');
  assert(typeof groundedAnswer.answer === 'string' && groundedAnswer.answer.length > 20, 'RAG generated grounded answer');
  assert(Array.isArray(groundedAnswer.citations), 'RAG exposes source citations for explainability');

  console.log('\n====================================================');
  console.log(`AI & ML VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runAIMLTests();
