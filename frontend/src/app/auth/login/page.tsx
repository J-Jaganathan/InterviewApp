'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return alert('Signup first.')

    const user = JSON.parse(storedUser)
    if (user.email === email && user.password === password) {
      localStorage.setItem('isLoggedIn', 'true')
      router.push('/')
    } else {
      alert('Invalid credentials')
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
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-md bg-slate-900 border border-slate-800 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md bg-slate-900 border border-slate-800 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full rounded-md bg-indigo-600 py-3 text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            Sign in
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