"use client";

import { useRouter } from "next/navigation";
import ClinicalQueueTable from "@/components/clinical/ClinicalQueueTable";

export default function ClinicalDashboardPage() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login/staff");
  }

  return (
    <main className="min-h-screen bg-blush px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-plum">Clinical Dashboard</h1>
            <p className="text-sm text-plum/60">Appointment requests & scheduling</p>
          </div>
          <button onClick={logout} className="text-sm text-plum/50 underline">
            Log out
          </button>
        </div>
        <ClinicalQueueTable />
      </div>
    </main>
  );
}
