'use client'

import { useState } from 'react'

type DayPlan = {
  day: string
  items: string[]
  done?: boolean
}

export default function StudyPlanPage() {
  const [plan, setPlan] = useState<DayPlan[]>([
    { day: 'Day 1', items: ['DSA: Arrays & Strings (60m)', '2 HR questions (20m)', '1 Mock warmup (20m)'] },
    { day: 'Day 2', items: ['DSA: HashMap/Set (60m)', 'Behavioral story: conflict (20m)', 'Revise notes (20m)'] },
    { day: 'Day 3', items: ['System Design: requirements → API (60m)', 'Caching basics (30m)', 'Latency/bandwidth (10m)'] },
    { day: 'Day 4', items: ['DSA: Trees/Graphs (60m)', 'Mock Interview 1 (30m)', 'Retro & notes (30m)'] },
    { day: 'Day 5', items: ['System Design: storage/replication (60m)', 'OS/DB basics (30m)', '1 HR set (15m)'] },
    { day: 'Day 6', items: ['DSA: DP starter (60m)', 'Complexity drills (20m)', 'Mock Interview 2 (30m)'] },
    { day: 'Day 7', items: ['Review weak areas (60m)', 'Behavioral stories polish (30m)', 'Light practice (30m)'] },
  ])

  const markDone = (idx: number) => {
    setPlan((prev) => prev.map((p, i) => (i === idx ? { ...p, done: !p.done } : p)))
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900">Study Plan</h1>
      <p className="text-gray-600 mt-1">Your scheduled plan with day-by-day tasks.</p>

      {/* Today’s focus */}
      <div className="mt-6 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
        <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Today’s Focus</div>
        <div className="mt-1 text-gray-900 font-semibold">System Design: Caching + API boundaries</div>
        <div className="mt-1 text-sm text-gray-600">
          Tip: Define requirements → sketch API → choose storage → add caching → discuss trade-offs.
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {plan.map((p, idx) => (
          <div
            key={p.day}
            className={`rounded-2xl p-5 border shadow-sm transition-colors ${
              p.done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-blue-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{p.day}</h2>
              <button
                onClick={() => markDone(idx)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  p.done
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-700 border-blue-100 hover:bg-blue-50'
                }`}
              >
                {p.done ? 'Done' : 'Mark done'}
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {p.items.map((it) => (
                <li key={it} className="text-sm text-gray-700 list-disc list-inside">
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3">
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">
          Generate Next Week
        </button>
        <button className="px-4 py-2 rounded-lg bg-white text-gray-700 border border-blue-100 hover:bg-blue-50">
          Export Plan
        </button>
      </div>
    </div>
  )
}