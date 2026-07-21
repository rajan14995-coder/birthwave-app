"use client";

import { useRouter } from "next/navigation";
import OtpLoginForm from "@/components/auth/OtpLoginForm";

export default function StaffLoginPage() {
  const router = useRouter();
  return (
    <main className="flex min-h-screen items-center justify-center bg-plum px-4">
      <OtpLoginForm role="STAFF" onSuccess={(to) => router.push(to)} />
    </main>
  );
}
