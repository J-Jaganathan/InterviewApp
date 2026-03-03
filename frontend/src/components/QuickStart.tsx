import Link from 'next/link';
import { getCategories } from '@/api';

/**
 * QuickStart.tsx - Server Component (NOT async)
 * Shows hardcoded quick start tiles pointing to /questions?category=...
 * Can be used in client components with Suspense
 */

type IconMapKey = string;

function iconFor(categoryName: string): string {
  const map: Record<IconMapKey, string> = {
    arrays: '📊',
    strings: '📝',
    graphs: '🔗',
    'dynamic programming': '🎯',
    'dynamic-programming': '🎯',
    dp: '🎯',
    trees: '🌳',
    'linked lists': '⛓️',
    'linked-lists': '⛓️',
    'stacks & queues': '📚',
    'stacks-queues': '📚',
    heaps: '⬆️',
    'binary search': '🔍',
    'binary-search': '🔍',
    'two pointers': '👉',
    'two-pointers': '👉',
    backtracking: '↩️',
    hashing: '#️⃣',
    math: '🔢',
    greedy: '🎲',
    'system design': '🏗️',
    'system-design': '🏗️',
    databases: '🗄️',
    networking: '🌐',
    os: '⚙️',
    'operating systems': '⚙️',
    algorithms: '🧮',
    'data structures': '🏗️',
  };

  const lower = categoryName.toLowerCase();
  return map[lower] || '📌'; // fallback generic icon
}

export default function QuickStart() {
  // Use the original quick start items for now
  const quickStartItems = [
    { name: 'Arrays', count: 250, href: '/questions?category=Arrays' },
    { name: 'Strings', count: 180, href: '/questions?category=Strings' },
    { name: 'Graphs', count: 120, href: '/questions?category=Graphs' },
  ];

  return (
    <div>
      <h3 className="text-gray-800 font-bold text-lg mb-4">Quick Start</h3>
      <div className="grid grid-cols-1 gap-3">
        {quickStartItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center justify-between px-4 py-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200 group w-full text-left border border-blue-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-lg">
                {iconFor(item.name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">{item.name}</p>
                <p className="text-xs text-gray-500">{item.count} questions</p>
              </div>
            </div>
            <div className="text-blue-400 group-hover:text-blue-600 transition-colors">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
