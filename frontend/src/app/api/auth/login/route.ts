import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const hash = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex')
    .toUpperCase()

  const [rows]: any = await pool.query(
    'SELECT id FROM users WHERE email = ? AND password_hash = ?',
    [email, hash]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const userId = rows[0].id

  const response = NextResponse.json({ success: true })

  response.cookies.set('auth_token', String(userId), {
    httpOnly: true,
    path: '/',
  })

  return response
}