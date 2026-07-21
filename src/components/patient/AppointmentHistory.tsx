"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isPast } from "date-fns";

interface Appointment {
  id: string;
  requestedDate: string;
  slotWindow: "MORNING" | "EVENING";
  status: string;
  service: { name: string };
  proposedDate?: string | null;
  proposedSlotWindow?: string | null;
}

const TABS = ["Upcoming", "Past", "Cancelled"] as const;

export default function AppointmentHistory() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Upcoming");

  const { data, isLoading } = useQuery<{ appointments: Appointment[] }>({
    queryKey: ["appointments"],
    queryFn: () => fetch("/api/appointments").then((r) => r.json()),
  });

  const appointments = data?.appointments ?? [];

  const filtered = appointments.filter((a) => {
    const dateInPast = isPast(new Date(a.requestedDate));
    if (tab === "Cancelled") return a.status === "DECLINED" || a.status === "CANCELLED";
    if (tab === "Past") return (a.status === "COMPLETED" || dateInPast) && a.status !== "DECLINED" && a.status !== "CANCELLED";
    return !dateInPast && a.status !== "DECLINED" && a.status !== "CANCELLED" && a.status !== "COMPLETED";
  });

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose/20">
      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t ? "bg-plum text-white" : "bg-blush text-plum/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-plum/50">Loading…</p>}
      {!isLoading && filtered.length === 0 && <p className="text-sm text-plum/50">No {tab.toLowerCase()} appointments.</p>}

      <div className="space-y-3">
        {filtered.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-xl border border-rose/20 p-3">
            <div>
              <p className="font-medium text-plum">{a.service.name}</p>
              <p className="text-sm text-plum/60">
                {format(new Date(a.requestedDate), "dd MMM yyyy")} · {a.slotWindow === "MORNING" ? "Morning" : "Evening"}
              </p>
              {a.status === "RESCHEDULE_PROPOSED" && a.proposedDate && (
                <p className="mt-1 text-xs text-blue-700">
                  Clinic proposed: {format(new Date(a.proposedDate), "dd MMM yyyy")} ·{" "}
                  {a.proposedSlotWindow === "MORNING" ? "Morning" : "Evening"} — check your SMS to confirm.
                </p>
              )}
            </div>
            <span className={`status-badge status-${a.status}`}>{a.status.replace(/_/g, " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
