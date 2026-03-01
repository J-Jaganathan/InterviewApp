'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/api'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await login(email, password)
      
      // Store token in localStorage
      localStorage.setItem('token', response.token)
      
      // Redirect to dashboard
      router.push('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">

        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Continue your AI interview preparation
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-md bg-slate-900 border border-slate-800 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md bg-slate-900 border border-slate-800 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full rounded-md py-3 text-sm font-medium transition-colors ${
              loading
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        <p className="text-center text-sm text-slate-400">
          Don’t have an account?{' '}
          <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300">
            Create one
          </Link>
        </p>

      </div>
    </div>
  )
}