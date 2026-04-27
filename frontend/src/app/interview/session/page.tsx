"use client";

import { Suspense, useState } from "react";
import { getRandomQuestions, type Question } from "@/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VideoRecorder from "@/components/VideoRecorder";

const uuid = () =>
  crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Helper component for the result phase
function Tile({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">
        {title}
      </div>
      <div className="text-lg font-semibold text-slate-800 mt-1">{value}</div>
    </div>
  );
}

function InterviewSessionContent() {
  const router = useRouter();

  const [phase, setPhase] = useState<"intro" | "run" | "result">("intro");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [idx, setIdx] = useState(0);

  // For the (frontend-only) video preview; just create a stable token per run
  const [recordingSessionId, setRecordingSessionId] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    try {
      const qs = await getRandomQuestions(10);
      if (!Array.isArray(qs) || qs.length === 0)
        throw new Error("No questions available.");

      // Create a new run token (not used by the recorder for uploads; purely for lifecycle)
      const rsid = uuid();
      setRecordingSessionId(rsid);

      setQuestions(qs);
      setAnswers({});
      setIdx(0);
      setPhase("run");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to start interview");
    } finally {
      setLoading(false);
    }
  }

  function saveAnswer(qid: number, text: string) {
    setAnswers((prev) => ({ ...prev, [qid]: text }));
  }

  function next() {
    if (idx < questions.length - 1) setIdx(idx + 1);
    else setPhase("result");
  }

  function prev() {
    if (idx > 0) setIdx(idx - 1);
  }

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Mock Interview — Session
            </h1>
            <div className="text-slate-300 mb-8 space-y-2">
              <p>
                This session picks <b>10 random questions</b> from the question
                bank.
              </p>
              <p>
                Type your answers, click <b>Save &amp; Next</b>. You can go back
                anytime.
              </p>
            </div>
            <button
              onClick={handleStart}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? "Starting..." : "Start Interview"}
            </button>
            <div className="mt-6">
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "run" && questions.length > 0) {
    const q = questions[idx];
    return (
      // NOTE: added pb-44 so the floating preview never overlaps the CTA row
      <div className="min-h-screen bg-slate-100 p-8 pb-44">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-slate-800">
              Question {idx + 1} of {questions.length}
            </h2>
            <div className="text-slate-500 text-sm uppercase tracking-wide font-medium">
              {q.category} · {q.difficulty}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="font-bold text-lg mb-3 text-slate-900">
              {q.title}
            </div>
            {q.description && (
              <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                {q.description}
              </div>
            )}
          </div>

          <textarea
            className="w-full h-48 p-4 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800"
            placeholder="Type your structured answer here..."
            value={answers[q.id] || ""}
            onChange={(e) => saveAnswer(q.id, e.target.value)}
          />

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={prev}
              disabled={idx === 0}
              className="px-5 py-2 rounded-lg bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={next}
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-100 transition-all"
            >
              {idx < questions.length - 1 ? "Save & Next" : "Finish Interview"}
            </button>
          </div>

          {/* Floating, frontend-only camera preview (small, bottom-right) */}
          {recordingSessionId && (
            <VideoRecorder
              interviewSessionId={recordingSessionId}
              size="sm"
              onReady={() => console.log("camera on")}
              onError={(e) => console.warn("camera error:", e)}
              onStopped={({ durationMs }) =>
                console.log("camera stopped, duration(ms):", durationMs)
              }
            />
          )}
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const answered = Object.keys(answers).length;
    const total = questions.length;
    const categories = new Map<string, number>();
    questions.forEach((q) => {
      const cat = q.category || "Uncategorized";
      categories.set(cat, (categories.get(cat) || 0) + 1);
    });

    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">Session Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Tile title="Answered" value={`${answered}/${total}`} />
            <Tile title="Coverage" value={`${categories.size} Categories`} />
            <Tile title="Next Step" value="Review responses" />
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="font-bold text-slate-900 mb-3">Improvement Plan</div>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-3 leading-relaxed">
              <li>Review model answers for your weak responses.</li>
              <li>Re-attempt 5 questions in your lowest-scoring category.</li>
              <li>Capture notes and schedule a 20‑minute retro for tomorrow.</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/"
              className="px-5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => {
                setPhase("intro");
                setQuestions([]);
                setAnswers({});
                setIdx(0);
                setRecordingSessionId(null);
              }}
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all"
            >
              Start Another Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Main export with Suspense boundary
export default function InterviewSession() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-slate-500">Loading session...</div>}
    >
      <InterviewSessionContent />
    </Suspense>
  );
}