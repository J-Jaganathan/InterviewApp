import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  const hash = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex')
    .toUpperCase()

  try {
    await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hash]
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 })
  }
}