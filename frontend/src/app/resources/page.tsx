'use client'

import { useEffect, useState } from 'react'
import { getResources, type Resource } from '@/api'

export default function ResourcesPage() {
  const [active, setActive] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allResources, setAllResources] = useState<Resource[]>([])

  const filters = ['All', 'DSA', 'System Design', 'Behavioral', 'HR', 'Aptitude']

  // Fetch resources on mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getResources()
        setAllResources(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch resources'
        setError(message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  // Fallback resources if API fails
  const defaultResources: Resource[] = [
    {
      id: '1',
      title: 'Top 50 DSA Problems',
      desc: 'Handpicked practice list with approaches & solutions.',
      tags: ['DSA', 'Practice'],
      link: 'https://leetcode.com/explore/',
    },
    {
      id: '2',
      title: 'System Design 101',
      desc: 'CAP, scaling, caching, load balancing, consistency.',
      tags: ['System Design', 'Concepts'],
      link: 'https://github.com/donnemartin/system-design-primer',
    },
    {
      id: '3',
      title: 'Behavioral: STAR Method',
      desc: 'Structure compelling answers with Situation-Task-Action-Result.',
      tags: ['Behavioral'],
    },
    {
      id: '4',
      title: 'Aptitude Refresher',
      desc: 'Quick formulas, patterns, and sample questions.',
      tags: ['Aptitude', 'Quick'],
    },
    {
      id: '5',
      title: 'Mock HR Q&A',
      desc: 'Common HR prompts and how to frame answers.',
      tags: ['HR', 'Interview'],
    },
  ]

  const resources = allResources.length > 0 ? allResources : defaultResources
  const filtered = resources.filter((r) => active === 'All' || r.tags.includes(active))

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
      <p className="text-gray-600 mt-1">Curated links and reading material for interview prep.</p>

      {error && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          {error} - Using cached resources instead.
        </div>
      )}

      {loading && (
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading resources...</p>
        </div>
      )}

      {!loading && (
        <>
      {/* Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
        {filters.map((f) => {
          const isActive = f === active
          return (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-blue-100 hover:bg-blue-50'
              }`}
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* Resource cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filtered.map((r) => (
          <div key={r.id || r.title} className="bg-white rounded-xl p-5 shadow-sm border border-blue-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">{r.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{r.desc}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {r.tags.map((t) => (
                <span key={t} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              {r.link && (
                <a
                  className="text-sm text-blue-600 hover:underline font-medium"
                  href={r.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open
                </a>
              )}
              <button className="text-sm text-gray-600 hover:text-gray-900">Save</button>
            </div>
          </div>
        ))}
      </div>

      {/* Saved & Playlists */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-50">
          <h2 className="font-bold text-gray-900">Saved Items</h2>
          <p className="text-sm text-gray-500 mt-1">You haven’t saved anything yet.</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-50">
          <h2 className="font-bold text-gray-900">Playlists</h2>
          <div className="mt-3 flex flex-col gap-2">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="font-medium text-gray-800">Week 1: DSA + Behavioral</p>
              <p className="text-xs text-gray-500">Arrays, Hashing, 3 STAR stories</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="font-medium text-gray-800">Week 2: System Design</p>
              <p className="text-xs text-gray-500">Requirements, API, Storage, Caching</p>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}