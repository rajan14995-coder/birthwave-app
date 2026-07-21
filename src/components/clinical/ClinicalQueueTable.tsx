"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface Appointment {
  id: string;
  requestedDate: string;
  slotWindow: "MORNING" | "EVENING";
  status: string;
  service: { name: string };
  patient: { phone: string; name?: string | null };
}

export default function ClinicalQueueTable() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [proposedDate, setProposedDate] = useState("");
  const [proposedSlot, setProposedSlot] = useState<"MORNING" | "EVENING">("MORNING");

  const params = new URLSearchParams();
  if (statusFilter) params.set("status", statusFilter);
  if (phoneFilter) params.set("phone", phoneFilter);

  const { data, isLoading } = useQuery<{ appointments: Appointment[] }>({
    queryKey: ["appointments", "staff", statusFilter, phoneFilter],
    queryFn: () => fetch(`/api/appointments?${params.toString()}`).then((r) => r.json()),
    refetchInterval: 15000,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: any }) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Action failed");
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments", "staff"] });
      setRescheduleTarget(null);
    },
  });

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose/20">
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-rose/30 px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          {["PENDING", "APPROVED", "RESCHEDULE_PROPOSED", "DECLINED", "CANCELLED", "COMPLETED"].map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <input
          placeholder="Search by mobile number"
          value={phoneFilter}
          onChange={(e) => setPhoneFilter(e.target.value)}
          className="rounded-xl border border-rose/30 px-3 py-1.5 text-sm"
        />
      </div>

      {isLoading && <p className="text-sm text-plum/50">Loading…</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rose/20 text-left text-plum/50">
              <th className="py-2 pr-4">Patient</th>
              <th className="py-2 pr-4">Service</th>
              <th className="py-2 pr-4">Date / Slot</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.appointments.map((a) => (
              <tr key={a.id} className="border-b border-rose/10">
                <td className="py-2 pr-4">{a.patient.name ?? a.patient.phone}</td>
                <td className="py-2 pr-4">{a.service.name}</td>
                <td className="py-2 pr-4">
                  {format(new Date(a.requestedDate), "dd MMM yyyy")} · {a.slotWindow === "MORNING" ? "AM" : "PM"}
                </td>
                <td className="py-2 pr-4">
                  <span className={`status-badge status-${a.status}`}>{a.status.replace(/_/g, " ")}</span>
                </td>
                <td className="py-2 pr-4">
                  {a.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => actionMutation.mutate({ id: a.id, body: { action: "APPROVE" } })}
                        className="rounded-lg bg-sage px-3 py-1 text-xs font-medium text-emerald-800"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRescheduleTarget(a)}
                        className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => actionMutation.mutate({ id: a.id, body: { action: "DECLINE" } })}
                        className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-800"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {a.status === "APPROVED" && (
                    <button
                      onClick={() => actionMutation.mutate({ id: a.id, body: { action: "COMPLETE" } })}
                      className="rounded-lg bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800"
                    >
                      Mark Completed
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-plum">Propose New Slot</h3>
            <input
              type="date"
              value={proposedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setProposedDate(e.target.value)}
              className="mb-3 w-full rounded-xl border border-rose/30 px-3 py-2"
            />
            <div className="mb-4 grid grid-cols-2 gap-2">
              {(["MORNING", "EVENING"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setProposedSlot(w)}
                  className={`rounded-xl border px-4 py-2 text-sm ${
                    proposedSlot === w ? "border-rose-gold bg-blush" : "border-rose/30"
                  }`}
                >
                  {w === "MORNING" ? "Morning" : "Evening"}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRescheduleTarget(null)} className="px-4 py-2 text-sm text-plum/60">
                Cancel
              </button>
              <button
                disabled={!proposedDate}
                onClick={() =>
                  actionMutation.mutate({
                    id: rescheduleTarget.id,
                    body: {
                      action: "RESCHEDULE",
                      proposedDate: new Date(proposedDate).toISOString(),
                      proposedSlotWindow: proposedSlot,
                    },
                  })
                }
                className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white disabled:opacity-40"
              >
                Send to Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
