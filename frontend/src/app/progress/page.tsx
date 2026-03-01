'use client'

import { useEffect, useMemo, useState } from 'react'
import { getProgress, type ProgressData } from '@/api'

function ProgressRing({ percentage }: { percentage: number }) {
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={50} fill="none" stroke="#e8eeff" strokeWidth="10" />
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
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-extrabold text-gray-900">{percentage}%</span>
        <div className="text-xs text-gray-400">Overall</div>
      </div>
    </div>
  )
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progressData, setProgressData] = useState<ProgressData | null>(null)

  // Fetch progress data on mount
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getProgress()
        setProgressData(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch progress'
        setError(message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  // Use defaults while loading
  const sessionsCompleted = progressData?.sessionsCompleted ?? 12
  const totalSessions = progressData?.totalSessions ?? 20
  const avgScore = progressData?.avgScore ?? 86
  const currentStreak = progressData?.currentStreak ?? 4
  const overallPct = progressData?.overall ?? Math.round((sessionsCompleted / totalSessions) * 100)
  const cats = progressData?.categoryBreakdown ?? [
    { label: 'HR', percentage: 82 },
    { label: 'Technical', percentage: 73 },
    { label: 'Behavioral', percentage: 90 },
    { label: 'System Design', percentage: 65 },
    { label: 'Aptitude', percentage: 58 },
    { label: 'DSA', percentage: 76 },
  ]
  const recommendations = progressData?.recommendations ?? [
    'Practice DSA: Arrays & Hashing',
    'System Design: Caching strategies',
    'Behavioral: STAR story bank',
    'HR: Strengths/Weaknesses drill',
    'Technical: Big-O quick test',
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading progress...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Error: {error}
        </div>
      </div>
    )
  }







  
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress</h1>
          <p className="text-gray-600 mt-1">See your progress and what to focus on next.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Goal:</span>
          <span className="font-semibold text-gray-900">{totalSessions} sessions</span>
        </div>
      </div>

      {/* Top grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Overall ring */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 flex items-center justify-center">
          <ProgressRing percentage={overallPct} />
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-4 lg:col-span-2">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50">
            <div className="text-sm text-gray-500">Sessions Done</div>
            <div className="text-3xl font-extrabold text-gray-900 mt-1">{sessionsCompleted}</div>
            <div className="mt-4 h-2 bg-blue-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {sessionsCompleted}/{totalSessions} completed
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50">
            <div className="text-sm text-gray-500">Average Score</div>
            <div className="text-3xl font-extrabold text-blue-600 mt-1">{avgScore}%</div>
            <div className="mt-4 h-2 bg-blue-50 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${avgScore}%` }} />
            </div>
            <div className="mt-2 text-xs text-gray-400">vs. target 85%</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-50">
            <div className="text-sm text-gray-500">Current Streak</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">{currentStreak} days</div>
            <div className="mt-4 h-2 bg-emerald-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(currentStreak * 20, 100)}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-400">Keep the momentum!</div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 mt-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-bold text-gray-900 text-lg">Breakdown by Category</h2>
          <span className="text-xs text-gray-500">
            Tip: Prioritize anything below <span className="font-semibold text-gray-700">70%</span>
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {cats.map((c) => (
            <div key={c.label} className="p-4 rounded-xl bg-blue-50">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">{c.label}</span>
                <span className="font-bold text-blue-700">{c.percentage}%</span>
              </div>
              <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${c.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50 mt-6">
        <h2 className="font-bold text-gray-900 text-lg mb-3">Recommended Next Steps</h2>
        <div className="flex flex-wrap gap-2">
          {recommendations.map((s) => (
            <span
              key={s}
              className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm border border-blue-100"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}