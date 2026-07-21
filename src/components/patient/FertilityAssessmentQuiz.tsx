"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CycleRegularity = "REGULAR" | "IRREGULAR" | "SEVERELY_IRREGULAR";
type Diagnosis = "PCOS" | "ENDOMETRIOSIS" | "THYROID" | "NONE";

interface QuizAnswers {
  age: number | null;
  tryingDurationMonths: number | null;
  cycleRegularity: CycleRegularity | null;
  priorDiagnosis: Diagnosis[];
  priorMiscarriage: boolean | null;
}

const initialAnswers: QuizAnswers = {
  age: null,
  tryingDurationMonths: null,
  cycleRegularity: null,
  priorDiagnosis: [],
  priorMiscarriage: null,
};

export default function FertilityAssessmentQuiz({ onBookAppointment }: { onBookAppointment: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = ["age", "duration", "cycle", "diagnosis", "miscarriage"] as const;

  async function submit(finalAnswers: QuizAnswers) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/fertility-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: finalAnswers.age,
          tryingDurationMonths: finalAnswers.tryingDurationMonths,
          cycleRegularity: finalAnswers.cycleRegularity,
          priorDiagnosis: finalAnswers.priorDiagnosis.length ? finalAnswers.priorDiagnosis : ["NONE"],
          priorMiscarriage: finalAnswers.priorMiscarriage,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setResult(json.result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function next(update: Partial<QuizAnswers>) {
    const merged = { ...answers, ...update };
    setAnswers(merged);
    if (step === steps.length - 1) {
      submit(merged);
    } else {
      setStep((s) => s + 1);
    }
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-rose/20"
      >
        {result.riskLevel === "HIGH" ? (
          <div>
            <h3 className="mb-2 text-lg font-semibold text-plum">{result.headline}</h3>
            <ul className="mb-6 list-inside list-disc space-y-1 text-sm text-plum/70">
              {result.reasons.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <button
              onClick={onBookAppointment}
              className="rounded-xl bg-rose-gold px-6 py-2.5 font-medium text-white hover:opacity-90"
            >
              Book Appointment with Dr. Santoshi
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 rounded-xl bg-sage px-4 py-3 text-emerald-800">{result.headline}</div>
            <h3 className="mb-3 text-lg font-semibold text-plum">{result.lifestyleGuidance.title}</h3>
            <div className="space-y-3">
              {result.lifestyleGuidance.items.map((item: any) => (
                <div key={item.label} className="rounded-xl border border-rose/20 p-3">
                  <p className="font-medium text-plum">{item.label}</p>
                  <p className="text-sm text-plum/60">{item.detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs italic text-plum/50">{result.lifestyleGuidance.disclaimer}</p>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-rose/20">
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-rose/10">
        <motion.div
          className="h-full bg-rose-gold"
          animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25 }}
        >
          {steps[step] === "age" && (
            <QuestionNumber label="What is your age?" onSubmit={(v) => next({ age: v })} min={15} max={60} />
          )}
          {steps[step] === "duration" && (
            <QuestionNumber
              label="How many months have you been trying to conceive?"
              onSubmit={(v) => next({ tryingDurationMonths: v })}
              min={0}
              max={120}
            />
          )}
          {steps[step] === "cycle" && (
            <QuestionChoice
              label="How would you describe your menstrual cycle?"
              options={[
                { value: "REGULAR", label: "Regular" },
                { value: "IRREGULAR", label: "Somewhat irregular" },
                { value: "SEVERELY_IRREGULAR", label: "Severely irregular" },
              ]}
              onSubmit={(v) => next({ cycleRegularity: v as CycleRegularity })}
            />
          )}
          {steps[step] === "diagnosis" && (
            <QuestionMulti
              label="Any of these prior diagnoses? (select all that apply)"
              options={[
                { value: "PCOS", label: "PCOS" },
                { value: "ENDOMETRIOSIS", label: "Endometriosis" },
                { value: "THYROID", label: "Thyroid issues" },
                { value: "NONE", label: "None of these" },
              ]}
              onSubmit={(v) => next({ priorDiagnosis: v as Diagnosis[] })}
            />
          )}
          {steps[step] === "miscarriage" && (
            <QuestionChoice
              label="Have you had a prior miscarriage?"
              options={[
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ]}
              onSubmit={(v) => next({ priorMiscarriage: v === "true" })}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {submitting && <p className="mt-4 text-sm text-plum/50">Analyzing your responses…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function QuestionNumber({
  label,
  onSubmit,
  min,
  max,
}: {
  label: string;
  onSubmit: (v: number) => void;
  min: number;
  max: number;
}) {
  const [val, setVal] = useState("");
  return (
    <div>
      <p className="mb-4 text-base font-medium text-plum">{label}</p>
      <input
        type="number"
        min={min}
        max={max}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="mb-4 w-full rounded-xl border border-rose/30 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-gold"
      />
      <button
        disabled={val === "" || Number(val) < min || Number(val) > max}
        onClick={() => onSubmit(Number(val))}
        className="rounded-xl bg-plum px-6 py-2.5 font-medium text-white disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}

function QuestionChoice({
  label,
  options,
  onSubmit,
}: {
  label: string;
  options: { value: string; label: string }[];
  onSubmit: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-4 text-base font-medium text-plum">{label}</p>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSubmit(opt.value)}
            className="rounded-xl border border-rose/30 px-4 py-2.5 text-left transition hover:border-rose-gold hover:bg-blush"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuestionMulti({
  label,
  options,
  onSubmit,
}: {
  label: string;
  options: { value: string; label: string }[];
  onSubmit: (v: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  function toggle(v: string) {
    setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  }
  return (
    <div>
      <p className="mb-4 text-base font-medium text-plum">{label}</p>
      <div className="mb-4 flex flex-col gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`rounded-xl border px-4 py-2.5 text-left transition ${
              selected.includes(opt.value) ? "border-rose-gold bg-blush" : "border-rose/30 hover:bg-blush"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => onSubmit(selected)}
        className="rounded-xl bg-plum px-6 py-2.5 font-medium text-white disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}
