import { addDays, differenceInCalendarDays, differenceInYears, format, subDays } from "date-fns";

// ---- Due Date Calculator (Naegele's rule: LMP + 280 days) ----
export function calculateDueDate(lastMenstrualPeriod: Date) {
  const dueDate = addDays(lastMenstrualPeriod, 280);
  const today = new Date();
  const daysPregnant = Math.max(0, differenceInCalendarDays(today, lastMenstrualPeriod));
  const weeksPregnant = Math.floor(daysPregnant / 7);
  const remainderDays = daysPregnant % 7;
  return {
    dueDate,
    dueDateFormatted: format(dueDate, "dd MMM yyyy"),
    currentWeek: weeksPregnant,
    currentDaysIntoWeek: remainderDays,
    daysRemaining: Math.max(0, differenceInCalendarDays(dueDate, today)),
  };
}

// ---- Period (next cycle) Calculator ----
export function calculateNextPeriod(lastPeriodStart: Date, averageCycleLength = 28) {
  const nextPeriod = addDays(lastPeriodStart, averageCycleLength);
  const today = new Date();
  return {
    nextPeriodDate: nextPeriod,
    nextPeriodFormatted: format(nextPeriod, "dd MMM yyyy"),
    daysUntilNextPeriod: differenceInCalendarDays(nextPeriod, today),
  };
}

// ---- Ovulation Calculator (ovulation ~14 days before next period) ----
export function calculateOvulation(lastPeriodStart: Date, averageCycleLength = 28) {
  const nextPeriod = addDays(lastPeriodStart, averageCycleLength);
  const ovulationDate = subDays(nextPeriod, 14);
  const fertileWindowStart = subDays(ovulationDate, 5);
  const fertileWindowEnd = addDays(ovulationDate, 1);
  return {
    ovulationDate,
    ovulationFormatted: format(ovulationDate, "dd MMM yyyy"),
    fertileWindowStart,
    fertileWindowEnd,
    fertileWindowFormatted: `${format(fertileWindowStart, "dd MMM")} – ${format(fertileWindowEnd, "dd MMM yyyy")}`,
  };
}

// ---- Conception Calculator (estimate conception date from due date, or from LMP) ----
export function calculateConceptionFromDueDate(dueDate: Date) {
  // Conception typically occurs ~266 days before the due date (38 weeks)
  const conceptionDate = subDays(dueDate, 266);
  return { conceptionDate, conceptionFormatted: format(conceptionDate, "dd MMM yyyy") };
}

export function calculateConceptionFromLmp(lastMenstrualPeriod: Date, averageCycleLength = 28) {
  // Approximate: conception occurs at ovulation, ~14 days before next expected period
  const ovulationDate = addDays(lastMenstrualPeriod, averageCycleLength - 14);
  return { conceptionDate: ovulationDate, conceptionFormatted: format(ovulationDate, "dd MMM yyyy") };
}

// ---- Pregnancy Calculator (weeks/trimester from LMP) ----
export function calculatePregnancyProgress(lastMenstrualPeriod: Date) {
  const today = new Date();
  const daysPregnant = Math.max(0, differenceInCalendarDays(today, lastMenstrualPeriod));
  const weeks = Math.floor(daysPregnant / 7);
  const days = daysPregnant % 7;
  let trimester: 1 | 2 | 3 = 1;
  if (weeks >= 27) trimester = 3;
  else if (weeks >= 13) trimester = 2;
  return { weeks, days, trimester, totalDays: daysPregnant };
}

// ---- BMI Calculator ----
export function calculateBmi(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let category: string;
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal weight";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";
  return { bmi: Math.round(bmi * 10) / 10, category };
}

// ---- Fertility Calculator (basic age-based context + cycle-based fertile window) ----
export function calculateFertilityWindow(dateOfBirth: Date, lastPeriodStart: Date, averageCycleLength = 28) {
  const age = differenceInYears(new Date(), dateOfBirth);
  const ovulation = calculateOvulation(lastPeriodStart, averageCycleLength);
  let ageNote: string;
  if (age < 30) ageNote = "Fertility is generally at its highest through the twenties.";
  else if (age < 35) ageNote = "Fertility remains strong but begins a gradual natural decline.";
  else if (age <= 40) ageNote = "Fertility declines more noticeably after 35 — earlier evaluation is often advised.";
  else ageNote = "Fertility declines significantly after 40 — a specialist consultation is recommended.";
  return { age, ageNote, ...ovulation };
}
