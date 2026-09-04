import React, { useState } from 'react';
import { DetectiveProfile } from '../types';
import { 
  X, 
  Sparkles, 
  Gift, 
  Key, 
  Coins, 
  Gem, 
  Award, 
  RotateCcw,
  Star
} from 'lucide-react';
import { 
  playChestOpenSound, 
  playCoinSound, 
  playClickSound, 
  playWrongSound 
} from '../utils/sound';

interface LuckyTreasureChestModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DetectiveProfile;
  onUpdateProfile: (updater: Partial<DetectiveProfile> | ((prev: DetectiveProfile) => DetectiveProfile)) => void;
}

interface PrizeItem {
  id: string;
  name: string;
  type: 'coins' | 'gems' | 'stars' | 'exp' | 'key';
  amount: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const POSSIBLE_PRIZES: PrizeItem[] = [
  { id: 'c1', name: 'ถุงเหรียญทองนักสำรวจ', type: 'coins', amount: 150, icon: '🪙', rarity: 'common' },
  { id: 'c2', name: 'หีบทองคำโบราณ', type: 'coins', amount: 350, icon: '💰', rarity: 'rare' },
  { id: 'g1', name: 'เพชรเวทมนตร์สีฟ้า', type: 'gems', amount: 15, icon: '💎', rarity: 'rare' },
  { id: 'g2', name: 'ผลึกเพชรมานาบริสุทธิ์', type: 'gems', amount: 35, icon: '🔮', rarity: 'epic' },
  { id: 's1', name: 'ดาวเกียรติยศนักสืบ', type: 'stars', amount: 80, icon: '⭐', rarity: 'rare' },
  { id: 'e1', name: 'ขวดโพชั่น EXP เร่งรัด', type: 'exp', amount: 120, icon: '🧪', rarity: 'common' },
  { id: 'k1', name: 'กุญแจทองคำโบราณ', type: 'key', amount: 2, icon: '🗝️', rarity: 'legendary' },
];

export const LuckyTreasureChestModal: React.FC<LuckyTreasureChestModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [chestState, setChestState] = useState<'idle' | 'opening' | 'opened'>('idle');
  const [reward, setReward] = useState<PrizeItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCoins = profile.coins || 0;
  const currentKeys = profile.keys || 0;
  const CHEST_COST = 60; // 60 coins to open, or 1 free key

  const handleOpenChest = (useKey: boolean = false) => {
    if (useKey && currentKeys < 1) {
      playWrongSound();
      setErrorMessage('คุณไม่มีกุญแจสมบัติ! สามารถใช้ 60 เหรียญทองแทนได้');
      return;
    }

    if (!useKey && currentCoins < CHEST_COST) {
      playWrongSound();
      setErrorMessage('เหรียญทองไม่เพียงพอ! ไปทำภารกิจสืบข้อมูลเพื่อรับเหรียญเพิ่มนะ');
      return;
    }

    setErrorMessage(null);
    setChestState('opening');
    playClickSound();

    // Deduct key or coins immediately
    onUpdateProfile(prev => ({
      ...prev,
      keys: useKey ? Math.max(0, (prev.keys || 0) - 1) : (prev.keys || 0),
      coins: !useKey ? Math.max(0, (prev.coins || 0) - CHEST_COST) : (prev.coins || 0),
    }));

    // Random prize based on weights
    const selectedPrize = POSSIBLE_PRIZES[Math.floor(Math.random() * POSSIBLE_PRIZES.length)];

    setTimeout(() => {
      setChestState('opened');
      setReward(selectedPrize);
      playChestOpenSound();

      // Award prize
      onUpdateProfile(prev => {
        const next = { ...prev };
        if (selectedPrize.type === 'coins') next.coins = (next.coins || 0) + selectedPrize.amount;
        if (selectedPrize.type === 'gems') next.gems = (next.gems || 0) + selectedPrize.amount;
        if (selectedPrize.type === 'stars') next.stars = (next.stars || 0) + selectedPrize.amount;
        if (selectedPrize.type === 'exp') next.exp = (next.exp || 0) + selectedPrize.amount;
        if (selectedPrize.type === 'key') next.keys = (next.keys || 0) + selectedPrize.amount;

        return next;
      });
    }, 1400);
  };

  const handleReset = () => {
    playClickSound();
    setChestState('idle');
    setReward(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-slate-900 border-2 border-amber-500/50 p-6 sm:p-8 space-y-6 shadow-2xl relative animate-fadeIn overflow-hidden">
        
        {/* Glow behind chest */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              หีบสมบัติปริศนานักผจญภัย
            </h3>
          </div>
          <button
            onClick={() => { playClickSound(); onClose(); }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Currency Display */}
        <div className="flex items-center justify-center gap-4 py-2 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Coins className="w-4 h-4" />
            <span>{currentCoins} เหรียญ</span>
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Key className="w-4 h-4" />
            <span>{currentKeys} กุญแจ</span>
          </div>
        </div>

        {/* Interactive Chest Visual */}
        <div className="py-6 flex flex-col items-center justify-center relative">
          {chestState === 'idle' && (
            <div className="group cursor-pointer flex flex-col items-center gap-3 transition-transform hover:scale-105">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-700 via-amber-500 to-yellow-300 p-1 shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center text-6xl select-none">
                🎁
              </div>
              <span className="text-xs font-bold text-amber-300 animate-pulse">
                แตะปุ่มด้านล่างเพื่อเปิดหีบ!
              </span>
            </div>
          )}

          {chestState === 'opening' && (
            <div className="flex flex-col items-center gap-4 animate-bounce">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-1 shadow-[0_0_50px_rgba(245,158,11,0.8)] flex items-center justify-center text-6xl animate-spin">
                ✨
              </div>
              <span className="text-sm font-black text-amber-300">
                กำลังปลดล็อกหีบสมบัติ...
              </span>
            </div>
          )}

          {chestState === 'opened' && reward && (
            <div className="flex flex-col items-center gap-4 animate-fadeIn">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-1 shadow-[0_0_40px_rgba(217,70,239,0.6)] flex items-center justify-center text-6xl animate-pulse">
                {reward.icon}
              </div>
              <div className="text-center space-y-1">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  {reward.rarity}
                </span>
                <h4 className="text-base font-black text-white">{reward.name}</h4>
                <p className="text-sm font-bold text-emerald-400">
                  +{reward.amount} {reward.type}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-bold text-center">
            {errorMessage}
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-2">
          {chestState === 'idle' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={currentKeys < 1}
                onClick={() => handleOpenChest(true)}
                className={`py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                  currentKeys >= 1
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>ใช้ 1 กุญแจ (ฟรี)</span>
              </button>

              <button
                disabled={currentCoins < CHEST_COST}
                onClick={() => handleOpenChest(false)}
                className={`py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                  currentCoins >= CHEST_COST
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>ใช้ {CHEST_COST} เหรียญ</span>
              </button>
            </div>
          )}

          {chestState === 'opened' && (
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>เปิดหีบต่อไป</span>
              </button>
              <button
                onClick={() => { playClickSound(); onClose(); }}
                className="py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                เสร็จสิ้น
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
