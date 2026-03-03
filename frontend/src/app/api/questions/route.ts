import { NextRequest, NextResponse } from 'next/server';

export type Question = {
  id: number;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  created_at?: string;
};

export type QuestionsResponse = {
  items: Question[];
  total: number;
};

/**
 * GET /api/questions
 * Proxy to Flask backend with query params: q, category, page, limit
 * Always uses cache: 'no-store'
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    // Build backend URL
    const backendBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    const backendUrl = new URL('/api/questions', backendBase);

    // Add params
    if (q) backendUrl.searchParams.set('q', q);
    if (category) backendUrl.searchParams.set('category', category);
    backendUrl.searchParams.set('page', page);
    backendUrl.searchParams.set('limit', limit);

    // Fetch from backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    // Normalize response: ensure { items, total }
    const normalized: QuestionsResponse = {
      items: Array.isArray(data) ? data : data.items || data.questions || [],
      total: data.total || (Array.isArray(data) ? data.length : 0),
    };

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('[API /api/questions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions', items: [], total: 0 },
      { status: 500 }
    );
  }
}
