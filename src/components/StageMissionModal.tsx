import React from 'react';
import { TabType, DetectiveProfile } from '../types';
import { 
  X, 
  Sparkles, 
  Star, 
  Coins, 
  Award, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  Search, 
  BookOpen, 
  FolderLock, 
  Terminal, 
  GraduationCap,
  Gem,
  Swords,
  ChevronRight,
  Bot,
  Lock
} from 'lucide-react';
import { playClickSound, playWrongSound } from '../utils/sound';
import { isStageUnlocked } from '../utils/stageUnlock';

export interface StageInfo {
  stepNumber: number | string;
  tab: TabType;
  title: string;
  subtitle: string;
  description: string;
  objectives: string[];
  starsEarned: number;
  maxStars: number;
  starReward: number;
  coinReward: number;
  gemReward: number;
  badgeRewardTitle?: string;
  themeColor: string;
  accentColor?: string;
  icon?: any;
}

interface StageMissionModalProps {
  isOpen: boolean;
  stage: StageInfo | null;
  profile?: DetectiveProfile;
  onClose: () => void;
  onStartStage: (tab: TabType) => void;
}

export const StageMissionModal: React.FC<StageMissionModalProps> = ({
  isOpen,
  stage,
  profile,
  onClose,
  onStartStage,
}) => {
  if (!isOpen || !stage) return null;

  const isUnlocked = isStageUnlocked(stage.tab, profile);
  const Icon = stage.icon || ShieldCheck;
  const starsCount = stage.starsEarned || 3;
  const maxStars = stage.maxStars || 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-[32px] bg-gradient-to-b from-sky-100 via-white to-slate-50 border-4 border-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top 3D Ribbon / Banner Header */}
        <div className="relative bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 px-6 pt-5 pb-7 text-center text-white shadow-md">
          {/* Close button */}
          <button
            onClick={() => { playClickSound(); onClose(); }}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-transform active:scale-90"
            id="btn-close-stage-modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Decorative Sparkles */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-amber-300 text-lg animate-pulse">✨</span>
            <h2 className="text-xl sm:text-2xl font-black tracking-wide drop-shadow-sm text-white">
              ด่านที่ {stage.stepNumber}
            </h2>
            <span className="text-amber-300 text-lg animate-pulse">✨</span>
          </div>
          <p className="text-xs text-sky-100 font-medium mt-0.5">
            ภารกิจสืบค้นสารสนเทศ ป.5
          </p>

          {/* Curved bottom edge decoration */}
          <div className="absolute -bottom-3 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-sky-100/60 rounded-t-[20px]" />
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Top Currencies Summary Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/90 rounded-2xl p-2 sm:p-2.5 shadow-sm border border-slate-100 flex items-center justify-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="text-left">
                <span className="text-xs sm:text-sm font-black text-slate-800 block leading-tight">
                  {profile?.stars ?? 250}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">ดาว</span>
              </div>
            </div>

            <div className="bg-white/90 rounded-2xl p-2 sm:p-2.5 shadow-sm border border-slate-100 flex items-center justify-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center font-bold text-xs">
                ฿
              </div>
              <div className="text-left">
                <span className="text-xs sm:text-sm font-black text-slate-800 block leading-tight">
                  {(profile?.coins ?? 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">เหรียญ</span>
              </div>
            </div>

            <div className="bg-white/90 rounded-2xl p-2 sm:p-2.5 shadow-sm border border-slate-100 flex items-center justify-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Gem className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs sm:text-sm font-black text-slate-800 block leading-tight">
                  {profile?.gems ?? 45}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">เพชร</span>
              </div>
            </div>
          </div>

          {/* Main Stage Showcase Card (Matching Reference Image Style) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-slate-200/50 flex items-center gap-3.5">
            {/* 3D Shield / Emblem Icon */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30 text-white shrink-0">
              <Icon className="w-8 h-8 drop-shadow" />
            </div>

            {/* Stage Titles & Star Ratings */}
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-black text-sky-600 uppercase tracking-wider block">
                ด่านที่ {stage.stepNumber}
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-800 truncate leading-snug">
                {stage.title}
              </h3>
              <p className="text-xs text-slate-500 truncate leading-snug mb-1">
                {stage.subtitle}
              </p>
              {/* Star Rating Progress */}
              <div className="flex items-center gap-1">
                {Array.from({ length: maxStars }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < starsCount
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-300'
                    }`}
                  />
                ))}
                <span className="text-[10px] font-bold text-amber-500 ml-1">
                  {starsCount}/{maxStars} ดาว
                </span>
              </div>
            </div>
          </div>

          {/* Detective Briefing / Story */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white p-0.5 shadow-sm shrink-0">
              <img
                src="/images/cute_robot_mascot_1788247457628.jpg"
                alt="Robot Mascot"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-xs text-slate-700">
              <span className="font-bold text-sky-800 block">🤖 คำแนะนำจากสารวัตรไบต์:</span>
              <p className="mt-0.5 leading-relaxed text-slate-600">{stage.description}</p>
            </div>
          </div>

          {/* Learning Objectives Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <span>🎯</span>
              <span>เป้าหมายการเรียนรู้ในด่านนี้</span>
            </h4>
            <div className="space-y-1.5">
              {stage.objectives.map((obj, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-150 shadow-xs text-xs text-slate-700 font-medium"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="leading-snug">{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reward Cards */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <span>🎁</span>
              <span>รางวัลเมื่อผ่านด่านนี้</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-600 font-black text-xs sm:text-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>+{stage.starReward}</span>
                </div>
                <span className="text-[10px] text-amber-700 font-bold block mt-0.5">ดาวสะสม</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-yellow-50/80 border border-yellow-200/70 text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-600 font-black text-xs sm:text-sm">
                  <span className="text-xs">฿</span>
                  <span>+{stage.coinReward}</span>
                </div>
                <span className="text-[10px] text-yellow-700 font-bold block mt-0.5">เหรียญทอง</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-purple-50/80 border border-purple-200/70 text-center">
                <div className="flex items-center justify-center gap-1 text-purple-600 font-black text-xs sm:text-sm">
                  <Gem className="w-3.5 h-3.5 text-purple-500" />
                  <span>+{stage.gemReward}</span>
                </div>
                <span className="text-[10px] text-purple-700 font-bold block mt-0.5">เพชรลักกี้</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom CTA Action Button */}
        <div className="p-4 bg-white border-t border-slate-100">
          {isUnlocked ? (
            <button
              onClick={() => {
                playClickSound();
                onClose();
                onStartStage(stage.tab);
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm sm:text-base font-black shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
              id="btn-start-stage-cta"
            >
              <Play className="w-5 h-5 fill-white text-white" />
              <span>เข้าสู่ด่านที่ {stage.stepNumber} ทันที!</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled
              onClick={() => playWrongSound()}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-200 border border-slate-300 text-slate-500 text-sm font-black flex items-center justify-center gap-2 cursor-not-allowed opacity-90 shadow-sm"
              id="btn-start-stage-cta-locked"
            >
              <Lock className="w-5 h-5 text-slate-400" />
              <span>🔒 ด่านนี้ยังถูกล็อกอยู่ (ทำด่านก่อนหน้าให้สำเร็จก่อน)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

