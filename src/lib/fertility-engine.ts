export type CycleRegularity = "REGULAR" | "IRREGULAR" | "SEVERELY_IRREGULAR";

export interface FertilityQuizInput {
  age: number;
  tryingDurationMonths: number;
  cycleRegularity: CycleRegularity;
  priorDiagnosis: string[]; // e.g. ["PCOS", "ENDOMETRIOSIS", "THYROID"]
  priorMiscarriage: boolean;
}

export interface FertilityAssessmentResult {
  riskLevel: "HIGH" | "LOW";
  reasons: string[];
  lifestyleGuidance?: LifestyleGuidanceCard;
  recommendBooking: boolean;
  headline: string;
}

export interface LifestyleGuidanceCard {
  title: string;
  items: { label: string; detail: string }[];
  disclaimer: string;
}

/**
 * Pure function implementing the exact criticality rules specified in the project brief:
 *  - age > 35, OR
 *  - trying > 12 months (or > 6 months if age > 35), OR
 *  - severely irregular cycles, OR
 *  - history of miscarriage
 *  => HIGH risk, recommend direct booking.
 * Otherwise => LOW risk, lifestyle guidance card, no appointment required.
 */
export function evaluateFertilityRisk(input: FertilityQuizInput): FertilityAssessmentResult {
  const reasons: string[] = [];

  const ageThresholdMonths = input.age > 35 ? 6 : 12;

  if (input.age > 35) reasons.push("Age is over 35, which reduces the window for natural conception.");
  if (input.tryingDurationMonths > ageThresholdMonths) {
    reasons.push(
      `Trying to conceive for ${input.tryingDurationMonths} months exceeds the recommended ${ageThresholdMonths}-month threshold for your age group.`
    );
  }
  if (input.cycleRegularity === "SEVERELY_IRREGULAR") {
    reasons.push("Severely irregular menstrual cycles can indicate an underlying ovulatory issue.");
  }
  if (input.priorMiscarriage) {
    reasons.push("A prior history of miscarriage warrants closer clinical evaluation.");
  }
  if (input.priorDiagnosis.includes("PCOS")) {
    reasons.push("A prior PCOS diagnosis is a relevant fertility factor.");
  }
  if (input.priorDiagnosis.includes("ENDOMETRIOSIS")) {
    reasons.push("A prior endometriosis diagnosis is a relevant fertility factor.");
  }

  const isHighRisk =
    input.age > 35 ||
    input.tryingDurationMonths > ageThresholdMonths ||
    input.cycleRegularity === "SEVERELY_IRREGULAR" ||
    input.priorMiscarriage;

  if (isHighRisk) {
    return {
      riskLevel: "HIGH",
      reasons,
      recommendBooking: true,
      headline: "Based on your answers, we recommend speaking with Dr. Santoshi directly.",
    };
  }

  return {
    riskLevel: "LOW",
    reasons: ["No high-risk factors identified in your responses."],
    recommendBooking: false,
    headline: "Your parameters look healthy! No immediate appointment required.",
    lifestyleGuidance: {
      title: "Your Personalized Lifestyle Guidance",
      items: [
        { label: "Folic Acid", detail: "Take 400mcg daily to support early fetal neural development." },
        { label: "Prenatal Yoga", detail: "2–3 sessions a week to support circulation and reduce stress." },
        { label: "Track Ovulation", detail: "Use a basal body temperature or ovulation-strip method to identify your fertile window." },
        { label: "Hydration", detail: "Aim for at least 2.5 litres of water daily." },
        { label: "Sleep Hygiene", detail: "Target 7–8 hours of consistent, quality sleep per night." },
      ],
      disclaimer:
        "This guidance is general wellness information, not a medical diagnosis. If anything changes — irregular cycles, pain, or you cross 6–12 months of trying — revisit this assessment or book a consultation.",
    },
  };
}
