'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signup } from '@/api'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !password) {
      setError('Please fill all fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await signup(email, password, name)
      
      // Store token if provided
      if (response.token) {
        localStorage.setItem('token', response.token)
        // Redirect to dashboard
        router.push('/')
      } else {
        // Redirect to login if no auto-login
        alert('Signup successful. Please sign in.')
        router.push('/auth/login')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      setError(message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-gray-400 mt-3">
            Start your AI mock interview journey
          </p>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 shadow-2xl">
          <div className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="Full name"
              className="w-full px-4 py-3 bg-[#1f2937] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />

            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 bg-[#1f2937] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 bg-[#1f2937] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <button
              onClick={handleSignup}
              disabled={loading}
              className={`w-full py-3 transition rounded-lg font-semibold ${
                loading
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <p className="text-gray-400 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}