'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = () => {
    if (!email || !password) {
      alert('Please fill all fields')
      return
    }

    const user = { email, password }
    localStorage.setItem('user', JSON.stringify(user))

    alert('Signup successful')
    router.push('/auth/login')
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
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 bg-[#1f2937] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 bg-[#1f2937] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={handleSignup}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-lg font-semibold text-white"
            >
              Create Account
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