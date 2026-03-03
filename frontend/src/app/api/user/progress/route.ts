import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/user/progress
 * Proxy to Flask backend for user progress data
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
    const backendUrl = `${backendBase}/api/questions/user/progress`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend error:', response.status, errorData);
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /api/user/progress] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user progress',
        total_questions: 0,
        completed_count: 0,
        progress_percentage: 0,
        sessions: []
      },
      { status: 500 }
    );
  }
}
