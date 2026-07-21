"use client";

import { useRouter } from "next/navigation";
import OtpLoginForm from "@/components/auth/OtpLoginForm";

export default function PatientLoginPage() {
  const router = useRouter();
  return (
    <main className="flex min-h-screen items-center justify-center bg-blush px-4">
      <OtpLoginForm role="PATIENT" onSuccess={(to) => router.push(to)} />
    </main>
  );
}
