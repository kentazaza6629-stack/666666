import React, { useState } from 'react';
import { DETECTIVE_CASES } from '../data/learningContent';
import { CaseMission, SearchResult, TabType } from '../types';
import { 
  FolderLock, 
  FolderOpen, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  BookOpen, 
  FileText, 
  Award,
  Zap,
  HelpCircle,
  RotateCcw,
  Home
} from 'lucide-react';
import { playClickSound, playCorrectSound, playWrongSound, playClueFoundSound, playBadgeUnlockSound } from '../utils/sound';
import { JourneyNextStepCard } from './JourneyNextStepCard';

interface Zone4Props {
  completedCases?: string[];
  onCompleteCase: (caseId: string, expReward: number, badgeId?: string) => void;
  onSelectTab?: (tab: TabType) => void;
}

export const Zone4CaseMissions: React.FC<Zone4Props> = ({
  completedCases = [],
  onCompleteCase,
  onSelectTab,
}) => {
  const safeCompleted = completedCases || [];
  const [selectedCaseId, setSelectedCaseId] = useState<string>(DETECTIVE_CASES[0].id);
  const [searchQueryInput, setSearchQueryInput] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [inspectedClues, setInspectedClues] = useState<string[]>([]);
  const [isCaseSolved, setIsCaseSolved] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);

  const currentCase = DETECTIVE_CASES.find(c => c.id === selectedCaseId) || DETECTIVE_CASES[0];
  const isCurrentCompleted = safeCompleted.includes(currentCase.id);

  const handleSelectCase = (caseId: string) => {
    playClickSound();
    setSelectedCaseId(caseId);
    setSearchQueryInput('');
    setHasSearched(false);
    setInspectedClues([]);
    setIsCaseSolved(safeCompleted.includes(caseId));
    setShowHint(false);
  };

  const handleRunSearch = () => {
    if (!searchQueryInput.trim()) return;
    playClickSound();
    setHasSearched(true);
  };

  const handleInspectResult = (result: SearchResult) => {
    if (result.isClue && !inspectedClues.includes(result.id)) {
      playClueFoundSound();
      setInspectedClues(prev => [...prev, result.id]);
    } else if (!result.isClue) {
      playWrongSound();
    }
  };

  const handleSolveCase = () => {
    playBadgeUnlockSound();
    setIsCaseSolved(true);
    onCompleteCase(currentCase.id, currentCase.rewardExp, currentCase.badgeRewardId);
    setTimeout(() => {
      setShowVictoryModal(true);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border-2 border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <FolderLock className="w-3.5 h-3.5" /> ด่านที่ 4: วิทยาการคำนวณ ป.5
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            ลานประลองแฟ้มคดีปริศนา (Detective Case Files)
          </h2>
          <p className="text-xs sm:text-sm text-amber-200">
            นำทักษะการสกัดคำสำคัญและตัวดำเนินการมาใช้คลี่คลาย 4 คดีจริงเพื่อเก็บดาว ⭐ และ EXP
          </p>
        </div>

        {/* Case Progression status */}
        <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-300 font-bold shrink-0 relative z-10">
          <Award className="w-4 h-4 text-amber-400" />
          <span>คลี่คลายแล้ว {safeCompleted.length} / {DETECTIVE_CASES.length} คดี</span>
        </div>
      </div>

      {/* Case Selector Navigation Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {DETECTIVE_CASES.map((caseItem, idx) => {
          const isDone = safeCompleted.includes(caseItem.id);
          const isSelected = selectedCaseId === caseItem.id;

          return (
            <button
              key={caseItem.id}
              onClick={() => handleSelectCase(caseItem.id)}
              className={`p-4 rounded-3xl border-2 text-left transition-all duration-200 flex flex-col justify-between space-y-2 cursor-pointer ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-[1.02]'
                  : isDone
                  ? 'bg-slate-900 border-emerald-500/40 hover:bg-slate-800'
                  : 'bg-slate-900/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  คดี #{idx + 1}
                </span>
                {isDone ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> สำเร็จ
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    +{caseItem.rewardExp} EXP
                  </span>
                )}
              </div>

              <div className="text-sm font-black text-white line-clamp-2">
                {caseItem.title}
              </div>

              <div className="text-[11px] text-slate-400">
                หมวด: <span className="text-slate-300">{caseItem.targetSubject}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Investigation Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Case Briefing & Mission Target */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-amber-500/30 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> แฟ้มข้อมูลคดี
              </span>
              <span className="text-xs text-slate-400 font-bold">ความยาก: ป.5</span>
            </div>

            <h3 className="text-lg font-black text-white leading-snug">
              {currentCase.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentCase.storyBrief}
            </p>

            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1.5">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> เป้าหมายการสืบค้น:
              </span>
              <p className="text-xs text-slate-200">
                {currentCase.missionGoal}
              </p>
            </div>

            {/* Hint Section */}
            <div className="pt-2">
              {!showHint ? (
                <button
                  onClick={() => { playClickSound(); setShowHint(true); }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-slate-950 border border-slate-700 hover:border-amber-400 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>ขอคำใบ้จากสารวัตรไบต์</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 text-xs text-amber-200 leading-relaxed animate-fadeIn space-y-1">
                  <strong className="text-amber-300 block">🤖 คำใบ้จากสารวัตร: </strong>
                  {currentCase.explanation}
                </div>
              )}
            </div>
          </div>

          {/* Preset Suggested Keywords */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> คำค้นแนะนำสำหรับคดีนี้:
            </span>
            <div className="flex flex-wrap gap-2">
              {currentCase.targetKeywords.map((kw, kwIdx) => (
                <button
                  key={kwIdx}
                  onClick={() => {
                    playClickSound();
                    setSearchQueryInput(kw);
                    setHasSearched(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 border border-slate-700 hover:border-amber-400 text-xs font-mono transition cursor-pointer"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Search Console & Inspection Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Box */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border-2 border-slate-800 space-y-3 shadow-md">
            <label className="text-xs font-bold text-slate-300">พิมพ์คำค้นเพื่อสแกนหาเบาะแสในคดีนี้:</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQueryInput}
                  onChange={(e) => setSearchQueryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunSearch()}
                  placeholder="เช่น พิมพ์คำค้นหา หรือคลิกเลือกคำค้นแนะนำ..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                onClick={handleRunSearch}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>ค้นหา</span>
              </button>
            </div>
          </div>

          {/* Search Results Display */}
          {hasSearched ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>ผลการค้นพบสำหรับคดีนี้ ({currentCase.simulationResults.length} รายการ):</span>
                <span className="text-amber-400 font-bold">คลิกที่ผลลัพธ์เพื่อตรวจสอบเบาะแส</span>
              </div>

              <div className="space-y-3">
                {currentCase.simulationResults.map((result) => {
                  const isInspected = inspectedClues.includes(result.id);

                  return (
                    <div
                      key={result.id}
                      onClick={() => handleInspectResult(result)}
                      className={`p-4 rounded-3xl border-2 transition-all cursor-pointer ${
                        isInspected
                          ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <span className="text-[11px] font-mono text-cyan-400 block">{result.url}</span>
                          <h4 className="text-sm font-black text-white hover:text-cyan-300 transition">
                            {result.title}
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed">{result.snippet}</p>
                        </div>
                        {isInspected && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> เบาะแสจริง
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Solve Button */}
              {inspectedClues.length >= 1 && !isCaseSolved && (
                <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                  <div>
                    <h4 className="text-sm font-black text-white">✨ รวบรวมเบาะแสสำคัญครบถ้วนแล้ว!</h4>
                    <p className="text-xs text-emerald-300">คลิกเพื่อสรุปผลการสืบสวนและปิดคดี</p>
                  </div>
                  <button
                    onClick={handleSolveCase}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ปิดคดี & รับ +{currentCase.rewardExp} EXP</span>
                  </button>
                </div>
              )}

              {/* Case Solved Summary */}
              {isCaseSolved && (
                <div className="p-5 rounded-3xl bg-slate-900 border-2 border-emerald-500/50 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5" /> ภารกิจสำเร็จ! คลี่คลายคดีเรียบร้อย
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed"><strong className="text-white">ข้อเท็จจริงที่ค้นพบ: </strong>{currentCase.correctAnswerSummary}</p>
                  <p className="text-xs text-cyan-300 leading-relaxed"><strong className="text-cyan-200">บทเรียนวิทยาการคำนวณ: </strong>{currentCase.explanation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <Search className="w-10 h-10 text-slate-600 animate-pulse" />
              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-bold text-slate-300">พร้อมเริ่มต้นการสืบค้นข้อมูล</h4>
                <p className="text-xs text-slate-400">
                  พิมพ์คำค้นหา หรือคลิกที่ "คำค้นแนะนำ" ด้านบน แล้วกดปุ่มค้นหาเพื่อสแกนหาเบาะแส
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step Journey Return Card */}
      {onSelectTab && (
        <JourneyNextStepCard
          currentStepNumber={4}
          currentStepTitle="ลานประลองแฟ้มคดีปริศนา (4 คดี)"
          rewardEarnedText="ปลดล็อกเบาะแสครบถ้วน & Coins"
          onSelectTab={onSelectTab}
        />
      )}

      {/* Victory Celebration Modal (Single Return Button) */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-4 border-amber-500/50 p-6 sm:p-8 shadow-[0_0_30px_rgba(245,158,11,0.3)] text-center overflow-hidden animate-scaleUp text-white">
            {/* Ambient Glows */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Trophy Badge */}
            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4 z-10">
              <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-500 p-1 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center animate-bounce">
                <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-4xl sm:text-5xl">
                  📁
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-xs shadow-md border border-emerald-400">
                ด่าน 4 ปิดคดีแล้ว!
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 relative z-10">
              🎉 ยินดีด้วย! ปิดคดีสำเร็จ!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-5 font-medium leading-relaxed relative z-10">
              คุณสามารถสืบค้นและรวบรวมเบาะแสจนคลี่คลายคดี "{currentCase.title}" ได้อย่างยอดเยี่ยม
            </p>

            {/* Rewards Card */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-800/80 border border-amber-500/30 mb-6 relative z-10 shadow-inner">
              <div className="p-2 rounded-xl bg-slate-900 text-center border border-slate-700 shadow-sm">
                <div className="text-[10px] text-slate-400 font-bold">EXP ที่ได้รับ</div>
                <div className="text-sm font-black text-amber-400">+{currentCase.rewardExp} EXP</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 text-center border border-slate-700 shadow-sm">
                <div className="text-[10px] text-slate-400 font-bold">เหรียญทอง</div>
                <div className="text-sm font-black text-orange-400">+80 Coins</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 text-center border border-slate-700 shadow-sm">
                <div className="text-[10px] text-slate-400 font-bold">สถานะ</div>
                <div className="text-xs font-black text-emerald-400 truncate">ปิดคดีสำเร็จ</div>
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
                id="btn-victory-back-journey-zone4"
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
