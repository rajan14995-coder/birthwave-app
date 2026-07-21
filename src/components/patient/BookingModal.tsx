"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

interface Service {
  id: string;
  name: string;
}

export default function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [slotWindow, setSlotWindow] = useState<"MORNING" | "EVENING">("MORNING");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data } = useQuery<{ services: Service[] }>({
    queryKey: ["services"],
    queryFn: () => fetch("/api/services").then((r) => r.json()),
    enabled: open,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          requestedDate: new Date(date).toISOString(),
          slotWindow,
          notes: notes || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Booking failed");
      return json;
    },
    onSuccess: () => {
      setSuccess(true);
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (e: any) => setError(e.message),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
      >
        {success ? (
          <div className="text-center">
            <p className="mb-1 text-lg font-semibold text-plum">Request Sent</p>
            <p className="mb-4 text-sm text-plum/60">Status: Pending Confirmation. We'll notify you once it's approved.</p>
            <button onClick={onClose} className="rounded-xl bg-plum px-6 py-2 text-white">
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="mb-4 text-lg font-semibold text-plum">Book an Appointment</h2>

            <label className="mb-1 block text-xs font-medium text-plum/60">Service</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="mb-3 w-full rounded-xl border border-rose/30 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-gold"
            >
              <option value="">Select a service</option>
              {data?.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-xs font-medium text-plum/60">Date</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="mb-3 w-full rounded-xl border border-rose/30 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-gold"
            />

            <label className="mb-1 block text-xs font-medium text-plum/60">Preferred Slot</label>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {(["MORNING", "EVENING"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setSlotWindow(w)}
                  className={`rounded-xl border px-4 py-2 text-sm ${
                    slotWindow === w ? "border-rose-gold bg-blush" : "border-rose/30"
                  }`}
                >
                  {w === "MORNING" ? "Morning" : "Evening"}
                </button>
              ))}
            </div>

            <label className="mb-1 block text-xs font-medium text-plum/60">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mb-4 w-full rounded-xl border border-rose/30 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-gold"
              rows={2}
            />

            {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-plum/60">
                Cancel
              </button>
              <button
                disabled={!serviceId || !date || bookMutation.isPending}
                onClick={() => bookMutation.mutate()}
                className="rounded-xl bg-rose-gold px-6 py-2 text-sm font-medium text-white disabled:opacity-40"
              >
                {bookMutation.isPending ? "Booking…" : "Confirm Request"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
