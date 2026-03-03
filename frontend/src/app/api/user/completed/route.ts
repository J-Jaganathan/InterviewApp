import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/user/completed
 * Proxy to Flask backend for completed questions
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const backendBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    const backendUrl = `${backendBase}/api/questions/user/completed`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /api/user/completed] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch completed questions',
        completed_questions: [],
        total: 0
      },
      { status: 500 }
    );
  }
}
