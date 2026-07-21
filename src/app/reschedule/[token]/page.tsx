"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function RescheduleResponsePage() {
  const params = useParams<{ token: string }>();
  const [result, setResult] = useState<{ status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function respond(decision: "ACCEPT" | "DECLINE") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments/reschedule-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, decision }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setResult({ status: json.status });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-blush px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-rose/20">
        {result ? (
          <p className="text-plum">
            {result.status === "APPROVED"
              ? "Great — your new slot is confirmed. See you at the clinic!"
              : "Got it — this appointment has been cancelled. Please contact the clinic to rebook."}
          </p>
        ) : (
          <>
            <h1 className="mb-2 text-lg font-semibold text-plum">Proposed New Appointment Slot</h1>
            <p className="mb-6 text-sm text-plum/60">Please accept or decline the clinic's proposed reschedule.</p>
            {error && <p className="mb-3 text-xs text-red-600">{error}</p>}
            <div className="flex justify-center gap-3">
              <button
                disabled={loading}
                onClick={() => respond("ACCEPT")}
                className="rounded-xl bg-sage px-6 py-2.5 text-sm font-medium text-emerald-800 disabled:opacity-40"
              >
                Accept
              </button>
              <button
                disabled={loading}
                onClick={() => respond("DECLINE")}
                className="rounded-xl bg-red-100 px-6 py-2.5 text-sm font-medium text-red-800 disabled:opacity-40"
              >
                Decline
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
