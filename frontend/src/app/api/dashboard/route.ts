import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/dashboard
 * Proxy to Flask backend for dashboard data
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
    const backendUrl = `${backendBase}/api/dashboard`;

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
      throw new Error(`Backend returned ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /api/dashboard] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard',
        user: null,
        progress: 0,
        sessionsCompleted: 0,
        totalSessions: 0,
        avgScore: 0
      },
      { status: 500 }
    );
  }
}
