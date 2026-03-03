"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getResources, type Resource } from "@/api";

/** Reusable: Go to Dashboard button (responsive) */
function BackToDashboardButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/")}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 hover:border-slate-400 active:bg-slate-200 transition-colors ${className}`}
      aria-label="Go to Dashboard"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Go to Dashboard</span>
    </button>
  );
}

function ResourcesContent() {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const rs = await getResources();
        setItems(rs || []);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load resources");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 px-4">
        <div className="w-full max-w-2xl space-y-4">
          <BackToDashboardButton className="w-full md:w-auto" />
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            Loading…
          </div>
        </div>
      </div>
    );

  if (err)
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <BackToDashboardButton className="w-full md:w-auto" />
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Error: {err}
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Title left, Button right (stacks on mobile) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 order-1">Resources</h1>
          <BackToDashboardButton className="order-2 w-full md:w-auto md:ml-auto" />
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-slate-300 rounded-xl p-6">
            <div className="text-slate-700">No resources yet.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map((r) => (
              <a
                key={r.id}
                href={r.link || "#"}
                target="_blank"
                rel="noreferrer"
                className="
                  block bg-white p-4 rounded-xl border border-slate-300
                  hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-sm
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400
                  transition-colors
                "
              >
                <div className="text-xs font-medium uppercase tracking-wide text-slate-600">
                  {r.category || r.resource_type}
                </div>
                <div className="mt-0.5 font-semibold text-slate-900">{r.title}</div>
                {r.desc && (
                  <div className="text-sm text-slate-700 mt-1 leading-relaxed">
                    {r.desc}
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
          Loading…
        </div>
      }
    >
      <ResourcesContent />
    </Suspense>
  );
}