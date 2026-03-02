"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL as string) || "http://127.0.0.1:5000";

function ResetPasswordContent(): JSX.Element {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";

  const [pw, setPw] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => setErr(null), [pw, pw2]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    if (!token) { setErr("Reset token is missing. Use the link from your email."); return; }
    if (!pw || pw.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (pw !== pw2) { setErr("Passwords do not match."); return; }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: pw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Invalid/expired link.");
      setOk(true);
      setTimeout(() => router.push("/auth/login"), 1200);
    } catch (e) {
      const m = e instanceof Error ? e.message : "Couldn’t reset password. Request a new link.";
      setErr(m);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b1220", color: "#e5e7eb", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "rgba(15,23,42,.6)", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Set a new password</h1>
        <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>
          Enter a new password for your account.
        </p>

        <form onSubmit={onSubmit} noValidate>
          {!token && (
            <div style={{ border: "1px solid rgba(244,63,94,.4)", background: "rgba(76,5,25,.2)", borderRadius: 8, padding: 10, color: "#fecdd3", fontSize: 14, marginBottom: 12 }}>
              The reset link is missing a token. <Link href="/auth/forgot" style={{ color: "#fecdd3", textDecoration: "underline" }}>Request a new link</Link>.
            </div>
          )}

          <label htmlFor="pw" style={{ display: "block", fontSize: 14, color: "#cbd5e1", marginBottom: 6 }}>
            New password
          </label>
          <input
            id="pw"
            type="password"
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            disabled={busy || !token}
            required
            style={{
              width: "100%", background: "#0f172a", color: "#e5e7eb", border: "1px solid #334155",
              borderRadius: 8, padding: "10px 12px", outline: "none", marginBottom: 12
            }}
          />

          <label htmlFor="pw2" style={{ display: "block", fontSize: 14, color: "#cbd5e1", marginBottom: 6 }}>
            Confirm new password
          </label>
          <input
            id="pw2"
            type="password"
            autoComplete="new-password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            disabled={busy || !token}
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

          {ok && (
            <div style={{ border: "1px solid rgba(16,185,129,.4)", background: "rgba(6,78,59,.2)", borderRadius: 8, padding: 10, color: "#a7f3d0", fontSize: 14, marginBottom: 12 }}>
              Password updated. Redirecting to login…
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !token}
            style={{
              width: "100%", background: "#4f46e5", color: "white", border: "none",
              borderRadius: 8, padding: "10px 12px", cursor: "pointer", opacity: busy || !token ? .6 : 1
            }}
          >
            {busy ? "Updating..." : "Update password"}
          </button>

          <div style={{ textAlign: "center", fontSize: 14, marginTop: 12 }}>
            <Link href="/auth/login" style={{ color: "#4f46e5", textDecoration: "none" }}>Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage(): JSX.Element {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}