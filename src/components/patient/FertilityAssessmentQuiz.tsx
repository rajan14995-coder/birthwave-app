'use client';

import React, { useState } from 'react';

interface FertilityAssessmentQuizProps {
  onBookAppointment: () => void;
  onClose?: () => void;
}

interface Question {
  id: number;
  question: string;
  options: { label: string; riskScore: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is your primary goal for today's assessment?",
    options: [
      { label: "Planning to conceive in the next 6-12 months", riskScore: 0 },
      { label: "Actively trying to conceive for > 12 months", riskScore: 2 },
      { label: "Irregular cycle tracking & overall wellness check", riskScore: 1 },
      { label: "PCOS / Thyroid / Hormonal evaluation", riskScore: 2 },
    ],
  },
  {
    id: 2,
    question: "How regular are your menstrual cycles?",
    options: [
      { label: "Regular (26–32 days)", riskScore: 0 },
      { label: "Slightly irregular (varies by a few days)", riskScore: 1 },
      { label: "Highly irregular (missed months or > 35 days)", riskScore: 2 },
      { label: "Currently on medication or post-contraceptive", riskScore: 1 },
    ],
  },
  {
    id: 3,
    question: "Have you or your partner experienced any known reproductive health conditions?",
    options: [
      { label: "None / Unaware of any conditions", riskScore: 0 },
      { label: "Diagnosed PCOS or Endometriosis", riskScore: 2 },
      { label: "Male factor / Low sperm parameters reported", riskScore: 2 },
      { label: "Previous thyroid or metabolic imbalances", riskScore: 1 },
    ],
  },
  {
    id: 4,
    question: "Are you currently taking any preconception supplements or tracking ovulation?",
    options: [
      { label: "Yes, taking Folic Acid & tracking ovulation regularly", riskScore: 0 },
      { label: "Tracking cycles, but not taking supplements yet", riskScore: 0 },
      { label: "Not tracking or taking supplements currently", riskScore: 1 },
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

  const handleSubmit = () => {
    if (!isOptionSelected) return;

    // Calculate overall risk
    const totalScore = Object.values(selectedAnswers).reduce((acc, curr) => acc + curr.riskScore, 0);
    setTotalRiskScore(totalScore);

    // Trigger 2-second AI analysis loader
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 font-sans text-slate-100">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white font-bold text-lg"
          >
            ✕
          </button>
        )}

        {/* 1. LOADING STATE (2 SECONDS) */}
        {isAnalyzing ? (
          <div className="py-16 text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 animate-ping"></div>
              <div className="w-16 h-16 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Analyzing Your Responses...</h3>
              <p className="text-xs text-rose-300 font-medium animate-pulse">
                Evaluating clinical indicators with Dr. Santhoshi AI Diagnostic Matrix
              </p>
            </div>
          </div>
        ) : showResult ? (
          /* 2. RESULTS VIEW */
          <div className="space-y-6">
            
            {totalRiskScore <= 1 ? (
              /* RESULT A: EVERYTHING LOOKS GOOD */
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 text-2xl flex items-center justify-center mx-auto shadow-lg">
                  ✨
                </div>

                <div className="text-center space-y-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    Optimal Health Indicators
                  </span>
                  <h2 className="text-2xl font-black text-white">You & Your Partner Look Great!</h2>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                    Based on your responses, your baseline parameters show no immediate high-risk concerns. To maintain ideal fertility health, we recommend following these core wellness steps:
                  </p>
                </div>

                {/* Recommendations Grid */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Dr. Santhoshi Baseline Recommendations</h4>
                  <ul className="text-xs text-slate-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span><strong>Folic Acid Intake:</strong> Start 400 mcg daily preconception folic acid supplementation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span><strong>Active Lifestyle:</strong> Maintain 30 minutes of daily moderate walking or physical activity.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span><strong>Hydration & Nutrition:</strong> Aim for 2.5–3 liters of water daily alongside rich leafy greens.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span><strong>Ovulation Tracking:</strong> Monitor your fertile window using ovulation predictor kits (OPKs).</span>
                    </li>
                  </ul>
                </div>

                <p className="text-[11px] text-slate-400 text-center italic">
                  Have specific questions or want a personalized preconception consultation? You can book an appointment anytime.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={onBookAppointment}
                    className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
                  >
                    Book Consultation with Dr. Santhoshi →
                  </button>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* RESULT B: RECOMMENDED CONSULTATION */
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-950 border border-amber-800 text-amber-400 text-2xl flex items-center justify-center mx-auto shadow-lg">
                  🩺
                </div>

                <div className="text-center space-y-2">
                  <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-800 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    Specialist Review Advised
                  </span>
                  <h2 className="text-2xl font-black text-white">We Recommend a Personalized Consultation</h2>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                    Don't worry—every fertility journey is unique! Considering your clinical indicators, scheduling a comprehensive assessment with Dr. Santhoshi will help us tailor an accurate evaluation for you.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p className="font-bold text-rose-400">What happens during your visit?</p>
                  <p className="text-slate-400">
                    Dr. Santhoshi will review your cycle patterns, run targeted blood hormone panels, and create a targeted, step-by-step fertility pathway designed specifically for you and your partner.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onBookAppointment}
                    className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
                  >
                    Schedule Consultation with Dr. Santhoshi →
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
          /* 3. STEP-BY-STEP QUESTIONNAIRE */
          <div className="space-y-6">
            
            {/* Header / Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-rose-400 uppercase tracking-wider">
                  Question {currentStep + 1} of {QUESTIONS.length}
                </span>
                <span className="text-slate-400 font-mono">
                  {Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}% Completed
                </span>
              </div>

              {/* Progress bar line */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Heading */}
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentQ.question}
            </h3>

            {/* Radio / Selection Options */}
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
                        ? 'bg-rose-950/80 border-rose-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
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

            {/* Bottom Controls */}
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
                  Submit Assessment ✨
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
