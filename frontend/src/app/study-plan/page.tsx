"use client";

import { Suspense, useEffect, useState } from "react";
import { generateNextWeek, type StudyPlan } from "@/api";

type Day = { day: number; date?: string; tasks?: string[]; items?: string[] };

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
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">Weekly Study Plan</h1>
          <div className="flex gap-2">
            <button
              onClick={() => generate(7)}
              className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
              disabled={loading}
            >
              Generate next week
            </button>
            <button
              onClick={() => generate(14)}
              className="px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300"
              disabled={loading}
            >
              Change (2 weeks)
            </button>
          </div>
        </div>

        {err && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">{err}</div>}

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
          {plan.length === 0 && !loading && <div className="text-slate-500">No plan generated.</div>}
        </div>
      </div>
    </div>
  );
}

export default function StudyPlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center">Loading…</div>}>
      <StudyPlanContent />
    </Suspense>
  );
}