import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/questions/[id]/complete
 * Proxy to Flask backend for marking question as complete
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const backendBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    const backendUrl = `${backendBase}/api/questions/${id}/mark-complete`;

    const response = await fetch(backendUrl, {
      method: 'POST',
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
    console.error('[API /api/questions/[id]/complete] Error:', error);
    return NextResponse.json(
      { error: 'Failed to mark question complete' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/questions/[id]/complete
 * Proxy to Flask backend for unmarking question as complete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const backendBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    const backendUrl = `${backendBase}/api/questions/${id}/unmark-complete`;

    const response = await fetch(backendUrl, {
      method: 'POST',
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
    console.error('[API /api/questions/[id]/complete] Error:', error);
    return NextResponse.json(
      { error: 'Failed to unmark question complete' },
      { status: 500 }
    );
  }
}
