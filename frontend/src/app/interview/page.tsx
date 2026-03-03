'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function InterviewStartContent() {
  const search = useSearchParams();
  const router = useRouter();
  const now = new Date().toLocaleString();
  const via = search.get('via') ?? undefined;
  const role = search.get('role') ?? undefined;
  const company = search.get('company') ?? undefined;

  function handleStart() {
    // Redirect to session with same query params
    const params = new URLSearchParams();
    if (via) params.set('via', via);
    if (role) params.set('role', role);
    if (company) params.set('company', company);
    router.push(`/interview/session?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white border border-blue-50 rounded-2xl p-8 shadow-lg max-w-md w-full">
        {/* Hero / Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mock Interview</h1>
          <p className="text-gray-600">
            {via === 'resume' 
              ? 'Starting interview based on your uploaded resume'
              : `Starting interview for ${role || 'Interview Session'} at ${company || now}`
            }
          </p>
        </div>

        {/* Instructions */}
        <ul className="text-sm text-gray-600 mb-6 list-disc ml-5 space-y-2">
          <li>This session will randomly pick <strong>10 questions</strong> from our question bank.</li>
          <li>Type your answers and click <strong>Save</strong> or go to the next question.</li>
          <li>You can come back and edit any answer before finishing.</li>
        </ul>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Start Interview
        </button>
      </div>
    </div>
  );
}

export default function InterviewStartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InterviewStartContent />
    </Suspense>
  );
}
