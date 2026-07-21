"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/store";

const phoneSchema = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number") });
const otpSchema = z.object({ code: z.string().length(6, "Enter the 6-digit code") });

export default function OtpLoginForm({
  role,
  onSuccess,
}: {
  role: "PATIENT" | "STAFF";
  onSuccess: (redirectTo: string) => void;
}) {
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({ resolver: zodResolver(phoneSchema) });
  const otpForm = useForm<z.infer<typeof otpSchema>>({ resolver: zodResolver(otpSchema) });

  async function requestOtp(data: z.infer<typeof phoneSchema>) {
    setLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: data.phone, role, purpose: "LOGIN" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not send OTP");
      setPhone(data.phone);
      setStage("otp");
    } catch (e: any) {
      setServerError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function verify(data: z.infer<typeof otpSchema>) {
    setLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: data.code, role, purpose: "LOGIN" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Verification failed");

      if (role === "PATIENT") {
        setUser({ id: json.patient.id, phone: json.patient.phone, name: json.patient.name, role: "PATIENT" });
        onSuccess("/patient/dashboard");
      } else {
        setUser({ id: json.staff.id, phone: json.staff.phone, name: json.staff.name, role: "STAFF" });
        onSuccess("/clinical/dashboard");
      }
    } catch (e: any) {
      setServerError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-rose/20"
    >
      <h1 className="mb-1 text-xl font-semibold text-plum">
        {role === "PATIENT" ? "Welcome to The BirthWave" : "Clinical Staff Login"}
      </h1>
      <p className="mb-6 text-sm text-plum/60">
        {stage === "phone" ? "Enter your mobile number to continue" : `Enter the code sent to +91 ${phone}`}
      </p>

      {stage === "phone" ? (
        <form onSubmit={phoneForm.handleSubmit(requestOtp)} className="space-y-4">
          <div className="flex items-center rounded-xl border border-rose/30 px-3 py-2 focus-within:ring-2 focus-within:ring-rose-gold">
            <span className="mr-2 text-sm text-plum/60">+91</span>
            <input
              {...phoneForm.register("phone")}
              placeholder="98765 43210"
              className="w-full bg-transparent outline-none"
              inputMode="numeric"
              maxLength={10}
            />
          </div>
          {phoneForm.formState.errors.phone && (
            <p className="text-xs text-red-600">{phoneForm.formState.errors.phone.message}</p>
          )}
          {serverError && <p className="text-xs text-red-600">{serverError}</p>}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-plum py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={otpForm.handleSubmit(verify)} className="space-y-4">
          <input
            {...otpForm.register("code")}
            placeholder="6-digit code"
            className="w-full rounded-xl border border-rose/30 px-3 py-2 text-center tracking-[0.5em] outline-none focus:ring-2 focus:ring-rose-gold"
            inputMode="numeric"
            maxLength={6}
          />
          {otpForm.formState.errors.code && (
            <p className="text-xs text-red-600">{otpForm.formState.errors.code.message}</p>
          )}
          {serverError && <p className="text-xs text-red-600">{serverError}</p>}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-rose-gold py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify & Continue"}
          </button>
          <button
            type="button"
            onClick={() => setStage("phone")}
            className="w-full text-center text-xs text-plum/50 underline"
          >
            Change number
          </button>
        </form>
      )}
    </motion.div>
  );
}
