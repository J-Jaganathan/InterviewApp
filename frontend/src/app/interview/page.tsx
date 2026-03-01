'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'

const SAVE_MODE: 'none' | 'download' | 'upload' = 'none'

type QA = {
  questionId: string
  text?: string
  saved?: boolean
  fileName?: string
  uploaded?: boolean
  uploadId?: string
}

// Full master list stays here
const QUESTION_BANK = [
  "Tell me about yourself and your background.",
  "What motivated you to choose this field of study?",
  "Explain your final year project in simple terms.",
  "What was the biggest challenge you faced during your project, and how did you solve it?",
  "What new things did you learn during your college or internship?",
  "Tell me about a time you worked in a team — what was your contribution?",
  "Describe a situation where you learned something quickly to complete a task.",
  "What do you do when you get stuck on a problem?",
  "Explain a technical concept you recently learned (like OOP, APIs, or DBMS).",
  "What programming languages are you most comfortable with?",
  "Explain the difference between a bug and an error.",
  "What steps do you follow while debugging?",
  "Explain OOPS concepts with real‑life examples.",
  "What is the difference between SQL and NoSQL databases?",
  "Explain REST API in simple words.",
  "What is version control, and why is Git important?",
  "Tell me about a situation where you managed time effectively.",
  "How do you handle pressure or deadlines?",
  "Tell me about a time you failed — what did you learn from it?",
  "Why should we hire you as a fresher?",
  "Where do you see yourself in the next 3 years?",
  "What are your strengths and weaknesses?",
  "Why do you want to join this company?",
  "Do you prefer working alone or in a team?",
  "Tell me about a time you solved a problem creatively.",
  "Explain a concept you taught someone — how did you break it down?",
  "How do you stay updated with technology?",
  "What is one achievement you are proud of?",
  "How do you handle feedback or criticism?",
  "What are your expectations from your first job?",
]

// --- Helpers ---
function sampleUnique<T>(arr: T[], k: number): T[] {
  // Fisher–Yates shuffle (partial) for efficiency
  const a = arr.slice()
  const n = Math.min(k, a.length)
  for (let i = a.length - 1; i > a.length - 1 - n; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(a.length - n)
}

export default function InterviewSessionPage() {
  const search = useSearchParams()
  const router = useRouter()
  const via = search.get('via')
  const role = search.get('role')
  const company = search.get('company')

  // We will fill this once the user clicks "Start"
  const [questions, setQuestions] = useState<string[]>([])
  const [started, setStarted] = useState(false)
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<QA[]>([])
  const [buffer, setBuffer] = useState('')
  const [saving, setSaving] = useState(false)
  const [showSavedToast, setShowSavedToast] = useState(false)

  const isLast = questions.length > 0 && idx === questions.length - 1
  const currentQ = questions[idx] || ''

  React.useEffect(() => {
    if (!started) return
    setBuffer(answers[idx]?.text || '')
  }, [idx, started]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = () => {
    // Pick 10 unique random questions every time
    const picked = sampleUnique(QUESTION_BANK, 10)
    setQuestions(picked)
    setAnswers(picked.map((_, i) => ({ questionId: `q${i + 1}` })))
    setIdx(0)
    setBuffer('')
    setStarted(true)
  }

  const doDownload = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const saveCurrent = async () => {
    setSaving(true)
    try {
      const fileName = `answer-q${idx + 1}-${Date.now()}.txt`
      const trimmed = buffer.trim()
      if (SAVE_MODE === 'none') {
        setAnswers(prev => {
          const copy = [...prev]
          copy[idx] = { ...copy[idx], text: trimmed, saved: true, fileName }
          return copy
        })
      } else if (SAVE_MODE === 'download') {
        doDownload(fileName, trimmed)
        setAnswers(prev => {
          const copy = [...prev]
          copy[idx] = { ...copy[idx], text: trimmed, saved: true, fileName }
          return copy
        })
      } else {
        const fd = new FormData()
        fd.append('questionId', `q${idx + 1}`)
        fd.append('fileName', fileName)
        fd.append('text', trimmed)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        setAnswers(prev => {
          const copy = [...prev]
          copy[idx] = {
            ...copy[idx],
            text: trimmed,
            saved: true,
            fileName: data.fileName || fileName,
            uploaded: true,
            uploadId: data.id || undefined,
          }
          return copy
        })
      }
      setShowSavedToast(true)
      setTimeout(() => setShowSavedToast(false), 1400)
    } catch (e) {
      console.error(e)
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const goNext = async () => {
    if (!answers[idx]?.saved && buffer.trim().length > 0) {
      await saveCurrent()
    }
    setIdx(i => Math.min(questions.length - 1, i + 1))
  }
  const goPrev = () => setIdx(i => Math.max(0, i - 1))

  const finishInterview = async () => {
    if (!answers[idx]?.saved && buffer.trim().length > 0) {
      await saveCurrent()
    }
    router.push('/')
  }

  const canGoNext = (answers[idx]?.saved || buffer.trim().length > 0)

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-blue-50 px-6 py-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mock Interview – Session</h1>
        <button onClick={() => router.push('/')} className="text-sm text-blue-600 hover:text-blue-700">Exit</button>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {!started && (
          <div className="bg-white border border-blue-50 rounded-2xl p-6 mb-6">
            <div className="mb-3">
              {via === 'resume' ? (
                <p className="text-gray-700">Starting interview based on your uploaded resume…</p>
              ) : (
                <p className="text-gray-700">
                  Starting interview for <span className="font-semibold">{role}</span> at{' '}
                  <span className="font-semibold">{company}</span>.
                </p>
              )}
            </div>
            <ul className="text-sm text-gray-600 mb-4 list-disc ml-5 space-y-1">
              <li>This session will randomly pick <strong>10 questions</strong> from a larger bank.</li>
              <li>Type your answers and click <strong>Save</strong> or go to the next question.</li>
              <li>You can come back and edit any answer before finishing.</li>
            </ul>
            <div className="flex gap-2">
              <button
                onClick={handleStart}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Start Interview
              </button>
            </div>
          </div>
        )}

        {started && (
          <div className="space-y-6">
            <div className="bg-white border border-blue-50 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">Question {idx + 1} / {questions.length}</p>
                <div className="w-48 h-2 bg-blue-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${Math.round((idx / questions.length) * 100)}%` }}
                  />
                </div>
              </div>

              <p className="text-gray-900 font-medium mb-3">{currentQ}</p>

              <div className="space-y-3">
                <textarea
                  value={buffer}
                  onChange={(e) => setBuffer(e.target.value)}
                  className="w-full min-h-40 md:min-h-48 border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your answer here..."
                />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {answers[idx]?.saved ? (
                      <span className="text-green-600 font-medium">Saved</span>
                    ) : buffer.trim().length > 0 ? (
                      <span className="text-gray-500">Unsaved changes</span>
                    ) : (
                      <span>Start typing your answer…</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={saveCurrent}
                      disabled={saving || buffer.trim().length === 0}
                      className={`px-4 py-2 text-sm rounded-lg font-semibold ${
                        buffer.trim().length > 0
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={goPrev}
                  disabled={idx === 0}
                  className={`px-4 py-2 text-sm rounded-lg border ${
                    idx === 0 ? 'text-gray-400 border-gray-200' : 'hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>

                {!isLast ? (
                  <button
                    onClick={goNext}
                    disabled={!canGoNext || saving}
                    className={`px-4 py-2 text-sm rounded-lg font-semibold ${
                      canGoNext && !saving
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={finishInterview}
                    disabled={saving}
                    className={`px-4 py-2 text-sm rounded-lg font-semibold ${
                      !saving ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Finish Interview
                  </button>
                )}
              </div>
            </div>

            {showSavedToast && (
              <div className="fixed bottom-6 right-6">
                <div className="bg-white border border-green-200 shadow-lg rounded-lg px-4 py-3 flex items-center gap-2">
                  <span className="text-green-600 text-lg">✓</span>
                  <span className="text-sm font-medium text-gray-800">Saved</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}