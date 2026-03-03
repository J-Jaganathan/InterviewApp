"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateNextWeek, type StudyPlan } from "@/api";

type Day = { day: number; date?: string; tasks?: string[]; items?: string[] };

/** Reusable: Go to Dashboard button (responsive) */
function BackToDashboardButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/")}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 hover:border-slate-400 active:bg-slate-200 transition-colors ${className}`}
      aria-label="Go to Dashboard"
      type="button"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Go to Dashboard</span>
    </button>
  );
}

function StudyPlanContent() {
  const [plan, setPlan] = useState<Day[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function generate(days = 7) {
    setLoading(true);
    setErr(null);
    try {
      const data: StudyPlan = await generateNextWeek(days);
      const normalized: Day[] = (data?.plan || []).map((d) => ({
        day: Number(d.day),
        date: d.date,
        tasks: d.tasks || d.items || [],
      }));
      setPlan(normalized);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    generate(7);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header: title on the left; actions on the right.
            Inside the actions row, place "Go to Dashboard" at LEFT of "Generate next week". */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Weekly Study Plan</h1>

          {/* Actions: stack on mobile; inline on desktop */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:justify-end">
            {/* ← Go to Dashboard (left) */}
            <BackToDashboardButton className="w-full sm:w-auto" />

            {/* Generate next week (blue) */}
            <button
              onClick={() => generate(7)}
              className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60 w-full sm:w-auto"
              disabled={loading}
              type="button"
            >
              {loading ? "Generating…" : "Generate next week"}
            </button>

            {/* Change 2 weeks (black) */}
            <button
              onClick={() => generate(14)}
              className="px-3 py-2 rounded-lg bg-black text-white hover:bg-neutral-800 disabled:opacity-60 w-full sm:w-auto"
              disabled={loading}
              type="button"
            >
              Change (2 weeks)
            </button>
          </div>
        </div>

        {err && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">Error: {err}</div>
        )}

        <div className="grid gap-4">
          {plan.map((d) => (
            <div key={d.day} className="bg-white rounded-lg p-6 border border-slate-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Day {d.day}
                {d.date ? ` — ${d.date}` : ""}
              </h2>
              <ul className="space-y-2">
                {(d.tasks || []).map((item, i) => (
                  <li key={i} className="text-gray-600">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {plan.length === 0 && !loading && (
            <div className="text-slate-500">No plan generated.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudyPlanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">Loading…</div>
      }
    >
      <StudyPlanContent />
    </Suspense>
  );
}
``