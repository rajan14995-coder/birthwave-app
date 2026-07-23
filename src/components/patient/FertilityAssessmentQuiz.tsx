'use client';

import React, { useState } from 'react';

interface FertilityAssessmentQuizProps {
  onBookAppointment: () => void;
  onClose?: () => void;
}

interface Question {
  id: number;
  category: 'General' | 'Female Partner' | 'Male Partner';
  question: string;
  options: { label: string; riskScore: number }[];
}

const QUESTIONS: Question[] = [
  // GENERAL / AGE PARAMETERS
  {
    id: 1,
    category: 'General',
    question: "What is the female partner's current age?",
    options: [
      { label: "Under 30 years", riskScore: 0 },
      { label: "30 – 34 years", riskScore: 0 },
      { label: "35 – 39 years (Ovarian reserve decline accelerates)", riskScore: 2 },
      { label: "40 years or older (Immediate evaluation recommended)", riskScore: 3 },
    ],
  },
  {
    id: 2,
    category: 'General',
    question: "How long have you been actively trying to conceive with regular unprotected intercourse?",
    options: [
      { label: "Less than 6 months", riskScore: 0 },
      { label: "6 to 12 months", riskScore: 1 },
      { label: "12 to 24 months", riskScore: 2 },
      { label: "More than 2 years", riskScore: 3 },
    ],
  },

  // FEMALE PARTNER EVALUATION
  {
    id: 3,
    category: 'Female Partner',
    question: "FEMALE: What is your average menstrual cycle length (from Day 1 of period to Day 1 of next)?",
    options: [
      { label: "Regular (26 – 32 days)", riskScore: 0 },
      { label: "Slightly variable (21 – 35 days)", riskScore: 0 },
      { label: "Irregular or long cycles (>35 days / Oligomenorrhea)", riskScore: 2 },
      { label: "Absent cycles for months (Amenorrhea)", riskScore: 3 },
    ],
  },
  {
    id: 4,
    category: 'Female Partner',
    question: "FEMALE: Do you experience severe dysmenorrhea (painful periods) or pelvic pain during intercourse?",
    options: [
      { label: "No or minimal mild cramping", riskScore: 0 },
      { label: "Moderate pain managed with OTC pain relievers", riskScore: 1 },
      { label: "Severe pelvic pain / Suspected Endometriosis", riskScore: 2 },
    ],
  },
  {
    id: 5,
    category: 'Female Partner',
    question: "FEMALE: Have you been diagnosed with Polycystic Ovary Syndrome (PCOS) or hormonal imbalances?",
    options: [
      { label: "No known hormonal conditions", riskScore: 0 },
      { label: "Confirmed PCOS / Irregular ovulation", riskScore: 2 },
      { label: "Thyroid disorder (Hypo/Hyperthyroidism) or elevated Prolactin", riskScore: 2 },
    ],
  },
  {
    id: 6,
    category: 'Female Partner',
    question: "FEMALE: Do you track ovulation (LH surge urine strips, basal body temperature, cervical mucus)?",
    options: [
      { label: "Yes, clear positive ovulation confirmed regularly", riskScore: 0 },
      { label: "Inconsistent or negative ovulation predictor test results", riskScore: 2 },
      { label: "Not tracking ovulation currently", riskScore: 1 },
    ],
  },
  {
    id: 7,
    category: 'Female Partner',
    question: "FEMALE: Have you ever had pelvic inflammatory disease (PID), tubal surgery, or ruptured appendicitis?",
    options: [
      { label: "No pelvic infections or abdominal surgeries", riskScore: 0 },
      { label: "Previous pelvic infection / STI treated", riskScore: 2 },
      { label: "History of tubal pregnancy, blocked fallopian tubes, or pelvic adhesion surgery", riskScore: 3 },
    ],
  },
  {
    id: 8,
    category: 'Female Partner',
    question: "FEMALE: What is your current Body Mass Index (BMI) or general weight trend?",
    options: [
      { label: "Normal BMI (18.5 – 24.9)", riskScore: 0 },
      { label: "Underweight (BMI < 18.5)", riskScore: 1 },
      { label: "Overweight / Obese (BMI > 28) with recent sudden weight changes", riskScore: 2 },
    ],
  },
  {
    id: 9,
    category: 'Female Partner',
    question: "FEMALE: Have you ever experienced recurrent pregnancy loss (2 or more miscarriages)?",
    options: [
      { label: "No prior miscarriages / Never been pregnant", riskScore: 0 },
      { label: "1 prior miscarriage", riskScore: 1 },
      { label: "2 or more recurrent early pregnancy losses", riskScore: 3 },
    ],
  },
  {
    id: 10,
    category: 'Female Partner',
    question: "FEMALE: Have you undergone any prior baseline fertility tests (AMH, FSH, Pelvic USG)?",
    options: [
      { label: "No prior fertility testing performed", riskScore: 0 },
      { label: "Normal AMH and pelvic ultrasound reported", riskScore: 0 },
      { label: "Low AMH (< 1.1 ng/mL) or diminished ovarian reserve reported", riskScore: 3 },
    ],
  },
  {
    id: 11,
    category: 'Female Partner',
    question: "FEMALE: Do you experience symptoms of hyperandrogenism (excess facial hair, severe acne, hair thinning)?",
    options: [
      { label: "No symptoms present", riskScore: 0 },
      { label: "Mild symptoms present", riskScore: 1 },
      { label: "Moderate to severe hirsutism or persistent cystic acne", riskScore: 2 },
    ],
  },
  {
    id: 12,
    category: 'Female Partner',
    question: "FEMALE: Are you currently taking preconception Folic Acid (400–800 mcg/day) or Prenatal Vitamins?",
    options: [
      { label: "Yes, taking daily preconception folic acid / prenatals", riskScore: 0 },
      { label: "No, not taking any supplements currently", riskScore: 1 },
    ],
  },

  // MALE PARTNER EVALUATION
  {
    id: 13,
    category: 'Male Partner',
    question: "MALE: What is the age of the male partner?",
    options: [
      { label: "Under 40 years", riskScore: 0 },
      { label: "40 – 45 years", riskScore: 1 },
      { label: "Over 45 years (Sperm DNA fragmentation risk increases)", riskScore: 2 },
    ],
  },
  {
    id: 14,
    category: 'Male Partner',
    question: "MALE: Has the male partner ever undergone a formal Semen Analysis test?",
    options: [
      { label: "Never tested", riskScore: 0 },
      { label: "Normal result (Concentration >15M/mL, Motility >40%)", riskScore: 0 },
      { label: "Abnormal result (Low sperm count, low motility, or abnormal morphology)", riskScore: 3 },
    ],
  },
  {
    id: 15,
    category: 'Male Partner',
    question: "MALE: Is there any history of varicocele, testicular trauma, mumps orchitis, or undescended testes?",
    options: [
      { label: "No history of testicular or scrotal issues", riskScore: 0 },
      { label: "History of varicocele or scrotal surgery", riskScore: 2 },
      { label: "History of severe testicular trauma or mumps in adulthood", riskScore: 2 },
    ],
  },
  {
    id: 16,
    category: 'Male Partner',
    question: "MALE: Does the male partner regularly smoke, use nicotine/vapes, drink alcohol, or sit in high-heat environments (saunas/hot tubs)?",
    options: [
      { label: "None / Healthy lifestyle habits", riskScore: 0 },
      { label: "Occasional smoking or alcohol consumption", riskScore: 1 },
      { label: "Regular smoking, high alcohol intake, or frequent heat/laptop exposure on lap", riskScore: 2 },
    ],
  },
  {
    id: 17,
    category: 'Male Partner',
    question: "MALE: Are there any concerns regarding erectile dysfunction, ejaculatory frequency, or reduced libido?",
    options: [
      { label: "No sexual performance or timing issues", riskScore: 0 },
      { label: "Occasional difficulty timing intercourse around fertile window", riskScore: 1 },
      { label: "Persistent erectile or ejaculatory dysfunction present", riskScore: 2 },
    ],
  },
];

export default function FertilityAssessmentQuiz({ onBookAppointment, onClose }: FertilityAssessmentQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: { label: string; riskScore: number } }>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [totalRiskScore, setTotalRiskScore] = useState(0);

  const currentQ = QUESTIONS[currentStep];
  const isOptionSelected = selectedAnswers[currentQ?.id] !== undefined;
  const isLastQuestion = currentStep === QUESTIONS.length - 1;

  const handleSelectOption = (option: { label: string; riskScore: number }) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: option,
    }));
  };

  const handleNext = () => {
    if (!isOptionSelected) return;
    if (!isLastQuestion) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isOptionSelected) return;

    const totalScore = Object.values(selectedAnswers).reduce((acc, curr) => acc + curr.riskScore, 0);
    setTotalRiskScore(totalScore);
    setIsAnalyzing(true);

    try {
      // POST assessment data to backend API
      await fetch('/api/fertility-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: selectedAnswers,
          totalRiskScore: totalScore,
          createdAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to post fertility assessment:', error);
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setShowResult(true);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 font-sans text-slate-100">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white font-bold text-lg"
          >
            ✕
          </button>
        )}

        {isAnalyzing ? (
          <div className="py-20 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 animate-ping"></div>
              <div className="w-20 h-20 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Synthesizing Clinical Profile...</h3>
              <p className="text-xs text-rose-300 font-medium animate-pulse">
                Cross-referencing ACOG & ESHRE evidence-based fertility markers
              </p>
            </div>
          </div>
        ) : showResult ? (
          <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-1">
            {totalRiskScore <= 3 ? (
              <div className="space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 text-3xl flex items-center justify-center mx-auto shadow-lg">
                  ✨
                </div>

                <div className="text-center space-y-2">
                  <span className="px-3.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    Optimal Baseline Indicators
                  </span>
                  <h2 className="text-2xl font-black text-white">Favorable Baseline Profile</h2>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
                    Your responses indicate normal ovulatory patterns and no immediate critical male/female risk flags. To optimize your conception timeline, adhere to standard evidence-based preconception protocols below.
                  </p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                    Evidence-Based Clinical Guidelines (ACOG/ESHRE Standard)
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-3">
                    <li className="flex items-start gap-2.5">
                      <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                      <div>
                        <strong>Female Supplementation:</strong> Initiate 400 mcg–800 mcg daily Folic Acid supplementation immediately to prevent neural tube defects and support early oocyte maturation.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                      <div>
                        <strong>Ovulation Window Timing:</strong> Maintain intercourse every 1 to 2 days during the 6-day fertile window (5 days prior to ovulation plus ovulation day). Use urinary LH test kits.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                      <div>
                        <strong>Male Spermatogenesis Care:</strong> Male partner should avoid scrotal heat exposure (saunas, tight attire, laptops), maintain CoQ10 & Zinc intake, and refrain from smoking.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                      <div>
                        <strong>Hydration & BMI Optimization:</strong> Target a BMI between 18.5–24.9 and 2.5L daily hydration to optimize cervical mucus consistency.
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center text-xs text-slate-400">
                  <p>
                    Should you wish to expedite your timeline or perform a proactive baseline hormone check (AMH / Semen Analysis), Dr. Santhoshi is available for a comprehensive consultation.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onBookAppointment}
                    className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
                  >
                    Schedule Specialist Review with Dr. Santhoshi →
                  </button>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="px-5 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-rose-950 border border-rose-800 text-rose-400 text-3xl flex items-center justify-center mx-auto shadow-lg">
                  🩺
                </div>

                <div className="text-center space-y-2">
                  <span className="px-3.5 py-1 rounded-full bg-rose-950 border border-rose-800 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                    Targeted Evaluation Recommended
                  </span>
                  <h2 className="text-2xl font-black text-white">Recommended Clinical Consultation</h2>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
                    Please rest assured—fertility factors are highly manageable when identified early. Based on your inputs (age parameters, cycle characteristics, or male factors), a structured clinical evaluation with Dr. Santhoshi will give you a clear roadmap forward.
                  </p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs text-slate-300">
                  <h4 className="font-bold text-rose-400 uppercase tracking-wider">Suggested Initial Diagnostic Protocol</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="text-rose-400">•</span>
                      <span><strong>Female Partner:</strong> Baseline Cycle Day 2/3 Hormone Panel (AMH, FSH, LH, TSH) & Pelvic Follicle USG.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-rose-400">•</span>
                      <span><strong>Male Partner:</strong> Computer-Assisted Semen Analysis (CASA) checking count, motility & morphology.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onBookAppointment}
                    className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
                  >
                    Book Priority Appointment with Dr. Santhoshi →
                  </button>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="px-5 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-rose-950 border border-rose-800 rounded text-[10px]">
                    {currentQ.category}
                  </span>
                  Question {currentStep + 1} of {QUESTIONS.length}
                </span>
                <span className="text-slate-400 font-mono">
                  {Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}%
                </span>
              </div>

              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug min-h-[56px] flex items-center">
              {currentQ.question}
            </h3>

            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQ.id]?.label === opt.label;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full p-4 rounded-2xl text-left text-xs font-semibold transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-950/90 border-rose-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                        isSelected
                          ? 'border-rose-400 bg-rose-500 text-white font-bold'
                          : 'border-slate-600'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentStep === 0
                    ? 'opacity-0 cursor-default'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                ← Back
              </button>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isOptionSelected}
                  className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                    isOptionSelected
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Submit Clinical Assessment ✨
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isOptionSelected}
                  className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                    isOptionSelected
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Continue →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
