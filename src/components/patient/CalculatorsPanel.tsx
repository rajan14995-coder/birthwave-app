"use client";

import { useState } from "react";
import {
  calculateBmi,
  calculateConceptionFromLmp,
  calculateDueDate,
  calculateFertilityWindow,
  calculateNextPeriod,
  calculateOvulation,
  calculatePregnancyProgress,
} from "@/lib/calculators";

type CalcKey = "due-date" | "period" | "conception" | "pregnancy" | "ovulation" | "bmi" | "fertility";

const TABS: { key: CalcKey; label: string }[] = [
  { key: "due-date", label: "Due Date" },
  { key: "period", label: "Period" },
  { key: "conception", label: "Conception" },
  { key: "pregnancy", label: "Pregnancy" },
  { key: "ovulation", label: "Ovulation" },
  { key: "bmi", label: "BMI" },
  { key: "fertility", label: "Fertility" },
];

export default function CalculatorsPanel() {
  const [tab, setTab] = useState<CalcKey>("due-date");

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-rose/20">
      <h3 className="mb-3 text-sm font-semibold text-plum">Health Calculators</h3>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              tab === t.key ? "bg-plum text-white" : "bg-blush text-plum/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "due-date" && <DueDateCalc />}
      {tab === "period" && <PeriodCalc />}
      {tab === "conception" && <ConceptionCalc />}
      {tab === "pregnancy" && <PregnancyCalc />}
      {tab === "ovulation" && <OvulationCalc />}
      {tab === "bmi" && <BmiCalc />}
      {tab === "fertility" && <FertilityCalc />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-xs font-medium text-plum/60">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-rose/30 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-gold";
const resultClass = "mt-3 rounded-xl bg-sage px-4 py-3 text-sm text-emerald-800";

function DueDateCalc() {
  const [lmp, setLmp] = useState("");
  const result = lmp ? calculateDueDate(new Date(lmp)) : null;
  return (
    <div>
      <Field label="First day of last menstrual period">
        <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className={inputClass} />
      </Field>
      {result && (
        <div className={resultClass}>
          Estimated due date: <strong>{result.dueDateFormatted}</strong>
          <br />
          You're currently {result.currentWeek} weeks {result.currentDaysIntoWeek} days along, with{" "}
          {result.daysRemaining} days remaining.
        </div>
      )}
    </div>
  );
}

function PeriodCalc() {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const result = lastPeriod ? calculateNextPeriod(new Date(lastPeriod), Number(cycleLength)) : null;
  return (
    <div>
      <Field label="First day of your last period">
        <input type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Average cycle length (days)">
        <input
          type="number"
          value={cycleLength}
          onChange={(e) => setCycleLength(e.target.value)}
          className={inputClass}
        />
      </Field>
      {result && (
        <div className={resultClass}>
          Next expected period: <strong>{result.nextPeriodFormatted}</strong> ({result.daysUntilNextPeriod} days away)
        </div>
      )}
    </div>
  );
}

function ConceptionCalc() {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const result = lastPeriod ? calculateConceptionFromLmp(new Date(lastPeriod), Number(cycleLength)) : null;
  return (
    <div>
      <Field label="First day of your last period">
        <input type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Average cycle length (days)">
        <input
          type="number"
          value={cycleLength}
          onChange={(e) => setCycleLength(e.target.value)}
          className={inputClass}
        />
      </Field>
      {result && (
        <div className={resultClass}>
          Estimated conception date: <strong>{result.conceptionFormatted}</strong>
        </div>
      )}
    </div>
  );
}

function PregnancyCalc() {
  const [lmp, setLmp] = useState("");
  const result = lmp ? calculatePregnancyProgress(new Date(lmp)) : null;
  return (
    <div>
      <Field label="First day of last menstrual period">
        <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className={inputClass} />
      </Field>
      {result && (
        <div className={resultClass}>
          {result.weeks} weeks {result.days} days · Trimester {result.trimester}
        </div>
      )}
    </div>
  );
}

function OvulationCalc() {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const result = lastPeriod ? calculateOvulation(new Date(lastPeriod), Number(cycleLength)) : null;
  return (
    <div>
      <Field label="First day of your last period">
        <input type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Average cycle length (days)">
        <input
          type="number"
          value={cycleLength}
          onChange={(e) => setCycleLength(e.target.value)}
          className={inputClass}
        />
      </Field>
      {result && (
        <div className={resultClass}>
          Estimated ovulation: <strong>{result.ovulationFormatted}</strong>
          <br />
          Fertile window: {result.fertileWindowFormatted}
        </div>
      )}
    </div>
  );
}

function BmiCalc() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const result = weight && height ? calculateBmi(Number(weight), Number(height)) : null;
  return (
    <div>
      <Field label="Weight (kg)">
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Height (cm)">
        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={inputClass} />
      </Field>
      {result && (
        <div className={resultClass}>
          BMI: <strong>{result.bmi}</strong> — {result.category}
        </div>
      )}
    </div>
  );
}

function FertilityCalc() {
  const [dob, setDob] = useState("");
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const result = dob && lastPeriod ? calculateFertilityWindow(new Date(dob), new Date(lastPeriod), Number(cycleLength)) : null;
  return (
    <div>
      <Field label="Date of birth">
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} />
      </Field>
      <Field label="First day of your last period">
        <input type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Average cycle length (days)">
        <input
          type="number"
          value={cycleLength}
          onChange={(e) => setCycleLength(e.target.value)}
          className={inputClass}
        />
      </Field>
      {result && (
        <div className={resultClass}>
          Age {result.age} — {result.ageNote}
          <br />
          Fertile window: {result.fertileWindowFormatted}
        </div>
      )}
    </div>
  );
}
