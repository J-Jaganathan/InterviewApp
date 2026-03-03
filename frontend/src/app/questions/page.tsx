'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { getQuestions, Question, markQuestionComplete, unmarkQuestionComplete, getCompletedQuestions } from '@/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Questions Page - Client Component with Suspense
 * Shows DB questions with filtering by q (search) and category
 */

function QuestionsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const category = searchParams.get('category');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [markingComplete, setMarkingComplete] = useState<Set<number>>(new Set());

  // Load completed questions and fetch questions
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch completed questions
        const completedRes = await getCompletedQuestions();
        setCompletedQuestions(new Set(completedRes.completed_questions));

        // Fetch questions
        const res = await getQuestions({
          q: q || undefined,
          category: category || undefined,
          page,
          limit,
        });
        setQuestions(res.items);
        setTotal(res.total);
      } catch (err) {
        setError('Failed to fetch questions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [q, category, page]);

  const handleToggleComplete = async (questionId: number, isCompleted: boolean) => {
    try {
      setMarkingComplete((prev) => new Set(prev).add(questionId));

      if (isCompleted) {
        // Unmark
        await unmarkQuestionComplete(questionId);
        setCompletedQuestions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(questionId);
          return newSet;
        });
      } else {
        // Mark as complete
        await markQuestionComplete(questionId);
        setCompletedQuestions((prev) => new Set(prev).add(questionId));
      }
    } catch (err) {
      console.error('Failed to update question status:', err);
      setError('Failed to update question status');
    } finally {
      setMarkingComplete((prev) => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  // Determine header text
  let headerText = 'All Questions';
  if (q) {
    headerText = `Search: "${q}"`;
  } else if (category) {
    headerText = `Category: ${category}`;
  }

  return (
    <main className="flex-1 overflow-auto bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-slate-900 text-3xl font-bold">{headerText}</h1>
              <p className="text-slate-600">
                {total} question{total !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Right-aligned on desktop, full-width on mobile */}
            <BackToDashboardButton className="w-full md:w-auto md:ml-auto" />
          </div>
        </div>


        {/* Search Form */}
        <form action="/questions" method="GET" className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              name="q"
              placeholder="Search questions..."
              defaultValue={q || ''}
              className="flex-1 px-4 py-2 border border-slate-500 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-slate-900 placeholder-slate-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Search
            </button>
            {(q || category) && (
              <Link
                href="/questions"
                className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition"
              >
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading questions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && questions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg mb-2">No questions found</p>
            <p className="text-slate-500 text-sm">
              Try adjusting your filters or browse all questions
            </p>
          </div>
        )}

        {/* Questions Grid */}
        {!loading && !error && questions.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {questions.map((question) => {
                const isCompleted = completedQuestions.has(question.id);
                const isMarking = markingComplete.has(question.id);
                return (
                <div
                  key={question.id}
                  className={`bg-white border rounded-xl p-4 transition ${
                    isCompleted 
                      ? 'border-green-300 bg-green-50/30' 
                      : 'border-slate-300 hover:border-indigo-300 hover:bg-indigo-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => handleToggleComplete(question.id, isCompleted)}
                        disabled={isMarking}
                        className="mt-0.5 w-5 h-5 rounded cursor-pointer accent-green-600"
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                      />
                      <h3 className={`text-sm font-semibold line-clamp-2 ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                        {question.title}
                      </h3>
                    </div>
                    {question.difficulty && (
                      <span
                        className={`text-xs px-2 py-1 rounded whitespace-nowrap font-medium ${
                          question.difficulty === 'easy'
                            ? 'bg-green-100 text-green-800'
                            : question.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {question.difficulty}
                      </span>
                    )}
                  </div>

                  {question.description && (
                    <p className="text-slate-600 text-xs mb-3 line-clamp-2">
                      {question.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    {question.category && (
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {question.category}
                      </span>
                    )}
                    {question.created_at && (
                      <span className="text-xs text-slate-400">
                        {new Date(question.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* External Links */}
                  <div className="flex gap-2 pt-3 border-t border-slate-200">
                    <a
                      href={`https://leetcode.com/search/?q=${encodeURIComponent(question.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-2 py-1.5 text-xs font-medium bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100 transition"
                    >
                      LeetCode
                    </a>
                    <a
                      href={`https://www.geeksforgeeks.org/problems/?search=${encodeURIComponent(question.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-2 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded hover:bg-green-100 transition"
                    >
                      GeeksforGeeks
                    </a>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/questions?q=${q || ''}&category=${category || ''}&page=${page - 1}`}
                    className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-slate-600">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                {page < Math.ceil(total / limit) && (
                  <Link
                    href={`/questions?q=${q || ''}&category=${category || ''}&page=${page + 1}`}
                    className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function BackToDashboardButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 hover:border-slate-400 active:bg-slate-200 transition-colors ${className}`}
      aria-label="Go to Dashboard"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Go to Dashboard</span>
    </button>
  );
}
export default function QuestionsPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-slate-50 p-6">Loading...</div>}>
      <QuestionsContent />
    </Suspense>
  );
}
