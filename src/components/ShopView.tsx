import React, { useState, useEffect } from 'react';
import { DetectiveProfile, TabType } from '../types';
import { 
  Sparkles, 
  Star, 
  Coins, 
  Gem, 
  Clock, 
  ChevronRight, 
  Check, 
  ShoppingBag, 
  ShieldCheck, 
  Gift, 
  Zap, 
  X,
  Package,
  Layers,
  Sparkle
} from 'lucide-react';
import { 
  playClickSound, 
  playCoinSound, 
  playBadgeUnlockSound,
  playChestOpenSound 
} from '../utils/sound';

interface ShopViewProps {
  profile: DetectiveProfile;
  onUpdateProfile: (updated: Partial<DetectiveProfile> | ((prev: DetectiveProfile) => DetectiveProfile)) => void;
  onNavigateTab: (tab: TabType) => void;
  onShowToast: (title: string, message: string, type?: 'exp' | 'badge') => void;
  onOpenLuckyChest?: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  profile,
  onUpdateProfile,
  onNavigateTab,
  onShowToast,
  onOpenLuckyChest
}) => {
  const [chestOpening, setChestOpening] = useState<string | null>(null);
  const [chestRewardModal, setChestRewardModal] = useState<{
    name: string;
    items: string[];
    rewardCoins: number;
    rewardStars: number;
    rewardGems: number;
  } | null>(null);

  // Countdown timer for Refresh (23:45:10)
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 10 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const inventory = profile.inventory || [];
  const coins = profile.coins ?? 0;
  const stars = profile.stars ?? 0;
  const gems = profile.gems ?? 0;

  // Buy item with coins
  const handleBuyItem = (itemId: string, name: string, price: number, type: 'item' | 'wearable', rewardExp = 50) => {
    if (inventory.includes(itemId)) {
      onShowToast('มีไอเทมนี้แล้ว', 'คุณได้ซื้อไอเทมนี้เรียบร้อยแล้ว');
      return;
    }
    if (coins < price) {
      onShowToast('🪙 เหรียญไม่พอ', `ต้องการ ${price} เหรียญ (คุณมี ${coins} เหรียญ)`);
      return;
    }

    playCoinSound();
    onUpdateProfile(prev => ({
      ...prev,
      coins: Math.max(0, (prev.coins ?? 0) - price),
      inventory: Array.from(new Set([...(prev.inventory || []), itemId])),
      exp: (prev.exp || 0) + rewardExp,
    }));
    onShowToast('🎉 ซื้อสำเร็จ!', `ได้รับ "${name}" เข้าสู่กระเป๋าแล้ว!`, 'exp');
  };

  // Buy special consumable / XP boost (also adds to inventory)
  const handleBuyConsumable = (
    id: string, 
    name: string, 
    price: number, 
    effect?: (prev: DetectiveProfile) => Partial<DetectiveProfile>
  ) => {
    if (coins < price) {
      onShowToast('🪙 เหรียญไม่พอ', `ต้องการ ${price} เหรียญ (คุณมี ${coins} เหรียญ)`);
      return;
    }
    playCoinSound();
    onUpdateProfile(prev => {
      const extra = effect ? effect(prev) : {};
      return {
        ...prev,
        ...extra,
        coins: Math.max(0, (prev.coins ?? 0) - price),
        inventory: [...(prev.inventory || []), id],
      };
    });
  };

  // Open mystery chest (adds chest and rewards to inventory)
  const handleOpenChest = (chestType: 'common' | 'rare' | 'legendary', price: number, currency: 'coins' | 'gems') => {
    if (currency === 'coins' && coins < price) {
      onShowToast('🪙 เหรียญไม่พอ', `ต้องการ ${price} เหรียญ (คุณมี ${coins} เหรียญ)`);
      return;
    }
    if (currency === 'gems' && gems < price) {
      onShowToast('💎 เพชรไม่พอ', `ต้องการ ${price} เพชร (คุณมี ${gems} เพชร)`);
      return;
    }

    playChestOpenSound();
    setChestOpening(chestType);

    setTimeout(() => {
      let rCoins = 0;
      let rStars = 0;
      let rGems = 0;
      let rItems: string[] = [];
      let chestItemId = `chest_${chestType}`;

      if (chestType === 'common') {
        rCoins = Math.floor(Math.random() * 25) + 15;
        rStars = Math.floor(Math.random() * 3) + 1;
        rItems = ['ตั๋วคำใบ้ปริศนา x1'];
        onUpdateProfile(prev => ({
          ...prev,
          coins: Math.max(0, (prev.coins ?? 0) - price + rCoins),
          stars: (prev.stars ?? 0) + rStars,
          inventory: [...(prev.inventory || []), chestItemId, 'item_potion_hint']
        }));
      } else if (chestType === 'rare') {
        rCoins = Math.floor(Math.random() * 50) + 30;
        rStars = Math.floor(Math.random() * 8) + 5;
        rGems = 3;
        rItems = ['หมวกนักสืบพรีเมียม'];
        onUpdateProfile(prev => ({
          ...prev,
          coins: Math.max(0, (prev.coins ?? 0) - price + rCoins),
          stars: (prev.stars ?? 0) + rStars,
          gems: (prev.gems ?? 0) + rGems,
          inventory: [...(prev.inventory || []), chestItemId, 'hat_sherlock']
        }));
      } else {
        rCoins = Math.floor(Math.random() * 300) + 150;
        rStars = Math.floor(Math.random() * 20) + 10;
        rGems = 15;
        rItems = ['ปีกมังกรแสงดาวทองคำ (Legendary)'];
        onUpdateProfile(prev => ({
          ...prev,
          gems: Math.max(0, (prev.gems ?? 0) - price + rGems),
          coins: (prev.coins ?? 0) + rCoins,
          stars: (prev.stars ?? 0) + rStars,
          inventory: [...(prev.inventory || []), chestItemId, 'wings_dragon_gold']
        }));
      }

      setChestOpening(null);
      setChestRewardModal({
        name: chestType === 'common' ? 'กล่องธรรมดา' : chestType === 'rare' ? 'กล่องพิเศษ' : 'กล่องในตำนาน',
        items: rItems,
        rewardCoins: rCoins,
        rewardStars: rStars,
        rewardGems: rGems
      });
    }, 1200);
  };

  const padZero = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-purple-200 via-indigo-50 to-purple-100 font-sans text-slate-800 relative select-none">
      
      {/* Background Soft Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-10 left-10 w-80 h-80 bg-purple-300 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 space-y-4 relative z-10">
        
        {/* TOP PURPLE 3D BANNER: ✨ ร้านค้า ✨ */}
        <div className="flex justify-center pt-1 pb-1">
          <div className="relative inline-flex items-center justify-center">
            {/* Left/Right Ribbon Tails */}
            <div className="absolute -left-5 top-2 w-7 h-9 bg-purple-800 -skew-y-12 rounded-l-md -z-10 shadow-md" />
            <div className="absolute -right-5 top-2 w-7 h-9 bg-purple-800 skew-y-12 rounded-r-md -z-10 shadow-md" />
            
            {/* Ribbon Body */}
            <div className="px-12 sm:px-16 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 rounded-2xl text-white font-black text-xl sm:text-2xl shadow-xl shadow-purple-600/30 flex items-center gap-2 border-t border-purple-300">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span className="tracking-wide drop-shadow-md">ร้านค้า</span>
              <span className="text-amber-300 text-lg">✦</span>
            </div>

            {/* Top Right Golden Star */}
            <div className="absolute -top-3 -right-3.5 w-8 h-8 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-xl rotate-12 flex items-center justify-center text-white shadow-md shadow-amber-400/50 border-2 border-white animate-bounce">
              <Star className="w-4 h-4 fill-white text-white" />
            </div>
          </div>
        </div>

        {/* CURRENCY BAR (Matching image: ⭐ 250 ดาว, ฿ 1,250 เหรียญ, 💎 45 เพชร) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 max-w-lg mx-auto">
          {/* Stars */}
          <div className="flex items-center justify-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-sm border border-purple-100">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-white shadow-xs">
              <Star className="w-4 h-4 fill-white text-white" />
            </div>
            <div className="text-left">
              <span className="block font-black text-sm text-slate-800 leading-none">
                {stars.toLocaleString()}
              </span>
              <span className="block text-[10px] text-slate-400 font-bold leading-none mt-0.5">ดาว</span>
            </div>
          </div>

          {/* Coins */}
          <div className="flex items-center justify-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-sm border border-purple-100">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-xs">
              ฿
            </div>
            <div className="text-left">
              <span className="block font-black text-sm text-slate-800 leading-none">
                {coins.toLocaleString()}
              </span>
              <span className="block text-[10px] text-slate-400 font-bold leading-none mt-0.5">เหรียญ</span>
            </div>
          </div>

          {/* Gems */}
          <div className="flex items-center justify-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-sm border border-purple-100">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center text-white shadow-xs">
              <Gem className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-left">
              <span className="block font-black text-sm text-slate-800 leading-none">
                {gems.toLocaleString()}
              </span>
              <span className="block text-[10px] text-slate-400 font-bold leading-none mt-0.5">เพชร</span>
            </div>
          </div>
        </div>

        {/* MAIN SHOP CONTAINER */}
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-xl border-4 border-white/90 p-4 sm:p-6 space-y-6">
          
          {/* SECTION 1: 🏷️ สินค้าแนะนำ (รีเฟรช 23:45:10) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-slate-800 text-sm sm:text-base">
                <span className="text-purple-600">🏷️</span>
                <span>สินค้าแนะนำ</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                <Clock className="w-3.5 h-3.5" />
                <span>รีเฟรช {padZero(timeLeft.hours)}:{padZero(timeLeft.minutes)}:{padZero(timeLeft.seconds)}</span>
              </div>
            </div>

            {/* 4 Recommended Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Item 1: XP Potion */}
              <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center hover:border-purple-300 hover:shadow-md transition group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-50 to-blue-100 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform mb-2">
                  🧪
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-800 leading-tight">
                    เพิ่ม XP 500 หน่วย
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    เร่งอัปเลเวลทันที
                  </p>
                </div>
                <button
                  onClick={() => handleBuyConsumable('item_xp_500', 'ขวดเพิ่ม XP 500 หน่วย', 100, (prev) => {
                    onShowToast('⚡ ได้รับ EXP!', '+500 EXP สำเร็จ', 'exp');
                    return { exp: (prev.exp || 0) + 500 };
                  })}
                  className="mt-3 w-full py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-black text-xs border border-amber-200 flex items-center justify-center gap-1 active:scale-95 transition"
                >
                  <span className="text-xs">฿</span>
                  <span>100</span>
                </button>
              </div>

              {/* Item 2: Backpack Slots */}
              <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center hover:border-purple-300 hover:shadow-md transition group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-50 to-sky-100 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform mb-2">
                  🎒
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-800 leading-tight">
                    ช่องกระเป๋าเพิ่ม 5 ช่อง
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    เก็บไอเทมได้มากขึ้น
                  </p>
                </div>
                <button
                  onClick={() => handleBuyConsumable('item_bag_expand', 'ช่องกระเป๋าเพิ่ม 5 ช่อง', 150, () => {
                    onShowToast('🎒 ขยายกระเป๋าสำเร็จ!', 'เพิ่มช่องเก็บของ 5 ช่องเรียบร้อยแล้ว');
                    return {};
                  })}
                  className="mt-3 w-full py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-black text-xs border border-amber-200 flex items-center justify-center gap-1 active:scale-95 transition"
                >
                  <span className="text-xs">฿</span>
                  <span>150</span>
                </button>
              </div>

              {/* Item 3: Lucky Star */}
              <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center hover:border-purple-300 hover:shadow-md transition group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-50 to-yellow-100 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform mb-2">
                  ⭐
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-800 leading-tight">
                    ดาวนำโชค
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    ได้รับดาวเพิ่ม 1 ดาว
                  </p>
                </div>
                <button
                  onClick={() => handleBuyConsumable('item_star_lucky', 'ดาวนำโชค', 80, (prev) => {
                    onShowToast('⭐ ได้รับดาวนำโชค!', '+1 ดาวสะสม', 'badge');
                    return { stars: (prev.stars || 0) + 1 };
                  })}
                  className="mt-3 w-full py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-black text-xs border border-amber-200 flex items-center justify-center gap-1 active:scale-95 transition"
                >
                  <span className="text-xs">฿</span>
                  <span>80</span>
                </button>
              </div>

              {/* Item 4: 10 Gems Pack */}
              <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center hover:border-purple-300 hover:shadow-md transition group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-50 to-fuchsia-100 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform mb-2">
                  💎
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-800 leading-tight">
                    เพชร 10 เม็ด
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    ใช้ซื้อไอเทมพิเศษ
                  </p>
                </div>
                <button
                  onClick={() => handleBuyConsumable('item_gems_pack', 'เพชร 10 เม็ด', 200, (prev) => {
                    onShowToast('💎 ซื้อเพชรสำเร็จ!', 'ได้รับ +10 เพชร');
                    return { gems: (prev.gems || 0) + 10 };
                  })}
                  className="mt-3 w-full py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-black text-xs border border-purple-200 flex items-center justify-center gap-1 active:scale-95 transition"
                >
                  <Gem className="w-3 h-3 text-purple-600" />
                  <span>฿ 200</span>
                </button>
              </div>

            </div>
          </div>

          {/* SECTION 2: 🎁 กล่องสมบัติ (3 Mystery Chests matching image) */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-black text-slate-800 text-sm sm:text-base">
              <span className="text-purple-600">🎁</span>
              <span>กล่องสมบัติ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Chest 1: กล่องธรรมดา */}
              <div className="bg-gradient-to-b from-amber-50/50 to-orange-50/30 rounded-2xl p-4 border border-amber-200/80 shadow-sm flex flex-col items-center text-center hover:border-amber-400 hover:shadow-md transition group">
                <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform mb-2">
                  📦
                </div>
                <h4 className="font-black text-sm text-slate-800">กล่องธรรมดา</h4>
                <p className="text-xs text-slate-500 mt-0.5">รับไอเทมทั่วไป</p>
                <button
                  disabled={chestOpening !== null}
                  onClick={() => handleOpenChest('common', 50, 'coins')}
                  className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-sm hover:scale-105 active:scale-95 transition flex items-center justify-center gap-1"
                >
                  <span>฿</span>
                  <span>50</span>
                </button>
              </div>

              {/* Chest 2: กล่องพิเศษ */}
              <div className="bg-gradient-to-b from-sky-50/50 to-blue-50/30 rounded-2xl p-4 border border-blue-200/80 shadow-sm flex flex-col items-center text-center hover:border-blue-400 hover:shadow-md transition group">
                <div className="w-20 h-20 rounded-2xl bg-sky-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform mb-2">
                  🧰
                </div>
                <h4 className="font-black text-sm text-slate-800">กล่องพิเศษ</h4>
                <p className="text-xs text-slate-500 mt-0.5">รับไอเทมพิเศษ</p>
                <button
                  disabled={chestOpening !== null}
                  onClick={() => handleOpenChest('rare', 120, 'coins')}
                  className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-xs shadow-sm hover:scale-105 active:scale-95 transition flex items-center justify-center gap-1"
                >
                  <span>฿</span>
                  <span>120</span>
                </button>
              </div>

              {/* Chest 3: กล่องในตำนาน */}
              <div className="bg-gradient-to-b from-rose-50/50 to-purple-50/30 rounded-2xl p-4 border border-rose-200/80 shadow-sm flex flex-col items-center text-center hover:border-rose-400 hover:shadow-md transition group">
                <div className="w-20 h-20 rounded-2xl bg-rose-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform mb-2">
                  👑
                </div>
                <h4 className="font-black text-sm text-slate-800">กล่องในตำนาน</h4>
                <p className="text-xs text-slate-500 mt-0.5">รับไอเทมหายาก</p>
                <button
                  disabled={chestOpening !== null}
                  onClick={() => handleOpenChest('legendary', 250, 'gems')}
                  className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs shadow-sm hover:scale-105 active:scale-95 transition flex items-center justify-center gap-1"
                >
                  <Gem className="w-3.5 h-3.5" />
                  <span>250</span>
                </button>
              </div>

            </div>
          </div>

          {/* SECTION 3: 🌟 ไอเทมตกแต่ง (ดูทั้งหมด >) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-slate-800 text-sm sm:text-base">
                <span className="text-amber-500">🌟</span>
                <span>ไอเทมตกแต่ง</span>
              </div>
              <button 
                onClick={() => onNavigateTab('reward_shop')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
              >
                <span>ดูทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4 Wearable Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Item 1: หมวกนักสำรวจ */}
              <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center hover:border-amber-300 hover:shadow-md transition group">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform mb-2">
                  🤠
                </div>
                <h4 className="font-black text-xs text-slate-800 leading-tight">
                  หมวกนักสำรวจ
                </h4>
                {inventory.includes('hat_explorer') ? (
                  <div className="mt-3 w-full py-1.5 rounded-xl bg-emerald-50 text-emerald-600 font-black text-xs border border-emerald-200 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>เป็นเจ้าของแล้ว</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuyItem('hat_explorer', 'หมวกนักสำรวจ', 80, 'wearable')}
                    className="mt-3 w-full py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-black text-xs border border-amber-200 flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <span>฿</span>
                    <span>80</span>
                  </button>
                )}
              </div>

              {/* Item 2: แว่นนักคิด */}
              <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center hover:border-amber-300 hover:shadow-md transition group">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform mb-2">
                  👓
                </div>
                <h4 className="font-black text-xs text-slate-800 leading-tight">
                  แว่นนักคิด
                </h4>
                {inventory.includes('glasses_thinker') ? (
                  <div className="mt-3 w-full py-1.5 rounded-xl bg-emerald-50 text-emerald-600 font-black text-xs border border-emerald-200 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>เป็นเจ้าของแล้ว</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuyItem('glasses_thinker', 'แว่นนักคิด', 70, 'wearable')}
                    className="mt-3 w-full py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-black text-xs border border-amber-200 flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <span>฿</span>
                    <span>70</span>
                  </button>
                )}
              </div>

              {/* Item 3: ปีกแห่งความรู้ */}
              <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center hover:border-amber-300 hover:shadow-md transition group">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform mb-2">
                  🪽
                </div>
                <h4 className="font-black text-xs text-slate-800 leading-tight">
                  ปีกแห่งความรู้
                </h4>
                {inventory.includes('wings_knowledge') ? (
                  <div className="mt-3 w-full py-1.5 rounded-xl bg-emerald-50 text-emerald-600 font-black text-xs border border-emerald-200 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>เป็นเจ้าของแล้ว</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuyItem('wings_knowledge', 'ปีกแห่งความรู้', 120, 'wearable')}
                    className="mt-3 w-full py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-black text-xs border border-amber-200 flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <span>฿</span>
                    <span>120</span>
                  </button>
                )}
              </div>

              {/* Item 4: เพ็ตหุ่นยนต์ */}
              <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-between text-center hover:border-amber-300 hover:shadow-md transition group">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform mb-2">
                  🤖
                </div>
                <h4 className="font-black text-xs text-slate-800 leading-tight">
                  เพ็ตหุ่นยนต์
                </h4>
                {inventory.includes('pet_robot') ? (
                  <div className="mt-3 w-full py-1.5 rounded-xl bg-emerald-50 text-emerald-600 font-black text-xs border border-emerald-200 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>เป็นเจ้าของแล้ว</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuyItem('pet_robot', 'เพ็ตหุ่นยนต์', 150, 'wearable')}
                    className="mt-3 w-full py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-black text-xs border border-amber-200 flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <span>฿</span>
                    <span>150</span>
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* REWARD MODAL WHEN OPENING CHEST */}
      {chestRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-4 border-amber-300 text-center space-y-4">
            <button
              onClick={() => setChestRewardModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-4xl shadow-xl shadow-amber-400/40 animate-bounce">
              🎁
            </div>

            <div>
              <h3 className="font-black text-xl text-slate-800">
                เปิด {chestRewardModal.name} สำเร็จ!
              </h3>
              <p className="text-xs text-slate-500 mt-1">ยินดีด้วย! คุณได้รับของรางวัลต่อไปนี้:</p>
            </div>

            <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200 space-y-2 text-xs font-bold text-slate-700 text-left">
              {chestRewardModal.rewardCoins > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>🪙 เหรียญรางวัล:</span>
                  </span>
                  <span className="font-black text-amber-600">+{chestRewardModal.rewardCoins} ฿</span>
                </div>
              )}
              {chestRewardModal.rewardStars > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>⭐ ดาวเกียรติยศ:</span>
                  </span>
                  <span className="font-black text-amber-500">+{chestRewardModal.rewardStars} ดาว</span>
                </div>
              )}
              {chestRewardModal.rewardGems > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>💎 เพชรวิเศษ:</span>
                  </span>
                  <span className="font-black text-purple-600">+{chestRewardModal.rewardGems} เพชร</span>
                </div>
              )}
              {chestRewardModal.items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-indigo-700">
                  <span>✨ {it}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                playClickSound();
                setChestRewardModal(null);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-md shadow-amber-400/40 hover:scale-105 active:scale-95 transition"
            >
              รับรางวัลทั้งหมด
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
