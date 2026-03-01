'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getQuestions, type Question } from '@/api'

const SAVE_MODE: 'none' | 'download' | 'upload' = 'none'

type QA = {
  questionId: string
  text?: string
  saved?: boolean
  fileName?: string
  uploaded?: boolean
  uploadId?: string
}

export default function InterviewSessionPage() {
  const search = useSearchParams()
  const router = useRouter()
  const via = search.get('via')
  const role = search.get('role')
  const company = search.get('company')

  // State for questions
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [questions, setQuestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // State for interview session
  const [started, setStarted] = useState(false)
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<QA[]>([])
  const [buffer, setBuffer] = useState('')
  const [saving, setSaving] = useState(false)
  const [showSavedToast, setShowSavedToast] = useState(false)

  const isLast = questions.length > 0 && idx === questions.length - 1
  const currentQ = questions[idx] || ''

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const data = await getQuestions({ limit: 30 })
        setAllQuestions(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch questions'
        setError(message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  React.useEffect(() => {
    if (!started) return
    setBuffer(answers[idx]?.text || '')
  }, [idx, started, answers])

  const handleStart = () => {
    // Randomly select 10 questions from fetched questions
    if (allQuestions.length === 0) {
      setError('No questions available. Please try again.')
      return
    }
    
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(10, shuffled.length))
    const questionTexts = selected.map(q => q.text)
    
    setQuestions(questionTexts)
    setAnswers(selected.map((q) => ({ questionId: q.id })))
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
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                Error: {error}
              </div>
            )}
            
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
              <li>This session will randomly pick <strong>10 questions</strong> from our question bank.</li>
              <li>Type your answers and click <strong>Save</strong> or go to the next question.</li>
              <li>You can come back and edit any answer before finishing.</li>
            </ul>
            <div className="flex gap-2">
              <button
                onClick={handleStart}
                disabled={loading || allQuestions.length === 0}
                className={`px-5 py-2 rounded-lg text-sm font-semibold ${
                  loading || allQuestions.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Loading questions...' : 'Start Interview'}
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