import React from 'react';
import { Star, Gem } from 'lucide-react';
import { playClickSound } from '../utils/sound';
import { DetectiveProfile } from '../types';

export interface StageSubTab {
  id: string;
  label: string;
  icon?: any;
  badge?: string;
}

interface StageHeaderBannerProps {
  stageNumber: number | string;
  title: string;
  subtitle: string;
  themeGradient?: string;
  accentColor?: string;
  profile?: DetectiveProfile;
  subTabs: StageSubTab[];
  activeSubTab: string;
  onSelectSubTab: (id: string) => void;
}

export const StageHeaderBanner: React.FC<StageHeaderBannerProps> = ({
  stageNumber,
  title,
  subtitle,
  themeGradient = 'from-blue-500 via-indigo-500 to-purple-600',
  profile,
  subTabs,
  activeSubTab,
  onSelectSubTab,
}) => {
  const stars = profile?.stars ?? 0;
  const coins = profile?.coins ?? 0;
  const gems = profile?.gems ?? 0;

  return (
    <div className="space-y-4 mb-6">
      {/* 3D Ribbon Banner Header */}
      <div className={`relative rounded-3xl bg-gradient-to-r ${themeGradient} p-5 sm:p-6 text-white text-center shadow-xl shadow-indigo-500/20 overflow-hidden`}>
        {/* Decorative corner stars / sparkles */}
        <div className="absolute top-2 left-3 text-amber-300 text-base sm:text-xl animate-pulse">✨</div>
        <div className="absolute top-2 right-3 text-amber-300 text-base sm:text-xl animate-pulse">✨</div>
        <div className="absolute bottom-1.5 left-8 text-amber-200/50 text-sm">✦</div>
        <div className="absolute bottom-1.5 right-8 text-amber-200/50 text-sm">✦</div>

        {/* 3D Title */}
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-black border border-white/30 shadow-xs mb-1">
            <span>🛡️ ด่านที่ {stageNumber}</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-wide drop-shadow-md text-white">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-white/90 font-medium max-w-xl mx-auto drop-shadow-xs">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Floating Currencies Status Bar (Same as Shop / Community / Profile) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-md shadow-slate-200/50 border border-slate-100 flex items-center justify-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center shadow-xs">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-left">
            <span className="text-xs sm:text-base font-black text-slate-800 block leading-tight">
              {stars}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold">ดาว</span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-md shadow-slate-200/50 border border-slate-100 flex items-center justify-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center font-black text-xs sm:text-sm shadow-xs">
            ฿
          </div>
          <div className="text-left">
            <span className="text-xs sm:text-base font-black text-slate-800 block leading-tight">
              {coins.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold">เหรียญ</span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-md shadow-slate-200/50 border border-slate-100 flex items-center justify-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
            <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
          </div>
          <div className="text-left">
            <span className="text-xs sm:text-base font-black text-slate-800 block leading-tight">
              {gems}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold">เพชร</span>
          </div>
        </div>
      </div>

      {/* Modern Cheerful Sub-Tabs Navigation Pills */}
      {subTabs.length > 0 && (
        <div className="p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  onSelectSubTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all active:scale-95 flex-1 justify-center ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 bg-slate-50/60 border border-transparent'
                }`}
                id={`subtab-${tab.id}`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white text-emerald-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
