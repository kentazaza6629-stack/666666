import React, { useState } from 'react';
import { DetectiveProfile, TabType } from '../types';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  FolderLock, 
  Terminal, 
  GraduationCap, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  Flame, 
  Lightbulb, 
  Zap,
  Globe,
  BookOpen,
  ShoppingBag,
  Coins,
  MapPin,
  Route,
  Lock,
  Play
} from 'lucide-react';
import { playClickSound } from '../utils/sound';

interface HQOverviewProps {
  profile: DetectiveProfile;
  onSelectTab: (tab: TabType) => void;
  onOpenProfile: () => void;
}

export const HQOverview: React.FC<HQOverviewProps> = ({
  profile,
  onSelectTab,
  onOpenProfile,
}) => {
  const [mapViewMode, setMapViewMode] = useState<'journey' | 'grid'>('journey');

  const completedCases = profile.completedCases || [];
  const badges = profile.badges || [];
  const exp = profile.exp || 0;
  const maxExp = profile.maxExp || 100;
  const coins = profile.coins || 0;

  // The 8 Linear Adventure Steps
  const journeySteps = [
    {
      id: 'zone1_basics' as TabType,
      stepNumber: 1,
      title: 'ด่าน 1: พื้นฐานการค้นหา & คำสำคัญ',
      subtitle: 'รู้จัก Search Engine และฝึกสกัด Keyword',
      description: 'เรียนรู้หลักการทำงานของ Google, สกัดคำสำคัญ 3 รูปแบบ (กว้าง/แคบ/เฉพาะเจาะจง)',
      icon: Search,
      color: 'from-cyan-500 to-blue-600',
      isCompleted: exp >= 80,
      rewardText: '+100 EXP & +40 🪙',
      tip: 'เริ่มจากด่านนี้ก่อนเลย! เข้าใจ Keyword ชีวิตจะง่ายขึ้น',
    },
    {
      id: 'zone2_spells' as TabType,
      stepNumber: 2,
      title: 'ด่าน 2: คลังคาถาตัวดำเนินการลับ',
      subtitle: 'เครื่องหมาย "", -, site:, filetype: และ AND / OR',
      description: 'ฝึกเสกคาถาค้นหาขั้นเทพ ตัดคำกำกวม ค้นหาตรงเป๊ะ เจาะจงเว็บ .go.th และไฟล์ .pdf',
      icon: Sparkles,
      color: 'from-purple-500 to-indigo-600',
      isCompleted: badges.some(b => b && b.id === 'operator_wizard' && b.unlocked),
      rewardText: '+150 EXP & +60 🪙',
      tip: 'ใช้ "" ล็อกคำค้นหา และใช้ - ตัดสิ่งที่ไม่ต้องการออก',
    },
    {
      id: 'zone3_trust' as TabType,
      stepNumber: 3,
      title: 'ด่าน 3: แล็บความน่าเชื่อถือ & นามสกุลเว็บ',
      subtitle: 'ถอดรหัสนามสกุลเว็บ & จับผิด Fake News',
      description: 'เจาะลึกโดเมน .go.th, .ac.th, .or.th และใช้หลัก 5W1H ประเมินความน่าเชื่อถือ',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600',
      isCompleted: badges.some(b => b && b.id === 'fake_news_buster' && b.unlocked),
      rewardText: '+180 EXP & +70 🪙',
      tip: 'ข้อมูลจาก .go.th และ .ac.th น่าเชื่อถือสูงสุด!',
    },
    {
      id: 'zone4_cases' as TabType,
      stepNumber: 4,
      title: 'ด่าน 4: ลานประลองแฟ้มคดีปริศนา (4 คดี)',
      subtitle: 'สวมบทนักสืบดิจิทัล คลี่คลายคดีเสมือนจริง',
      description: 'นำวิชาค้นหาไปไขคดีสัตว์ป่าสงวน โลกร้อน สุริยุปราคา และประวัติศาสตร์อยุธยา',
      icon: FolderLock,
      color: 'from-amber-500 to-orange-600',
      isCompleted: completedCases.length === 4,
      rewardText: `คลี่คลายแล้ว ${completedCases.length}/4 คดี`,
      tip: 'อ่านคำใบ้ สกัดคำค้น แล้วเปิดแฟ้มคดีให้ครบทั้ง 4 คดี',
    },
    {
      id: 'zone5_sandbox' as TabType,
      stepNumber: 5,
      title: 'ด่าน 5: จำลองสืบค้น & ผู้ช่วยสารวัตร AI',
      subtitle: 'พิมพ์ค้นหาจริง + วิเคราะห์ความแม่นยำด้วย AI',
      description: 'ทดลองพิมพ์ค้นหาในระบบจำลอง ปรับแต่งฟิลเตอร์ และขอคำปรึกษาจากสารวัตรไบต์ AI',
      icon: Terminal,
      color: 'from-blue-500 to-cyan-600',
      isCompleted: (profile.solvedCluesCount || 0) >= 3,
      rewardText: 'AI Powered & ค้นพบเบาะแส',
      tip: 'ลองพิมพ์คำค้น แล้วดูคะแนนคุณภาพคำค้นหาจากระบบ AI',
    },
    {
      id: 'zone6_exam' as TabType,
      stepNumber: 6,
      title: 'ด่าน 6: สอบวัดระดับยอดนักสืบ ป.5',
      subtitle: 'แบบทดสอบ 10 ข้อ ลุ้นรับยศระดับทอง',
      description: 'ทดสอบประมวลความรู้สืบค้นสารสนเทศ ป.5 ข้อสอบ 10 ข้อ พร้อมเฉลยละเอียดทุกข้อ',
      icon: GraduationCap,
      color: 'from-rose-500 to-pink-600',
      isCompleted: (profile.quizScore || 0) >= 80,
      rewardText: (profile.quizScore || 0) > 0 ? `คะแนนสอบ ${profile.quizScore}%` : 'ยังไม่ได้สอบ',
      tip: 'ทำคะแนน 80% ขึ้นไปเพื่อรับยศยอดนักสืบระดับทอง!',
    },
    {
      id: 'reward_shop' as TabType,
      stepNumber: 7,
      title: 'ด่าน 7: ร้านแลกรางวัล & สตูดิโอห้องนอน',
      subtitle: 'นำ Coins แลกชุดสายลับ & จัดห้องสืบสวน',
      description: 'แต่งตัวอวาตาร์ด้วยหมวก แว่นตา ชุดสูท สัตว์เลี้ยงโดรน และจัดวางเตียงนอนโต๊ะทำงาน',
      icon: ShoppingBag,
      color: 'from-amber-500 to-yellow-600',
      isCompleted: (profile.coins || 0) > 0,
      rewardText: `สะสม 🪙 ${coins.toLocaleString()} Coins`,
      tip: 'เหรียญ Coins ได้จากการทำภารกิจและตอบคำถาม!',
    },
    {
      id: 'summary_cert' as TabType,
      stepNumber: 8,
      title: 'ด่าน 8: เกียรติบัตรทางการ & สรุปผลความสำเร็จ',
      subtitle: 'พิมพ์ใบประกาศนียบัตรยอดนักสืบสารสนเทศ',
      description: 'ดูสรุปผลทักษะการเรียนรู้ทั้งหมด พร้อมดาวน์โหลด/พิมพ์เกียรติบัตรเป็นหลักฐานผลงาน',
      icon: Award,
      color: 'from-yellow-400 to-amber-500',
      isCompleted: (profile.quizScore || 0) >= 80,
      rewardText: 'เกียรติบัตรดิจิทัลทางการ',
      tip: 'เมื่อสอบผ่านแล้ว เข้ามารับเกียรติบัตรสุดภาคภูมิใจได้เลย!',
    },
  ];

  // Find the first non-completed core step (steps 1 to 6)
  const currentStepIndex = journeySteps.findIndex(s => !s.isCompleted && s.stepNumber <= 6);
  const activeNextStep = currentStepIndex !== -1 ? journeySteps[currentStepIndex] : journeySteps[6];

  const completedCoreCount = journeySteps.slice(0, 6).filter(s => s.isCompleted).length;
  const progressPercent = Math.round((completedCoreCount / 6) * 100);

  const handleStartStep = (tab: TabType) => {
    playClickSound();
    onSelectTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-24">
      {/* 🧭 Journey Welcome Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/90 border-2 border-cyan-500/40 p-5 sm:p-7 overflow-hidden shadow-2xl shadow-cyan-950/40">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Route className="w-3.5 h-3.5 animate-pulse" />
              <span>การเดินทางผจญภัยนักสืบสารสนเทศ ป.5</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              สวัสดีนักสืบ <span className="bg-gradient-to-r from-cyan-300 to-amber-300 bg-clip-text text-transparent">{profile.name}</span> {profile.avatar}!
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              ร่วมผจญภัยสืบหาความจริงในโลกอินเทอร์เน็ตไปทีละขั้นตอน <span className="text-cyan-300 font-semibold">ทำตามลำดับด่าน 1 ถึง 6</span> เพื่อสะสม EXP, เหรียญ 🪙 Coins, ปลดล็อกยศ และรับใบประกาศนียบัตรยอดนักสืบ!
            </p>

            {/* Current Step Big Action CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleStartStep(activeNextStep.id)}
                id="btn-journey-continue-hero"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-cyan-500/30 flex items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition animate-pulse"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>เดินทางต่อ: {activeNextStep.title.split(':')[0]}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={() => handleStartStep('reward_shop')}
                className="px-4 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-750 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-bold flex items-center gap-2 transition"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>ร้านรางวัล (🪙 {coins.toLocaleString()})</span>
              </button>
            </div>
          </div>

          {/* Quick Profile Summary Card */}
          <div 
            onClick={() => { playClickSound(); onOpenProfile(); }}
            className="w-full lg:w-72 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-4 space-y-3 cursor-pointer hover:border-cyan-400/60 transition group shadow-lg"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">สถานะนักสืบ</span>
              <span className="text-cyan-400 group-hover:underline flex items-center gap-1">
                โปรไฟล์ <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-md border border-cyan-300/40">
                {profile.avatar}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{profile.name}</div>
                <div className="text-xs text-amber-300 font-medium">{profile.rankTitle} (Lv.{profile.level})</div>
              </div>
            </div>

            {/* EXP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>ความคืบหน้า EXP</span>
                <span className="text-cyan-300 font-mono">{exp}/{maxExp}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((exp / maxExp) * 100))}%` }}
                />
              </div>
            </div>

            {/* Journey Stats */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-1.5 rounded-xl bg-slate-800/80">
                <span className="text-slate-400 block text-[10px]">ผ่านด่าน</span>
                <span className="font-bold text-cyan-400">{completedCoreCount}/6 ด่าน</span>
              </div>
              <div className="p-1.5 rounded-xl bg-slate-800/80">
                <span className="text-slate-400 block text-[10px]">เหรียญสะสม</span>
                <span className="font-bold text-amber-300">🪙 {coins.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🗺️ Big Journey Roadmap Control Header */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white flex items-center gap-2">
              <Route className="w-5 h-5 text-cyan-400" />
              เส้นทางการเดินทาง 8 ขั้นตอน (Journey Map)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold font-mono">
              สำเร็จ {progressPercent}%
            </span>
          </div>
          <p className="text-xs text-slate-400">
            คลิกที่แต่ละด่านเพื่อเข้าไปเรียนรู้และทำภารกิจ หรือกดปุ่ม "เดินทางต่อ" เพื่อไปตามลำดับ
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 shrink-0">
          <button
            onClick={() => { playClickSound(); setMapViewMode('journey'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mapViewMode === 'journey' 
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🗺️ แผนที่เดินทาง (Timeline)
          </button>
          <button
            onClick={() => { playClickSound(); setMapViewMode('grid'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mapViewMode === 'grid' 
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🗂️ การ์ดสรุป (Grid)
          </button>
        </div>
      </div>

      {/* 🛣️ TIMELINE JOURNEY MAP VIEW */}
      {mapViewMode === 'journey' && (
        <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-1 before:bg-gradient-to-b before:from-cyan-500 before:via-blue-500 before:to-amber-400 before:rounded-full">
          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            const isCurrent = step.id === activeNextStep.id;
            const isCompleted = step.isCompleted;

            return (
              <div 
                key={step.id} 
                className="relative group"
                id={`journey-step-${step.stepNumber}`}
              >
                {/* Timeline Step Node Circle on the line */}
                <div 
                  className={`absolute -left-6 sm:-left-10 top-5 w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 shadow-md ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                      : isCurrent
                      ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/30 animate-bounce'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 ring-2 ring-slate-900'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : step.stepNumber}
                </div>

                {/* Step Card */}
                <div 
                  onClick={() => handleStartStep(step.id)}
                  className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 transition-all duration-300 cursor-pointer shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden ${
                    isCurrent
                      ? 'bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] scale-[1.01]'
                      : isCompleted
                      ? 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
                  )}
                  <div className="flex items-start gap-3.5 sm:gap-4 max-w-2xl relative z-10">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${step.color} flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300">
                          ขั้นตอนที่ {step.stepNumber}
                        </span>

                        {isCompleted && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> สำเร็จแล้ว
                          </span>
                        )}

                        {isCurrent && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 animate-pulse">
                            🎯 ด่านปัจจุบันที่ต้องทำ
                          </span>
                        )}

                        <span className="text-xs text-amber-300 font-semibold font-mono">
                          🎁 {step.rewardText}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {step.title}
                      </h4>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {step.description}
                      </p>

                      <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1.5">
                        <span className="text-amber-400">💡 เคล็ดลับ:</span>
                        <span>{step.tip}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step Action Button */}
                  <div className="w-full md:w-auto flex items-center justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartStep(step.id);
                      }}
                      className={`w-full md:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition ${
                        isCurrent
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 shadow-cyan-500/25'
                          : isCompleted
                          ? 'bg-slate-800 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-750'
                      }`}
                    >
                      <span>
                        {isCurrent ? 'เริ่มทำด่านนี้เลย 🚀' : isCompleted ? 'ทบทวนด่านนี้' : 'เข้าสู่ด่านนี้'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🗂️ GRID VIEW (Alternative) */}
      {mapViewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {journeySteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                onClick={() => handleStartStep(step.id)}
                className={`rounded-3xl p-5 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden ${
                  step.isCompleted
                    ? 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-400 shadow-md shadow-emerald-950/20'
                    : step.id === activeNextStep.id
                    ? 'bg-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                {step.id === activeNextStep.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
                )}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      STEP {step.stepNumber}
                    </span>
                    {step.isCompleted ? (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านแล้ว
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-300 font-mono">
                        {step.rewardText}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${step.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-cyan-400/90 font-medium">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    {step.description}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-cyan-300 relative z-10">
                  <span>เข้าสู่ด่าน {step.stepNumber}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Daily Detective Tip (Tip of the Day) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-amber-500/30 flex items-start gap-3.5 shadow-[0_0_15px_rgba(245,158,11,0.1)] relative overflow-hidden backdrop-blur-sm">
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full pointer-events-none" />
        <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.4)] shrink-0 relative z-10">
          <Lightbulb className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="space-y-1 flex-1 relative z-10">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-amber-400">
              💡 เคล็ดลับการเดินทางของสารวัตรไบต์ (Tip of the Day)
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">
              ป.5 จำง่ายใช้จริง
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            "การสืบค้นข้อมูลในชีวิตจริง ค่อยๆ ทำตามขั้นตอน: <strong className="text-white">สกัดคำค้น (Keyword) ➔ ใส่คาถาเจาะจง ➔ เช็คนามสกุลเว็บ (.go.th/.ac.th)</strong> แค่นี้รายงานและการบ้านของน้องๆ ก็ถูกต้อง น่าเชื่อถือ และได้เกรด 4 แน่นอน!"
          </p>
        </div>
      </div>
    </div>
  );
};
