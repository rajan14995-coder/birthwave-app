import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { fertilityQuizSchema } from "@/lib/validation";
import { evaluateFertilityRisk } from "@/lib/fertility-engine";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Please log in to use the fertility assessment." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = fertilityQuizSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const result = evaluateFertilityRisk({
    age: input.age,
    tryingDurationMonths: input.tryingDurationMonths,
    cycleRegularity: input.cycleRegularity,
    priorDiagnosis: input.priorDiagnosis,
    priorMiscarriage: input.priorMiscarriage,
  });

  const saved = await prisma.fertilityAssessment.create({
    data: {
      patientId: session.sub,
      age: input.age,
      tryingDurationMon: input.tryingDurationMonths,
      cycleRegularity: input.cycleRegularity,
      priorDiagnosis: input.priorDiagnosis,
      priorMiscarriage: input.priorMiscarriage,
      riskLevel: result.riskLevel,
      riskReasons: result.reasons,
    },
  });

  return NextResponse.json({ success: true, assessmentId: saved.id, result });
}
