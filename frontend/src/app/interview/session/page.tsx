'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'

/**
 * CONFIG
 * RECORD_MODE:
 *  - 'per-question' : one clip per question (we will NOT download automatically)
 *  - 'continuous'   : one clip for the whole session (stop at the end)
 */
const RECORD_MODE: 'per-question' | 'continuous' = 'per-question'

// Auto move to next question after a per-question save
const AUTO_NEXT_AFTER_SAVE = true

/**
 * SAVE_MODE:
 *  - 'none'     : DO NOT auto-download or upload the videos; keep in memory only (Blob URL)
 *  - 'download' : Auto-download each recorded clip (old behavior)
 *  - 'upload'   : POST to /api/upload (requires API route)
 */
const SAVE_MODE: 'none' | 'download' | 'upload' = 'none'

type QA = {
  questionId: string
  fileName?: string
  blobUrl?: string
  uploaded?: boolean
  uploadId?: string
  recorded?: boolean   // ✅ mark as recorded even if not saved
}

const QUESTION_BANK: string[] = [
  'Tell me about a challenging problem you solved recently.',
  'Explain a time you had to work with a difficult stakeholder.',
  'Walk me through a design/architecture decision you made.',
  'What is your biggest strength as an engineer?',
  'Describe a bug you fixed that other people missed.',
  'How do you handle tight deadlines?',
  'Explain a time you disagreed with your manager and what you did.',
  'How do you ensure code quality and maintainability?',
  'Tell me about a project you’re proud of and why.',
  'Why do you want to join this company?',
]

export default function InterviewSessionPage() {
  const search = useSearchParams()
  const router = useRouter()

  const via = search.get('via')
  const role = search.get('role')
  const company = search.get('company')

  // ===== Interview state =====
  const questions = useMemo(() => QUESTION_BANK, [])
  const [started, setStarted] = useState(false)
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<QA[]>(
    questions.map((_, i) => ({ questionId: `q${i + 1}` }))
  )
  const isLast = idx === questions.length - 1
  const currentQ = questions[idx]

  // ===== Camera / Recording =====
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const [recording, setRecording] = useState(false)
  const [saving, setSaving] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user') // front camera by default
  const [elapsedSec, setElapsedSec] = useState(0)
  const timerRef = useRef<number | null>(null)
  const [showSavedToast, setShowSavedToast] = useState(false)

  // Try supported MIME types
  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4',
    ]
    for (const t of types) {
      if ((window as any).MediaRecorder?.isTypeSupported?.(t)) return t
    }
    return ''
  }

  // Init camera (front/back)
  const initCamera = async () => {
    setPermissionError(null)

    // stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      if (!stream.getVideoTracks().length) throw new Error('No video track available.')
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
    } catch (err) {
      console.error(err)
      // fallback constraints
      try {
        const fallback = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (!fallback.getVideoTracks().length) throw new Error('No video track (fallback).')
        streamRef.current = fallback
        if (videoRef.current) {
          videoRef.current.srcObject = fallback
          await videoRef.current.play().catch(() => {})
        }
      } catch (err2) {
        console.error(err2)
        setPermissionError(
          'Camera/Microphone not available. Use HTTPS (or localhost), allow permissions, and try again.'
        )
      }
    }
  }

  const startTimer = () => {
    setElapsedSec(0)
    timerRef.current = window.setInterval(() => setElapsedSec((s) => s + 1), 1000)
  }
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startRecording = () => {
    if (!streamRef.current) return
    try {
      chunksRef.current = []
      const mimeType = getSupportedMimeType()
      const rec = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined)
      recorderRef.current = rec

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onstop = async () => {
        stopTimer()
        setRecording(false)
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'video/webm' })
        await saveBlob(blob)
      }

      rec.start()
      setRecording(true)
      startTimer()
    } catch (e) {
      console.error('Failed to start recording', e)
    }
  }

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
  }

  // ✅ Save WITHOUT downloading (SAVE_MODE='none')
  const saveBlob = async (blob: Blob) => {
    setSaving(true)
    try {
      const isContinuous = RECORD_MODE === 'continuous'
      const targetIndex = isContinuous ? 0 : idx

      const ext = (recorderRef.current?.mimeType || '').includes('mp4') ? 'mp4' : 'webm'
      const baseName = isContinuous ? 'interview-session' : `answer-q${idx + 1}`
      const fileName = `${baseName}-${Date.now()}.${ext}`

      if (SAVE_MODE === 'none') {
        // Keep in memory only (Blob URL) — no download/upload
        const url = URL.createObjectURL(blob)
        setAnswers((prev) => {
          const copy = [...prev]
          copy[targetIndex] = {
            ...copy[targetIndex],
            blobUrl: url,
            fileName,
            recorded: true,
          }
          return copy
        })
      } else if (SAVE_MODE === 'download') {
        const url = URL.createObjectURL(blob)
        setAnswers((prev) => {
          const copy = [...prev]
          copy[targetIndex] = {
            ...copy[targetIndex],
            fileName,
            blobUrl: url,
            uploaded: false,
            recorded: true,
          }
          return copy
        })
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        a.remove()
      } else {
        // upload (requires /api/upload)
        const fd = new FormData()
        fd.append('file', blob, fileName)
        fd.append('questionId', isContinuous ? 'all' : `q${idx + 1}`)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        setAnswers((prev) => {
          const copy = [...prev]
          copy[targetIndex] = {
            ...copy[targetIndex],
            fileName: data.fileName || fileName,
            uploaded: true,
            uploadId: data.id || undefined,
            recorded: true,
          }
          return copy
        })
      }

      setShowSavedToast(true)
      setTimeout(() => setShowSavedToast(false), 1600)

      if (!isContinuous && AUTO_NEXT_AFTER_SAVE && !isLast) {
        setIdx((i) => Math.min(i + 1, questions.length - 1))
      }
    } catch (e) {
      console.error('Save failed', e)
      alert('Failed to save recording. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleStartInterview = async () => {
    await initCamera()
    setStarted(true)
    if (RECORD_MODE === 'continuous') {
      startRecording()
    }
  }

  const finishInterview = () => {
    if (RECORD_MODE === 'continuous' && recording) {
      stopRecording()
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setStarted(false)
    // Navigate to summary (optional) or home
    router.push('/')
  }

  const flipCamera = async () => {
    setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))
    await initCamera()
  }

  useEffect(() => {
    return () => {
      stopTimer()
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  // ✅ Allow next if recorded (no need to have file saved)
  const canGoNext =
    RECORD_MODE === 'continuous'
      ? true
      : !!answers[idx]?.recorded || !!answers[idx]?.fileName || !!answers[idx]?.blobUrl

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
              <li>This interview has {questions.length} questions.</li>
              <li>We’ll use your camera & microphone. Use HTTPS or localhost.</li>
              <li>If the preview is black, click <strong>Flip Camera</strong> after starting.</li>
            </ul>
            {permissionError && (
              <p className="text-sm text-red-600 mb-4">{permissionError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleStartInterview}
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

              <p className="text-gray-900 font-medium mb-4">{currentQ}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Camera */}
                <div className="relative">
                  <div className="rounded-xl overflow-hidden border border-gray-200 bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover"
                      style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : undefined }}
                    />
                  </div>

                  {recording && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      ● Recording… {Math.floor(elapsedSec / 60)}:{String(elapsedSec % 60).padStart(2, '0')}
                    </div>
                  )}
                </div>

                {/* Controls & status */}
                <div className="flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={flipCamera}
                        className="flex-1 px-4 py-2 rounded-lg border hover:bg-gray-50"
                        disabled={recording || saving}
                        title="Toggle between front and back camera"
                      >
                        Flip Camera
                      </button>

                      {RECORD_MODE === 'continuous' ? (
                        !recording ? (
                          <button
                            onClick={startRecording}
                            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            disabled={!!permissionError || saving}
                          >
                            Start Recording
                          </button>
                        ) : (
                          <button
                            onClick={stopRecording}
                            className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                            disabled={saving}
                          >
                            Stop & Save
                          </button>
                        )
                      ) : (
                        !recording ? (
                          <button
                            onClick={startRecording}
                            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            disabled={!!permissionError || saving}
                          >
                            {answers[idx]?.recorded ? 'Re-record Answer' : 'Start Recording'}
                          </button>
                        ) : (
                          <button
                            onClick={stopRecording}
                            className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                            disabled={saving}
                          >
                            Stop & Save
                          </button>
                        )
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      {RECORD_MODE === 'per-question' ? (
                        answers[idx]?.recorded ? (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-medium">Recorded (not saved)</span>
                            {SAVE_MODE !== 'none' && answers[idx].blobUrl && (
                              <a
                                className="text-blue-600 hover:underline"
                                href={answers[idx].blobUrl}
                                download={answers[idx].fileName}
                              >
                                Download again
                              </a>
                            )}
                          </div>
                        ) : (
                          <span>Record your answer, then click <strong>Stop & Save</strong>.</span>
                        )
                      ) : (
                        answers[0]?.recorded ? (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-medium">Session recorded (not saved)</span>
                          </div>
                        ) : (
                          <span>{recording ? 'Recording in progress…' : 'Click Start Recording to begin the session.'}</span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => setIdx((i) => Math.max(0, i - 1))}
                      disabled={idx === 0}
                      className={`px-4 py-2 text-sm rounded-lg border ${
                        idx === 0 ? 'text-gray-400 border-gray-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>

                    {!isLast ? (
                      <button
                        onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))}
                        disabled={!canGoNext}
                        className={`px-4 py-2 text-sm rounded-lg font-semibold ${
                          canGoNext ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        onClick={finishInterview}
                        disabled={RECORD_MODE === 'per-question' ? !answers[idx]?.recorded : recording}
                        className={`px-4 py-2 text-sm rounded-lg font-semibold ${
                          (RECORD_MODE === 'per-question' ? !!answers[idx]?.recorded : !recording)
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Finish Interview
                      </button>
                    )}
                  </div>
                </div>
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