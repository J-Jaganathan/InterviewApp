"use client";

import * as React from "react";
import Link from "next/link"; // Recommended for Next.js

const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string) || "http://127.0.0.1:5000";

export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const v = email.trim();
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setErr("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      await fetch(`${API_BASE}/api/auth/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v }),
      });
      setDone(true);
    } catch {
      setErr("Couldn’t reach server. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b1220", color: "#e5e7eb", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "rgba(15,23,42,.6)", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Forgot your password?</h1>
        <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>
          Enter the email you used to sign up. If an account exists, we’ll send a reset link.
        </p>

        {done ? (
          <div>
            <div style={{ border: "1px solid rgba(16,185,129,.4)", background: "rgba(6,78,59,.2)", borderRadius: 8, padding: 12, marginBottom: 16, color: "#a7f3d0", fontSize: 14 }}>
              If an account exists for <b>{email}</b>, a reset link has been sent (check inbox/spam).
            </div>
            <div style={{ textAlign: "center", fontSize: 14 }}>
              <Link href="/auth/login" style={{ color: "#4f46e5", textDecoration: "none" }}>Back to login</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <label htmlFor="email" style={{ display: "block", fontSize: 14, color: "#cbd5e1", marginBottom: 6 }}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              required
              style={{
                width: "100%", background: "#0f172a", color: "#e5e7eb", border: "1px solid #334155",
                borderRadius: 8, padding: "10px 12px", outline: "none", marginBottom: 12
              }}
            />

            {err && (
              <div style={{ border: "1px solid rgba(244,63,94,.4)", background: "rgba(76,5,25,.2)", borderRadius: 8, padding: 10, color: "#fecdd3", fontSize: 14, marginBottom: 12 }}>
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              style={{
                width: "100%", background: "#4f46e5", color: "white", border: "none",
                borderRadius: 8, padding: "10px 12px", cursor: "pointer", opacity: busy ? .6 : 1
              }}
            >
              {busy ? "Sending..." : "Send reset link"}
            </button>

            <div style={{ textAlign: "center", fontSize: 14, marginTop: 12 }}>
               <Link href="/auth/login" style={{ color: "#4f46e5", textDecoration: "none" }}>Back to login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}