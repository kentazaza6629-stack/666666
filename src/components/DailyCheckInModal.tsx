import React from 'react';
import { DetectiveProfile } from '../types';
import { 
  X, 
  Gift, 
  CheckCircle2, 
  Coins, 
  Sparkles, 
  Diamond,
  Flame,
  Award
} from 'lucide-react';
import { playClickSound, playCorrectSound, playCoinSound } from '../utils/sound';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DetectiveProfile;
  onCheckIn: (day: number, coins: number, gems: number) => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  profile,
  onCheckIn,
}) => {
  if (!isOpen) return null;

  const currentStreak = profile.dailyCheckInDays || 2;
  const hasCheckedIn = profile.hasCheckedInToday;

  const checkInDays = [
    { day: 1, label: 'วันที่ 1', coins: 50, gems: 5, icon: '🪙' },
    { day: 2, label: 'วันที่ 2', coins: 80, gems: 5, icon: '🪙' },
    { day: 3, label: 'วันที่ 3', coins: 100, gems: 10, icon: '🎁', isSpecial: true },
    { day: 4, label: 'วันที่ 4', coins: 120, gems: 10, icon: '🪙' },
    { day: 5, label: 'วันที่ 5', coins: 150, gems: 15, icon: '🪙' },
    { day: 6, label: 'วันที่ 6', coins: 200, gems: 15, icon: '💎' },
    { day: 7, label: 'วันที่ 7', coins: 500, gems: 30, icon: '👑', isSuper: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400/50 p-6 shadow-2xl shadow-amber-500/20 text-white space-y-5">
        {/* Close Button */}
        <button
          onClick={() => { playClickSound(); onClose(); }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 text-slate-950">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-300">
                เช็คอินรับรางวัลประจำวัน
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[11px] font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 fill-orange-400 text-orange-400" />
                {currentStreak} วันต่อเนื่อง
              </span>
            </div>
            <p className="text-xs text-slate-300">
              เข้าสู่ระบบทุกวันเพื่อรับเหรียญ ฿ และเพชร 💎 สะสมไอเทมตกแต่งห้อง!
            </p>
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-4 gap-2.5 pt-2">
          {checkInDays.slice(0, 4).map((d) => {
            const isCompleted = d.day <= currentStreak;
            const isToday = d.day === currentStreak + 1 && !hasCheckedIn;

            return (
              <div
                key={d.day}
                className={`relative p-3 rounded-2xl border text-center transition-all ${
                  isCompleted
                    ? 'bg-slate-800/80 border-emerald-500/40 text-slate-300'
                    : isToday
                    ? 'bg-gradient-to-b from-amber-500/20 to-orange-500/30 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20 scale-105'
                    : 'bg-slate-900/60 border-slate-800 opacity-60 text-slate-400'
                }`}
              >
                <span className="text-[11px] font-bold block">{d.label}</span>
                <div className="text-2xl my-1">{d.icon}</div>
                <div className="text-[10px] font-bold text-amber-300">+{d.coins} ฿</div>
                {d.gems > 0 && (
                  <div className="text-[10px] font-bold text-purple-300">+{d.gems} 💎</div>
                )}
                {isCompleted && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {checkInDays.slice(4, 7).map((d) => {
            const isCompleted = d.day <= currentStreak;
            const isToday = d.day === currentStreak + 1 && !hasCheckedIn;

            return (
              <div
                key={d.day}
                className={`relative p-3.5 rounded-2xl border text-center transition-all ${
                  d.isSuper
                    ? isCompleted
                      ? 'bg-amber-900/40 border-amber-500/50'
                      : 'bg-gradient-to-b from-amber-500/30 to-yellow-600/30 border-amber-400'
                    : isCompleted
                    ? 'bg-slate-800/80 border-emerald-500/40'
                    : isToday
                    ? 'bg-gradient-to-b from-amber-500/20 to-orange-500/30 border-amber-400 ring-2 ring-amber-400/50'
                    : 'bg-slate-900/60 border-slate-800 opacity-60'
                }`}
              >
                <span className="text-xs font-bold block text-slate-200">{d.label}</span>
                <div className="text-2xl my-1">{d.icon}</div>
                <div className="text-xs font-bold text-amber-300">+{d.coins} ฿</div>
                {d.gems > 0 && (
                  <div className="text-xs font-bold text-purple-300">+{d.gems} 💎</div>
                )}
                {isCompleted && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Today's Button */}
        <div className="pt-2">
          {!hasCheckedIn ? (
            <button
              onClick={() => {
                playCorrectSound();
                playCoinSound();
                const nextDay = Math.min(7, currentStreak + 1);
                const dayData = checkInDays.find(d => d.day === nextDay) || checkInDays[2];
                onCheckIn(nextDay, dayData.coins, dayData.gems);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-base font-black shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>กดรับรางวัลเช็คอินวันนี้ (วันที่ {currentStreak + 1})</span>
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center">
              <span className="text-sm font-bold text-emerald-300 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                คุณได้เช็คอินรับรางวัลประจำวันนี้แล้ว! เจอกันพรุ่งนี้นะครับ
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
