"use client";

import { Suspense, useEffect, useState } from "react";
import { getResources, type Resource } from "@/api";

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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">Loading…</div>
    );

  if (err)
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">Error: {err}</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Resources</h1>
        {items.length === 0 ? (
          <div className="text-slate-500">No resources yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map((r) => (
              <a
                key={r.id}
                href={r.link || "#"}
                target="_blank"
                rel="noreferrer"
                className="block bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300"
              >
                <div className="text-sm text-slate-400">{r.category || r.resource_type}</div>
                <div className="font-semibold">{r.title}</div>
                {r.desc && <div className="text-sm text-slate-600 mt-1">{r.desc}</div>}
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
    <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center">Loading…</div>}>
      <ResourcesContent />
    </Suspense>
  );
}