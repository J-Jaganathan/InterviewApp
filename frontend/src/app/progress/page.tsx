"use client";

import { Suspense, useEffect, useState } from "react";
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
        <span className="text-3xl font-extrabold text-gray-900">{clamped}%</span>
        <div className="text-xs text-gray-400">Overall</div>
      </div>
    </div>
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading progress...</p>
        </div>
      </div>
    );

  if (err)
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">Error: {err}</div>
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="text-slate-500">No progress yet.</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">Your Progress</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-center">
            <ProgressRing percentage={data.overall} />
          </div>
          <Kpi title="Sessions Completed" value={`${data.sessionsCompleted}`} />
          <Kpi title="Total Sessions" value={`${data.totalSessions}`} />
          <Kpi title="Avg Score" value={`${data.avgScore}%`} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h2 className="font-semibold mb-4">By Category</h2>
          <ul className="space-y-2">
            {data.categoryBreakdown.map((c) => (
              <li key={c.label} className="flex items-center gap-3 text-sm">
                <span className="w-32 text-slate-600">{c.label}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded">
                  <div className="h-2 bg-indigo-500 rounded" style={{ width: `${c.percentage}%` }} />
                </div>
                <span className="w-14 text-right font-semibold">{c.percentage}%</span>
              </li>
            ))}
            {data.categoryBreakdown.length === 0 && (
              <li className="text-slate-400 text-sm">No solved items yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <div className="text-slate-500 text-sm">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <ProgressContent />
    </Suspense>
  );
}