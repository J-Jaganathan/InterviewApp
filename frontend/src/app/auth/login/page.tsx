'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/api'
import { Eye, EyeOff } from 'lucide-react' // Import the icons

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
      localStorage.setItem('auth_token', response.token)
      router.push('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-[#0b1220]">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Sign in</h1>
          <p className="mt-2 text-sm text-slate-400">Continue your AI interview preparation</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-md bg-slate-900 border border-slate-800 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full rounded-md bg-slate-900 border border-slate-800 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {/* Icon Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 focus:outline-none transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={18} strokeWidth={2} />
              ) : (
                <Eye size={18} strokeWidth={2} />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-md py-3 text-sm font-medium transition-all shadow-lg ${
              loading 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98]'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="space-y-3 text-center text-sm">
          <p className="text-slate-400">
            Don’t have an account?{' '}
            <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create one
            </Link>
          </p>
          <p>
            <Link href="/auth/forgot" className="text-slate-500 hover:text-indigo-400 transition-colors">
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}