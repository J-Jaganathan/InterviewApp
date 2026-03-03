"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProgress, type ProgressData } from "@/api";

function ProgressRing({ percentage }: { percentage: number }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={50} fill="none" stroke="#e8eeff" strokeWidth="10" />
        {clamped > 0 && (
          <circle
            cx="55"
            cy="55"
            r={50}
            fill="none"
            stroke="#1a3bcc"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 55 55)"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        )}
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-extrabold text-slate-900">{clamped}%</span>
        <div className="text-xs text-slate-600">Overall</div>
      </div>
    </div>
  );
}

function BackToDashboardButton({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/")}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 hover:border-slate-400 active:bg-slate-200 transition-colors ${className}`}
      aria-label="Go to Dashboard"
    >
      {/* Left chevron */}
      <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Go to Dashboard</span>
    </button>
  );
}

function ProgressContent() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const d = await getProgress();
        setData(d);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load progress");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {/* Back button row */}
          <div className="mb-4">
            {/* Full-width on mobile, inline on md+ */}
            <BackToDashboardButton className="w-full md:w-auto" />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            <p className="mt-4 text-slate-700">Loading progress...</p>
          </div>
        </div>
      </div>
    );

  if (err)
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <BackToDashboardButton className="w-full md:w-auto" />
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Error: {err}
          </div>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <BackToDashboardButton className="w-full md:w-auto" />
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="text-slate-700">No progress yet.</div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Top row: Back + Title (stack on mobile) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 order-1">Your Progress</h1>
          <BackToDashboardButton className="order-2 w-full md:w-auto md:ml-auto" />
        </div>


        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-300 flex items-center justify-center">
            <ProgressRing percentage={data.overall} />
          </div>
          <Kpi title="Sessions Completed" value={`${data.sessionsCompleted}`} />
          <Kpi title="Total Sessions" value={`${data.totalSessions}`} />
          <Kpi title="Avg Score" value={`${data.avgScore}%`} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-slate-300">
          <h2 className="font-semibold text-slate-900 mb-4">By Category</h2>
          <ul className="space-y-2">
            {data.categoryBreakdown.map((c) => (
              <li key={c.label} className="flex items-center gap-3 text-sm">
                <span className="w-32 text-slate-700">{c.label}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded">
                  <div className="h-2 bg-indigo-500 rounded" style={{ width: `${c.percentage}%` }} />
                </div>
                <span className="w-14 text-right font-semibold text-slate-900">{c.percentage}%</span>
              </li>
            ))}
            {data.categoryBreakdown.length === 0 && (
              <li className="text-slate-600 text-sm">No solved items yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-300">
      <div className="text-slate-600 text-sm">{title}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
          Loading…
        </div>
      }
    >
      <ProgressContent />
    </Suspense>
  );
}