import React, { useState, useEffect } from 'react';
import { DetectiveProfile, TabType } from '../types';
import { 
  Search, 
  Volume2, 
  VolumeX, 
  Flame, 
  Gift,
  Heart,
  Music,
  GraduationCap
} from 'lucide-react';
import { 
  playClickSound, 
  startBgm, 
  stopBgm, 
  isBgmPlaying, 
  toggleBgm 
} from '../utils/sound';

interface HeaderProps {
  currentTab?: TabType;
  activeTab?: TabType;
  onSelectTab: (tab: TabType) => void;
  profile: DetectiveProfile;
  onOpenProfile: () => void;
  soundEnabled?: boolean;
  onToggleSound: () => void;
  onOpenLuckyChest?: () => void;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  activeTab,
  onSelectTab,
  profile,
  onOpenProfile,
  onToggleSound,
  onOpenLuckyChest,
  onOpenAuthModal,
}) => {
  const coins = profile.coins || 0;
  const health = profile.health || 5;
  const streak = profile.streak || 1;

  const [bgmActive, setBgmActive] = useState<boolean>(isBgmPlaying());

  const handleToggleBgm = () => {
    playClickSound();
    const nextState = toggleBgm();
    setBgmActive(nextState);
  };

  const maxExp = profile.maxExp || 100;
  const expPercent = Math.min(100, Math.round(((profile.exp || 0) / maxExp) * 100));

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-cyan-500/30 shadow-xl shadow-cyan-950/30">
      {/* Top Bar: Brand, Profile & Stats */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div 
          onClick={() => { playClickSound(); onSelectTab('hq_overview'); }}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="btn-brand-logo"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/40 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Search className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-cyan-300 via-blue-200 to-amber-300 bg-clip-text text-transparent tracking-wide">
                InfoQuest RPG
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                ป.5
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              เกมผจญภัยสืบค้นข้อมูลสารสนเทศ
            </p>
          </div>
        </div>

        {/* Center: RPG Health Hearts & Combo */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Hearts Bar */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-rose-500/40 px-3 py-1.5 rounded-2xl shadow-inner shadow-rose-950/50">
            <span className="text-[11px] text-rose-300 font-black mr-1">HP:</span>
            {[1, 2, 3, 4, 5].map((heartIndex) => (
              <Heart
                key={heartIndex}
                className={`w-4 h-4 transition-all duration-300 ${
                  heartIndex <= health
                    ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse'
                    : 'text-slate-800 fill-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Combo Multiplier */}
          {streak > 1 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 px-2.5 py-1 rounded-2xl text-amber-300 text-xs font-black animate-pulse shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>COMBO x{streak}!</span>
            </div>
          )}
        </div>

        {/* Right Section: Detective Card & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* 8-bit BGM Toggle */}
          <button
            onClick={handleToggleBgm}
            title={bgmActive ? 'ปิดเพลงประกอบ 8-bit BGM' : 'เปิดเพลงประกอบ 8-bit BGM'}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
              bgmActive
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-md shadow-purple-500/20 animate-pulse'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-purple-300'
            }`}
          >
            <Music className="w-4 h-4" />
            <span className="hidden xl:inline text-[10px]">BGM</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={() => { playClickSound(); onToggleSound(); }}
            id="btn-sound-toggle"
            title={profile.soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
          >
            {profile.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Lucky Treasure Chest Button */}
          {onOpenLuckyChest && (
            <button
              onClick={() => { playClickSound(); onOpenLuckyChest(); }}
              title="เปิดหีบสมบัติปริศนาลักกี้"
              className="p-2 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/30 hover:scale-105 active:scale-95 transition-transform flex items-center gap-1"
            >
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline text-[10px]">หีบสมบัติ</span>
            </button>
          )}

          {/* Coins Balance Shortcut */}
          <button 
            onClick={() => { playClickSound(); onSelectTab('reward_shop'); }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-amber-300 text-xs font-black hover:bg-amber-500/30 transition shadow-sm active:scale-95"
            id="btn-header-coins"
            title="คลิกเพื่อไปร้านค้าของรางวัล & ตกแต่งห้องนอน"
          >
            <span className="text-sm">🪙</span>
            <span>{coins.toLocaleString()}</span>
          </button>

          {/* Auth / Login Status Button */}
          {onOpenAuthModal && (
            <button
              onClick={() => { playClickSound(); onOpenAuthModal(); }}
              id="btn-open-auth-modal"
              title={profile.authUser ? `เข้าสู่ระบบด้วย: ${profile.authUser.name}` : 'เข้าสู่ระบบ'}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-cyan-500/40 hover:border-cyan-400 text-xs font-bold transition shadow-sm active:scale-95 text-slate-200"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{profile.authUser?.role === 'teacher' ? '👩‍🏫' : '🔑'}</span>
                <span className="hidden md:inline text-[11px] text-cyan-300">
                  {profile.authUser ? (profile.authUser.role === 'teacher' ? 'ครูผู้สอน' : profile.authUser.classroom || 'นักเรียน') : 'ล็อกอิน'}
                </span>
              </div>
            </button>
          )}

          {/* Exclusive Teacher Portal Shortcut - Visible ONLY to Teachers */}
          {profile.authUser?.role === 'teacher' && (
            <button
              onClick={() => { playClickSound(); onSelectTab('teacher_portal'); }}
              id="btn-header-teacher-portal"
              title="เข้าสู่แดชบอร์ดจัดการการเรียนรู้สำหรับครูผู้สอน"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition shadow-md active:scale-95 border ${
                (currentTab || activeTab) === 'teacher_portal'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black shadow-emerald-500/40'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/50 font-bold shadow-emerald-950/40'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">ระบบคุณครู</span>
            </button>
          )}

          {/* Profile Card Button */}
          <button
            onClick={() => { playClickSound(); onOpenProfile(); }}
            id="btn-open-profile-card"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 hover:from-slate-800 hover:to-slate-750 border-2 border-cyan-500/40 hover:border-cyan-400/80 shadow-md shadow-cyan-950/40 transition group active:scale-95"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-base shadow-sm group-hover:scale-105 transition overflow-hidden border border-cyan-300/40">
              {profile.customAvatarImage ? (
                <img
                  src={profile.customAvatarImage}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                profile.avatar
              )}
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100 max-w-[80px] truncate">
                  {profile.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full font-black">
                  Lv.{profile.level}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-16 sm:w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 via-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" 
                    style={{ width: `${expPercent}%` }}
                  />
                </div>
                <span className="text-[9px] text-amber-300 font-mono font-black">{profile.exp} XP</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
