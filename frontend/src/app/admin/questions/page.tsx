'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  X,
  Filter,
  AlertCircle,
  Layers,
} from 'lucide-react';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([
    {
      id: 'q-1',
      category: 'LOGICAL',
      question_text: 'If all Zips are Zaps and some Zaps are Zops, are all Zips definitely Zops?',
      options: ['Yes, definitely', 'No, not necessarily', 'Only if Zaps are unique', 'Cannot be evaluated'],
      correct_answer: 1,
      difficulty: 'Medium',
      explanation: 'Syllogistic logic requires direct subset relationships which are not fully transitive here.',
    },
    {
      id: 'q-2',
      category: 'QUANTITATIVE',
      question_text: 'A model processes 1,200 tokens/sec. With 4 distributed workers and 10% overhead, what is throughput?',
      options: ['4,320 tokens/sec', '4,800 tokens/sec', '3,900 tokens/sec', '5,200 tokens/sec'],
      correct_answer: 0,
      difficulty: 'Hard',
      explanation: '4 * 1200 = 4800; subtracting 10% (480) yields 4,320 tokens/sec.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState('LOGICAL');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [difficulty, setDifficulty] = useState('Medium');
  const [explanation, setExplanation] = useState('');

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const newQuestion = {
      id: `q-${Date.now()}`,
      category,
      question_text: questionText.trim(),
      options,
      correct_answer: Number(correctAnswer),
      difficulty,
      explanation,
    };

    setQuestions([newQuestion, ...questions]);
    setShowAddModal(false);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setExplanation('');
    setSuccessMsg('Question successfully added to bank.');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const filtered = questions.filter(
    (q) => categoryFilter === 'ALL' || q.category === categoryFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Question Bank</h1>
          <p className="text-xs text-slate-500 mt-1">
            Curate psychometric, quantitative, and logical aptitude questions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Question</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'LOGICAL', 'QUANTITATIVE', 'VERBAL', 'ANALYTICAL', 'PROBLEM_SOLVING'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              categoryFilter === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filtered.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {q.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {q.difficulty}
                </span>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-900 leading-relaxed">{q.question_text}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {q.options.map((opt: string, optIdx: number) => (
                <div
                  key={optIdx}
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                    optIdx === q.correct_answer
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 bg-white border">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{opt}</span>
                  {optIdx === q.correct_answer && (
                    <span className="ml-auto text-[10px] font-bold text-emerald-700 uppercase">
                      Correct
                    </span>
                  )}
                </div>
              ))}
            </div>

            {q.explanation && (
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-700">Explanation: </span>
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Create Aptitude Question
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="LOGICAL">Logical Reasoning</option>
                    <option value="QUANTITATIVE">Quantitative Aptitude</option>
                    <option value="VERBAL">Verbal Reasoning</option>
                    <option value="ANALYTICAL">Analytical Aptitude</option>
                    <option value="PROBLEM_SOLVING">Problem Solving</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Prompt</label>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the complete question prompt..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Answer Options & Correct Key</label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={correctAnswer === idx}
                      onChange={() => setCorrectAnswer(idx)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-bold text-slate-500 w-4">{String.fromCharCode(65 + idx)}</span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rationale / Explanation</label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why the selected option is correct..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
