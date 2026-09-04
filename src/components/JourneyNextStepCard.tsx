import React from 'react';
import { TabType } from '../types';
import { CheckCircle2, Sparkles, Home, Star, ArrowRight } from 'lucide-react';
import { playClickSound } from '../utils/sound';

interface JourneyNextStepCardProps {
  currentStepNumber: number;
  currentStepTitle: string;
  nextTab?: TabType;
  nextStepTitle?: string;
  nextStepDesc?: string;
  rewardEarnedText?: string;
  onSelectTab: (tab: TabType) => void;
}

export const JourneyNextStepCard: React.FC<JourneyNextStepCardProps> = ({
  currentStepNumber,
  currentStepTitle,
  rewardEarnedText = '+EXP & เหรียญรางวัลสะสมเรียบร้อย',
  onSelectTab,
}) => {
  const handleReturnToJourney = () => {
    playClickSound();
    onSelectTab('hq_overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-8 rounded-3xl bg-gradient-to-b from-white via-sky-50/50 to-emerald-50/40 border-2 border-sky-300 p-6 sm:p-8 shadow-xl shadow-sky-950/10 text-center relative overflow-hidden">
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-sky-400/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl mx-auto space-y-4 relative z-10">
        {/* Step completed badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-500/30">
          <CheckCircle2 className="w-4 h-4" />
          <span>🎉 เยี่ยมมาก! ทำภารกิจด่านที่ {currentStepNumber} สำเร็จแล้ว</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-800">
          {currentStepTitle}
        </h3>

        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          ยอดเยี่ยมมากนักสืบตัวน้อย! คุณได้เรียนรู้ทักษะสำคัญประจำด่านนี้ครบถ้วน พร้อมออกเดินทางสำรวจด่านต่อไปบนแผนที่ผจญภัย
        </p>

        {rewardEarnedText && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-100/90 text-amber-900 text-xs font-black border border-amber-300 shadow-sm">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>รางวัล: {rewardEarnedText}</span>
          </div>
        )}

        {/* Single Primary Action Button to Return to Journey Map */}
        <div className="pt-3">
          <button
            onClick={handleReturnToJourney}
            id="btn-return-journey-map"
            className="w-full sm:w-auto mx-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white text-sm sm:text-base font-black shadow-xl shadow-teal-600/30 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span>🗺️ กลับสู่หน้าเดินทาง (Journey Map)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

