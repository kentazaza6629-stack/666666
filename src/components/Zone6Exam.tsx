import React, { useState } from 'react';
import { DETECTIVE_EXAM_QUESTIONS } from '../data/learningContent';
import { TabType } from '../types';
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  HelpCircle,
  FileCheck,
  Home,
  Star
} from 'lucide-react';
import { playClickSound, playCorrectSound, playWrongSound, playBadgeUnlockSound } from '../utils/sound';
import { JourneyNextStepCard } from './JourneyNextStepCard';

interface Zone6Props {
  detectiveName?: string;
  onUpdateQuizScore: (score: number) => void;
  onEarnExp: (amount: number, reason: string) => void;
  onUnlockBadge?: (badgeId: string) => void;
  onGoToCertificate?: () => void;
  onSelectTab?: (tab: TabType) => void;
}

export const Zone6Exam: React.FC<Zone6Props> = ({
  detectiveName = 'นักสืบ',
  onUpdateQuizScore,
  onEarnExp,
  onUnlockBadge,
  onGoToCertificate,
  onSelectTab,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);

  const totalQuestions = DETECTIVE_EXAM_QUESTIONS.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectAnswer = (qId: number, optIndex: number) => {
    if (isSubmitted) return;
    playClickSound();
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const handleGradeExam = () => {
    let score = 0;
    DETECTIVE_EXAM_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });

    const percent = Math.round((score / totalQuestions) * 100);
    setFinalScore(percent);
    setIsSubmitted(true);
    onUpdateQuizScore(percent);

    if (percent >= 80) {
      playBadgeUnlockSound();
      onEarnExp(250, 'สอบวัดระดับนักสืบผ่านเกณฑ์เกียรตินิยม');
      if (onUnlockBadge) onUnlockBadge('master_detective_p5');
    } else if (percent >= 60) {
      playCorrectSound();
      onEarnExp(150, 'สอบวัดระดับนักสืบผ่านเกณฑ์');
    } else {
      playWrongSound();
      onEarnExp(50, 'ทำแบบทดสอบวัดระดับ');
    }

    setTimeout(() => {
      setShowVictoryModal(true);
    }, 600);
  };

  const handleResetExam = () => {
    playClickSound();
    setSelectedAnswers({});
    setIsSubmitted(false);
    setFinalScore(0);
    setShowVictoryModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border-2 border-rose-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_20px_rgba(244,63,94,0.15)] relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <GraduationCap className="w-3.5 h-3.5" /> ด่านที่ 6: วิทยาการคำนวณ ป.5
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            สอบวัดระดับยอดนักสืบสารสนเทศ (10 ข้อ)
          </h2>
          <p className="text-xs sm:text-sm text-rose-200">
            แบบทดสอบประมวลความรู้หน่วยการเรียนรู้ที่ 3 ครบทุกทักษะ เพื่อปลดล็อกใบประกาศนียบัตรทางการ
          </p>
        </div>

        {/* Progress Badge */}
        <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-300 font-bold shrink-0 relative z-10">
          <FileCheck className="w-4 h-4 text-rose-400" />
          <span>ตอบแล้ว {answeredCount} / {totalQuestions} ข้อ</span>
        </div>
      </div>

      {/* Score Result Summary Banner if submitted */}
      {isSubmitted && (
        <div className={`p-6 rounded-3xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-fadeIn relative overflow-hidden ${
          finalScore >= 80 
            ? 'bg-slate-900 border-emerald-500/50' 
            : 'bg-slate-900 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
        }`}>
          {finalScore >= 80 ? (
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] pointer-events-none" />
          ) : (
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] pointer-events-none" />
          )}
          
          <div className="flex items-center gap-4 text-center sm:text-left relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-slate-950 text-2xl font-extrabold shadow-[0_0_15px_rgba(255,255,255,0.2)] shrink-0 ${
              finalScore >= 80 ? 'bg-gradient-to-tr from-emerald-400 to-teal-500' : 'bg-gradient-to-tr from-amber-400 to-orange-500'
            }`}>
              {finalScore}%
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">
                {finalScore >= 80 ? '🎉 ยินดีด้วย! คุณผ่านเกณฑ์ยอดนักสืบระดับทอง' : '👏 เก่งมาก! คุณทำแบบทดสอบเสร็จสมบูรณ์'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                นักสืบ {detectiveName} ทำคะแนนได้ {Math.round((finalScore / 100) * totalQuestions)} จาก {totalQuestions} ข้อ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={handleResetExam}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> ทำใหม่
            </button>
            {onGoToCertificate && (
              <button
                onClick={onGoToCertificate}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-[0_0_10px_rgba(245,158,11,0.4)] flex items-center gap-1.5 transition cursor-pointer"
              >
                <Award className="w-4 h-4" /> ดูเกียรติบัตร
              </button>
            )}
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-5">
        {DETECTIVE_EXAM_QUESTIONS.map((q, qIdx) => {
          const userChoice = selectedAnswers[q.id];
          const isAnswered = userChoice !== undefined;
          const isCorrect = userChoice === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`p-5 sm:p-6 rounded-3xl border-2 transition-all ${
                isSubmitted
                  ? isCorrect
                    ? 'bg-slate-900 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-900 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                  : 'bg-slate-900/90 border-slate-700/50 hover:border-slate-600 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="w-8 h-8 rounded-2xl bg-rose-500/20 text-rose-300 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-500/30">
                  {qIdx + 1}
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                    {q.question}
                  </h4>
                  <span className="text-[11px] text-cyan-400 font-bold">หมวดหมู่: {q.category}</span>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userChoice === optIdx;
                  const isRightOption = q.correctIndex === optIdx;

                  let style = 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-800 hover:border-slate-700';
                  if (isSubmitted) {
                    if (isRightOption) {
                      style = 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold';
                    } else if (isSelected) {
                      style = 'bg-rose-500/20 text-rose-300 border-rose-500 font-bold';
                    }
                  } else if (isSelected) {
                    style = 'bg-rose-500/20 text-rose-300 border-rose-500 font-bold';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isSubmitted}
                      onClick={() => handleSelectAnswer(q.id, optIdx)}
                      className={`p-4 rounded-2xl border text-left text-xs transition flex items-start gap-2.5 cursor-pointer ${style}`}
                    >
                      <span className="font-mono text-slate-400 font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                      <span className="leading-relaxed font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation when submitted */}
              {isSubmitted && (
                <div className="mt-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed animate-fadeIn">
                  <strong className="text-cyan-300 block mb-1">เฉลยละเอียด: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grade Action Button */}
      {!isSubmitted && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleGradeExam}
            disabled={answeredCount < totalQuestions}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm sm:text-base shadow-[0_0_15px_rgba(244,63,94,0.5)] transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>ส่งคำตอบ & ตรวจคะแนนสอบ ({answeredCount}/{totalQuestions})</span>
          </button>
        </div>
      )}

      {/* Step Journey Return Card */}
      {onSelectTab && (
        <JourneyNextStepCard
          currentStepNumber={6}
          currentStepTitle="สอบวัดระดับยอดนักสืบ ป.5"
          rewardEarnedText="ยศยอดนักสืบ & สิทธิเข้าห้องเกียรติบัตร"
          onSelectTab={onSelectTab}
        />
      )}

      {/* Victory Celebration Modal (Single Return Button) */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-4 border-rose-500/50 p-6 sm:p-8 shadow-[0_0_30px_rgba(244,63,94,0.3)] text-center overflow-hidden animate-scaleUp text-white">
            {/* Ambient Glows */}
            <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Trophy Badge */}
            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4 z-10">
              <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 p-1 shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center justify-center animate-bounce">
                <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-4xl sm:text-5xl">
                  🎓
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md border border-amber-300">
                คะแนน {finalScore}%
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 relative z-10">
              🎉 ทำแบบทดสอบเสร็จสมบูรณ์!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-5 font-medium leading-relaxed relative z-10">
              นักสืบ {detectiveName} ทำคะแนนสอบได้ {Math.round((finalScore / 100) * totalQuestions)} จาก {totalQuestions} ข้อ ({finalScore}%)
            </p>

            {/* Rewards Card */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-800/80 border border-rose-500/30 mb-6 relative z-10 shadow-inner">
              <div className="p-2 rounded-xl bg-slate-900 text-center border border-slate-700 shadow-sm">
                <div className="text-[10px] text-slate-400 font-bold">EXP ที่ได้รับ</div>
                <div className="text-sm font-black text-rose-400">+{finalScore >= 80 ? 250 : 150} EXP</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 text-center border border-slate-700 shadow-sm">
                <div className="text-[10px] text-slate-400 font-bold">เหรียญทอง</div>
                <div className="text-sm font-black text-amber-400">+100 Coins</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 text-center border border-slate-700 shadow-sm">
                <div className="text-[10px] text-slate-400 font-bold">ระดับ</div>
                <div className="text-xs font-black text-emerald-400 truncate">{finalScore >= 80 ? 'ยอดเยี่ยม (ทอง)' : 'ผ่านเกณฑ์'}</div>
              </div>
            </div>

            {/* ONLY ONE Single Return Button */}
            <div className="relative z-10">
              <button
                onClick={() => {
                  playClickSound();
                  setShowVictoryModal(false);
                  if (onSelectTab) {
                    onSelectTab('hq_overview');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                id="btn-victory-back-journey-zone6"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base shadow-[0_0_15px_rgba(20,184,166,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-5 h-5 stroke-[2.5]" />
                <span>🗺️ กลับสู่หน้าเดินทาง</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
