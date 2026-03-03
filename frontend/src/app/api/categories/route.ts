import { NextRequest, NextResponse } from 'next/server';

export type CategorySummary = {
  name: string;
  count: number;
};

export type CategoriesResponse = {
  items: CategorySummary[];
};

/**
 * GET /api/categories
 * Tries to proxy to Flask backend /api/categories.
 * Fallback: fetch all questions and aggregate counts by category in Node.
 * Always uses cache: 'no-store'
 */
export async function GET(request: NextRequest) {
  try {
    const backendBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

    // Try direct /categories endpoint first
    const categoriesUrl = new URL('/api/categories', backendBase);
    const categoriesRes = await fetch(categoriesUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => null);

    if (categoriesRes?.ok) {
      const data = await categoriesRes.json();
      const items = Array.isArray(data) ? data : data.items || [];
      return NextResponse.json({ items });
    }

    // Fallback: fetch all questions and aggregate by category
    const questionsUrl = new URL('/api/questions', backendBase);
    questionsUrl.searchParams.set('limit', '10000'); // Fetch all
    const questionsRes = await fetch(questionsUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!questionsRes.ok) {
      throw new Error(`Backend returned ${questionsRes.status}`);
    }

    const questionsData = await questionsRes.json();
    const questions = Array.isArray(questionsData)
      ? questionsData
      : questionsData.items || questionsData.questions || [];

    // Aggregate counts by category
    const categoryMap = new Map<string, number>();
    questions.forEach((q: any) => {
      const cat = q.category || 'Uncategorized';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });

    // Convert to sorted array
    const items = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Sort by count desc

    return NextResponse.json({ items });
  } catch (error) {
    console.error('[API /api/categories] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', items: [] },
      { status: 500 }
    );
  }
}
