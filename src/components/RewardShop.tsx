import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Home, 
  Sparkles, 
  Coins, 
  Check, 
  Lock, 
  Filter, 
  ChevronRight, 
  RotateCcw, 
  Award, 
  ShieldCheck, 
  Gift, 
  Eye, 
  Compass, 
  Zap,
  Info,
  CheckCircle2
} from 'lucide-react';
import { DetectiveProfile, ShopItem, ShopCategory, ItemRarity, TabType } from '../types';
import { SHOP_ITEMS, SHOP_CATEGORIES } from '../data/shopItems';
import { 
  playClickSound, 
  playBuySound, 
  playEquipSound, 
  playCoinSound, 
  playCorrectSound, 
  playWrongSound 
} from '../utils/sound';
import { JourneyNextStepCard } from './JourneyNextStepCard';

interface RewardShopProps {
  profile: DetectiveProfile;
  onUpdateProfile: (updated: Partial<DetectiveProfile> | ((prev: DetectiveProfile) => DetectiveProfile)) => void;
  onShowToast: (title: string, message: string, type?: 'exp' | 'badge' | 'clue' | 'case') => void;
  onSelectTab?: (tab: TabType) => void;
}

export const RewardShop: React.FC<RewardShopProps> = ({
  profile,
  onUpdateProfile,
  onShowToast,
  onSelectTab,
}) => {
  const [viewMode, setViewMode] = useState<'shop' | 'room' | 'avatar'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterOwnership, setFilterOwnership] = useState<'all' | 'unowned' | 'owned'>('all');
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);
  
  // Daily bonus modal state
  const [showDailyBonusModal, setShowDailyBonusModal] = useState<boolean>(false);
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState<boolean>(false);
  const [bonusQuizAnswer, setBonusQuizAnswer] = useState<number | null>(null);
  const [bonusQuizSubmitted, setBonusQuizSubmitted] = useState<boolean>(false);

  // Purchase confirmation modal
  const [itemToBuy, setItemToBuy] = useState<ShopItem | null>(null);

  const inventory = profile.inventory || [];
  const equippedAvatar = profile.equippedAvatar || {};
  const equippedRoom = profile.equippedRoom || {};
  const coins = profile.coins || 0;

  // Filter items
  const filteredItems = SHOP_ITEMS.filter((item) => {
    // Category filter
    if (selectedCategory === 'avatar_all' && item.group !== 'avatar') return false;
    if (selectedCategory === 'room_all' && item.group !== 'room') return false;
    if (selectedCategory !== 'all' && selectedCategory !== 'avatar_all' && selectedCategory !== 'room_all') {
      if (item.category !== selectedCategory) return false;
    }
    // Rarity filter
    if (filterRarity !== 'all' && item.rarity !== filterRarity) return false;
    // Ownership filter
    const isOwned = inventory.includes(item.id);
    if (filterOwnership === 'owned' && !isOwned) return false;
    if (filterOwnership === 'unowned' && isOwned) return false;

    return true;
  });

  // Handle Buy Item
  const handleConfirmPurchase = () => {
    if (!itemToBuy) return;
    if (coins < itemToBuy.price) {
      playWrongSound();
      onShowToast('เหรียญไม่พอ!', `คุณต้องการอีก ${itemToBuy.price - coins} เหรียญ ทำภารกิจคดีหรือทำแบบทดสอบเพื่อสะสมเหรียญเพิ่ม`, 'clue');
      setItemToBuy(null);
      return;
    }

    playBuySound();
    
    onUpdateProfile(prev => {
      const currentCoins = prev.coins ?? 0;
      const currentInv = prev.inventory || [];
      const currentEquippedAvatar = { ...(prev.equippedAvatar || {}) };
      const currentEquippedRoom = { ...(prev.equippedRoom || {}) };

      if (itemToBuy.group === 'avatar') {
        if (itemToBuy.category === 'avatar_hat' && !currentEquippedAvatar.hat) currentEquippedAvatar.hat = itemToBuy.id;
        if (itemToBuy.category === 'avatar_outfit' && !currentEquippedAvatar.outfit) currentEquippedAvatar.outfit = itemToBuy.id;
        if (itemToBuy.category === 'avatar_pet' && !currentEquippedAvatar.pet) currentEquippedAvatar.pet = itemToBuy.id;
        if (itemToBuy.category === 'avatar_frame' && !currentEquippedAvatar.frame) currentEquippedAvatar.frame = itemToBuy.id;
      } else {
        if (itemToBuy.category === 'room_wallpaper' && !currentEquippedRoom.wallpaper) currentEquippedRoom.wallpaper = itemToBuy.id;
        if (itemToBuy.category === 'room_bed' && !currentEquippedRoom.bed) currentEquippedRoom.bed = itemToBuy.id;
        if (itemToBuy.category === 'room_desk' && !currentEquippedRoom.desk) currentEquippedRoom.desk = itemToBuy.id;
        if (itemToBuy.category === 'room_decor' && !currentEquippedRoom.decor) currentEquippedRoom.decor = itemToBuy.id;
      }

      return {
        ...prev,
        coins: Math.max(0, currentCoins - itemToBuy.price),
        inventory: Array.from(new Set([...currentInv, itemToBuy.id])),
        equippedAvatar: currentEquippedAvatar,
        equippedRoom: currentEquippedRoom,
      };
    });

    onShowToast('แลกซื้อสำเร็จ! 🎉', `ได้รับ "${itemToBuy.name}" เพิ่มในคลังไอเทมแล้ว`, 'badge');
    setItemToBuy(null);
  };

  // Handle Equip / Unequip
  const handleToggleEquip = (item: ShopItem) => {
    playEquipSound();
    if (item.group === 'avatar') {
      const newEquipped = { ...equippedAvatar };
      if (item.category === 'avatar_hat') {
        newEquipped.hat = newEquipped.hat === item.id ? undefined : item.id;
      } else if (item.category === 'avatar_outfit') {
        newEquipped.outfit = newEquipped.outfit === item.id ? undefined : item.id;
      } else if (item.category === 'avatar_pet') {
        newEquipped.pet = newEquipped.pet === item.id ? undefined : item.id;
      } else if (item.category === 'avatar_frame') {
        newEquipped.frame = newEquipped.frame === item.id ? undefined : item.id;
      }
      onUpdateProfile({ equippedAvatar: newEquipped });
      onShowToast('ปรับแต่งอวาตาร์', `ปรับเปลี่ยนไอเทม ${item.name} เรียบร้อยแล้ว`, 'clue');
    } else {
      const newEquipped = { ...equippedRoom };
      if (item.category === 'room_wallpaper') {
        newEquipped.wallpaper = item.id;
      } else if (item.category === 'room_bed') {
        newEquipped.bed = newEquipped.bed === item.id ? undefined : item.id;
      } else if (item.category === 'room_desk') {
        newEquipped.desk = newEquipped.desk === item.id ? undefined : item.id;
      } else if (item.category === 'room_decor') {
        newEquipped.decor = newEquipped.decor === item.id ? undefined : item.id;
      }
      onUpdateProfile({ equippedRoom: newEquipped });
      onShowToast('ตกแต่งห้องนอน', `ปรับเปลี่ยนของตกแต่ง ${item.name} เรียบร้อยแล้ว`, 'clue');
    }
  };

  // Helper to check if item is equipped
  const isItemEquipped = (item: ShopItem) => {
    if (item.group === 'avatar') {
      return (
        equippedAvatar.hat === item.id ||
        equippedAvatar.outfit === item.id ||
        equippedAvatar.pet === item.id ||
        equippedAvatar.frame === item.id
      );
    } else {
      return (
        equippedRoom.wallpaper === item.id ||
        equippedRoom.bed === item.id ||
        equippedRoom.desk === item.id ||
        equippedRoom.decor === item.id
      );
    }
  };

  // Helper to get active equipped item data
  const activeHat = SHOP_ITEMS.find((i) => i.id === equippedAvatar.hat);
  const activeOutfit = SHOP_ITEMS.find((i) => i.id === equippedAvatar.outfit);
  const activePet = SHOP_ITEMS.find((i) => i.id === equippedAvatar.pet);
  const activeFrame = SHOP_ITEMS.find((i) => i.id === equippedAvatar.frame);

  const activeWallpaper = SHOP_ITEMS.find((i) => i.id === equippedRoom.wallpaper) || SHOP_ITEMS.find(i => i.id === 'room_wall_modern_minimal');
  const activeBed = SHOP_ITEMS.find((i) => i.id === equippedRoom.bed);
  const activeDesk = SHOP_ITEMS.find((i) => i.id === equippedRoom.desk);
  const activeDecor = SHOP_ITEMS.find((i) => i.id === equippedRoom.decor);

  // Rarity color helpers
  const getRarityBadge = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'legendary':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]">ตำนาน (Legendary)</span>;
      case 'epic':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]">มหากาพย์ (Epic)</span>;
      case 'rare':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">หายาก (Rare)</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/60 text-slate-300 border border-slate-600">ทั่วไป (Common)</span>;
    }
  };

  const getRarityBorder = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'legendary':
        return 'border-amber-500/50 hover:border-amber-400 shadow-lg shadow-amber-950/20 hover:shadow-amber-500/20';
      case 'epic':
        return 'border-purple-500/50 hover:border-purple-400 shadow-lg shadow-purple-950/20 hover:shadow-purple-500/20';
      case 'rare':
        return 'border-cyan-500/40 hover:border-cyan-300 shadow-lg shadow-cyan-950/20 hover:shadow-cyan-500/20';
      default:
        return 'border-slate-800 hover:border-slate-600';
    }
  };

  // Daily bonus riddle
  const dailyRiddle = {
    question: 'หากนักสืบต้องการค้นหาไฟล์สรุปประเภทเอกสาร PowerPoint เกี่ยวกับ "พลังงานทดแทน" ควรพิมพ์คำค้นอย่างไร?',
    options: [
      'พลังงานทดแทน filetype:pptx',
      'พลังงานทดแทน -pptx',
      '"พลังงานทดแทน" site:youtube.com',
      'ต้องการดูสไลด์เรื่องพลังงานทดแทนจ้า',
    ],
    correctIndex: 0,
    explanation: 'การใช้คำค้นระบุ filetype:pptx เป็นการเจาะจงค้นหาเฉพาะไฟล์สไลด์นำเสนอ Microsoft PowerPoint โดยตรง',
  };

  const handleBonusAnswer = (index: number) => {
    if (bonusQuizSubmitted) return;
    setBonusQuizAnswer(index);
  };

  const handleSubmitBonusQuiz = () => {
    if (bonusQuizAnswer === null || bonusQuizSubmitted) return;
    setBonusQuizSubmitted(true);
    if (bonusQuizAnswer === dailyRiddle.correctIndex) {
      playCorrectSound();
      playCoinSound();
      const bonusAmount = 60;
      onUpdateProfile({ coins: coins + bonusAmount });
      onShowToast('ภารกิจรายวันสำเร็จ! 🪙+60 Coins', 'ตอบคำถามการสืบค้นถูกต้อง ได้รับเหรียญรางวัลพิเศษ', 'exp');
      setDailyBonusClaimed(true);
    } else {
      playWrongSound();
      onShowToast('เกือบถูกแล้ว!', dailyRiddle.explanation, 'clue');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn" id="reward-shop-container">
      {/* Top Banner & Control Deck */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 p-4 sm:p-6 shadow-xl shadow-indigo-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                Detective Reward Emporium
              </span>
              <span className="text-xs text-indigo-300 font-medium">ร้านแลกของรางวัล & ตกแต่งห้องนอน</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>ศูนย์แลกของรางวัลนักสืบ & สตูดิโอห้องพัก</span>
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              นำ <span className="text-amber-300 font-bold">เหรียญทอง (Detective Coins)</span> ที่ได้จากการพิชิตคดีปริศนา ทำคะแนนแบบทดสอบ และไขปริศนาสืบค้น มาแลกชุดเครื่องแบบ สัตว์เลี้ยงคู่หู และเฟอร์นิเจอร์ตกแต่งห้องนอนส่วนตัว!
            </p>
          </div>

          {/* Coins Balance & Bonus Button */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/10 border border-amber-500/40 flex items-center gap-3 shadow-lg shadow-amber-950/30">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-xl shadow-md shadow-amber-500/40 animate-bounce">
                🪙
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">เหรียญสะสมของคุณ</span>
                <div className="text-xl sm:text-2xl font-black text-amber-300 leading-tight">
                  {coins.toLocaleString()} <span className="text-xs font-bold text-amber-400/80">Coins</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                setShowDailyBonusModal(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 hover:border-indigo-400 flex items-center gap-2 text-xs font-bold transition-all shadow-md active:scale-95"
              id="btn-daily-coin-bonus"
            >
              <Gift className="w-4 h-4 text-pink-400 animate-pulse" />
              <span className="hidden sm:inline">รับเหรียญฟรี</span>
              <span className="sm:hidden">+Coins</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher (Shop / Room / Avatar) */}
        <div className="mt-5 pt-4 border-t border-indigo-500/20 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              playClickSound();
              setViewMode('shop');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              viewMode === 'shop'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
            id="tab-view-shop"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>ร้านค้าของรางวัล ({SHOP_ITEMS.length} ไอเทม)</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setViewMode('room');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              viewMode === 'room'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
            id="tab-view-room"
          >
            <Home className="w-4 h-4 text-cyan-300" />
            <span>ห้องนอน & ที่พักนักสืบของฉัน</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setViewMode('avatar');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              viewMode === 'avatar'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
            id="tab-view-avatar"
          >
            <Sparkles className="w-4 h-4 text-pink-300" />
            <span>ห้องแต่งตัวอวาตาร์ (Dressing Room)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: MY DETECTIVE ROOM (INTERACTIVE ROOM CANVAS & DECORATOR) */}
      {/* ========================================================================= */}
      {viewMode === 'room' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 2D Isometric / Modern Interactive Room Canvas */}
            <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              {/* Room Header */}
              <div className="flex items-center justify-between mb-4 z-10">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Home className="w-4 h-4 text-cyan-400" />
                    ห้องนอน & ที่พักสารวัตร: {profile.name}
                  </h3>
                </div>
                <div className="text-xs text-slate-400 bg-slate-950/80 px-3 py-1 rounded-lg border border-slate-800">
                  สไตล์: <span className="text-cyan-300 font-bold">{activeWallpaper?.name || 'โมเดิร์น'}</span>
                </div>
              </div>

              {/* Interactive Visual Room Stage */}
              <div 
                className={`relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border-2 border-slate-700/60 shadow-inner bg-gradient-to-b ${
                  activeWallpaper?.visualDetails?.bgPattern || 'from-slate-950 via-slate-900 to-slate-950'
                } flex flex-col justify-between p-4 sm:p-6 transition-all duration-500`}
                id="detective-room-stage"
              >
                {/* Wall Background Ambient Effects */}
                {activeWallpaper?.id === 'room_wall_cyber_lab' && (
                  <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
                )}
                {activeWallpaper?.id === 'room_wall_space_observatory' && (
                  <div className="absolute inset-0 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>
                )}

                {/* Wall Decors / Posters / Clue Board */}
                <div className="relative z-10 flex items-start justify-between gap-4 w-full">
                  {/* Left Wall Object (Decor / Clue Board) */}
                  <div className="flex flex-col items-center">
                    {activeDecor ? (
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 shadow-lg backdrop-blur-sm flex flex-col items-center gap-1 animate-pulse">
                        <span className="text-3xl">{activeDecor.previewGraphic}</span>
                        <span className="text-[10px] font-bold text-slate-300 max-w-[90px] text-center truncate">{activeDecor.name}</span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl border border-dashed border-slate-700 text-slate-500 text-[11px] flex items-center gap-1">
                        <span>+ ตกแต่งผนัง</span>
                      </div>
                    )}
                  </div>

                  {/* Center Wall Clock / Inspector Sign */}
                  <div className="px-4 py-1.5 rounded-full bg-slate-950/70 border border-cyan-500/30 text-[11px] text-cyan-300 font-bold backdrop-blur-md flex items-center gap-2 shadow-md">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>ห้องสืบสวน ป.5 - ชั้นยศ: {profile.rankTitle}</span>
                  </div>

                  {/* Right Wall Shelf / Trophy */}
                  <div className="flex flex-col items-center">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/30 text-center shadow-lg">
                      <span className="text-2xl">🏆</span>
                      <span className="block text-[9px] font-bold text-amber-400">ตรา: {profile.badges?.filter(b => b.unlocked).length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Center Floor: Detective Avatar & Pet Standing in Room */}
                <div className="relative z-10 flex items-end justify-center gap-6 my-auto">
                  {/* Pet Companion */}
                  {activePet && (
                    <div className="flex flex-col items-center animate-bounce">
                      <div className="text-3xl p-2 rounded-2xl bg-slate-900/60 border border-cyan-500/30 backdrop-blur-sm shadow-md">
                        {activePet.icon}
                      </div>
                      <span className="text-[10px] font-bold text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800 mt-1">
                        {activePet.name.split(' ')[0]}
                      </span>
                    </div>
                  )}

                  {/* Detective Character Avatar */}
                  <div className="flex flex-col items-center group relative">
                    {/* Equipped Frame Aura */}
                    <div className={`relative p-4 rounded-3xl bg-slate-950/80 border-2 transition-all ${
                      activeFrame ? activeFrame.visualDetails?.glowEffect || 'border-cyan-400' : 'border-slate-700'
                    } flex flex-col items-center justify-center shadow-2xl`}>
                      {/* Equipped Hat */}
                      {activeHat && (
                        <span className="absolute -top-3 text-2xl animate-pulse">
                          {activeHat.previewGraphic}
                        </span>
                      )}
                      
                      {/* Base Avatar */}
                      <span className="text-5xl my-1">{profile.avatar || '🕵️‍♂️'}</span>

                      {/* Equipped Outfit Icon Badge */}
                      {activeOutfit && (
                        <span className="absolute -bottom-2 -right-2 text-lg p-1 rounded-full bg-indigo-950 border border-indigo-400 shadow-md">
                          {activeOutfit.previewGraphic}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-black text-white bg-slate-950/90 px-3 py-0.5 rounded-full border border-cyan-500/40 mt-2 shadow-md">
                      {profile.name}
                    </span>
                  </div>
                </div>

                {/* Bottom Furniture Row: Bed on Left, Desk on Right */}
                <div className="relative z-10 grid grid-cols-2 gap-4 items-end pt-2 border-t border-slate-800/60">
                  {/* Bed Element */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-700/80 backdrop-blur-md flex items-center gap-3">
                    <div className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-700">
                      {activeBed ? activeBed.previewGraphic : '🛏️'}
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] text-slate-400 block">เตียงนอน</span>
                      <span className="text-xs font-bold text-white truncate block">
                        {activeBed ? activeBed.name : 'เตียงนอนมาตรฐาน'}
                      </span>
                    </div>
                  </div>

                  {/* Desk Element */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-700/80 backdrop-blur-md flex items-center gap-3">
                    <div className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-700">
                      {activeDesk ? activeDesk.previewGraphic : '🖥️'}
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] text-slate-400 block">โต๊ะทำงานสืบสวน</span>
                      <span className="text-xs font-bold text-white truncate block">
                        {activeDesk ? activeDesk.name : 'โต๊ะคอมสืบสวน'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tip below canvas */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  กดเลือกเฟอร์นิเจอร์ด้านขวาเพื่อสลับสับเปลี่ยนห้องนอนตามต้องการ
                </span>
                <span className="text-amber-400 font-medium">บันทึกอัตโนมัติ 💾</span>
              </div>
            </div>

            {/* Right: Room Items Inventory & Quick Customizer */}
            <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Home className="w-4 h-4 text-cyan-400" />
                  คลังเฟอร์นิเจอร์ตกแต่งห้อง
                </h3>
                <span className="text-xs text-cyan-300 font-semibold">
                  มีแล้ว {SHOP_ITEMS.filter(i => i.group === 'room' && inventory.includes(i.id)).length} ชิ้น
                </span>
              </div>

              {/* Categories of Room Items owned */}
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {/* 1. Wallpapers */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>🧱</span> วอลเปเปอร์ผนัง
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {SHOP_ITEMS.filter(i => i.category === 'room_wallpaper').map(item => {
                      const isOwned = inventory.includes(item.id);
                      const isEquipped = equippedRoom.wallpaper === item.id;
                      return (
                        <button
                          key={item.id}
                          disabled={!isOwned}
                          onClick={() => handleToggleEquip(item)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            isEquipped
                              ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400'
                              : isOwned
                              ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                              : 'bg-slate-950/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{item.previewGraphic}</span>
                            {isEquipped && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                            {!isOwned && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                          </div>
                          <span className="text-[11px] font-bold text-white truncate mt-1">{item.name}</span>
                          <span className="text-[10px] text-slate-400">{isEquipped ? 'กำลังใช้งาน' : isOwned ? 'กดใช้งาน' : `${item.price} 🪙`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Beds */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>🛏️</span> เตียงนอน & ที่พักผ่อน
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {SHOP_ITEMS.filter(i => i.category === 'room_bed').map(item => {
                      const isOwned = inventory.includes(item.id);
                      const isEquipped = equippedRoom.bed === item.id;
                      return (
                        <button
                          key={item.id}
                          disabled={!isOwned}
                          onClick={() => handleToggleEquip(item)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            isEquipped
                              ? 'bg-indigo-950/60 border-indigo-400 ring-1 ring-indigo-400'
                              : isOwned
                              ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                              : 'bg-slate-950/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{item.previewGraphic}</span>
                            {isEquipped && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                            {!isOwned && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                          </div>
                          <span className="text-[11px] font-bold text-white truncate mt-1">{item.name}</span>
                          <span className="text-[10px] text-slate-400">{isEquipped ? 'กำลังใช้งาน' : isOwned ? 'กดใช้งาน' : `${item.price} 🪙`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Desks */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>🖥️</span> โต๊ะคอมสืบสวน
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {SHOP_ITEMS.filter(i => i.category === 'room_desk').map(item => {
                      const isOwned = inventory.includes(item.id);
                      const isEquipped = equippedRoom.desk === item.id;
                      return (
                        <button
                          key={item.id}
                          disabled={!isOwned}
                          onClick={() => handleToggleEquip(item)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            isEquipped
                              ? 'bg-blue-950/60 border-blue-400 ring-1 ring-blue-400'
                              : isOwned
                              ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                              : 'bg-slate-950/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{item.previewGraphic}</span>
                            {isEquipped && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                            {!isOwned && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                          </div>
                          <span className="text-[11px] font-bold text-white truncate mt-1">{item.name}</span>
                          <span className="text-[10px] text-slate-400">{isEquipped ? 'กำลังใช้งาน' : isOwned ? 'กดใช้งาน' : `${item.price} 🪙`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Decors */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>💡</span> พร็อพ & บอร์ดเบาะแส
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {SHOP_ITEMS.filter(i => i.category === 'room_decor').map(item => {
                      const isOwned = inventory.includes(item.id);
                      const isEquipped = equippedRoom.decor === item.id;
                      return (
                        <button
                          key={item.id}
                          disabled={!isOwned}
                          onClick={() => handleToggleEquip(item)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            isEquipped
                              ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400'
                              : isOwned
                              ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                              : 'bg-slate-950/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{item.previewGraphic}</span>
                            {isEquipped && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                            {!isOwned && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                          </div>
                          <span className="text-[11px] font-bold text-white truncate mt-1">{item.name}</span>
                          <span className="text-[10px] text-slate-400">{isEquipped ? 'กำลังใช้งาน' : isOwned ? 'กดใช้งาน' : `${item.price} 🪙`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: AVATAR DRESSING ROOM (INTERACTIVE AVATAR STUDIO) */}
      {/* ========================================================================= */}
      {viewMode === 'avatar' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Giant Holographic Detective Avatar Preview */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="w-full flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Avatar Hologram Preview
                </span>
                <span className="text-xs text-slate-400">เลเวล {profile.level}</span>
              </div>

              {/* Giant Avatar Display Stage */}
              <div className="my-6 relative flex flex-col items-center">
                {/* Aura Frame */}
                <div className={`relative p-8 rounded-full bg-slate-950/90 border-4 transition-all duration-300 ${
                  activeFrame ? activeFrame.visualDetails?.glowEffect || 'border-cyan-400 ring-4 ring-cyan-400/50' : 'border-slate-700'
                } flex flex-col items-center justify-center shadow-2xl w-44 h-44`}>
                  {/* Equipped Hat */}
                  {activeHat && (
                    <span className="absolute -top-6 text-4xl animate-bounce">
                      {activeHat.previewGraphic}
                    </span>
                  )}

                  {/* Main Avatar Character */}
                  <span className="text-6xl">{profile.avatar || '🕵️‍♂️'}</span>

                  {/* Equipped Suit/Coat badge */}
                  {activeOutfit && (
                    <span className="absolute -bottom-2 -right-1 text-2xl p-1.5 rounded-full bg-indigo-950 border border-indigo-400 shadow-md">
                      {activeOutfit.previewGraphic}
                    </span>
                  )}
                </div>

                {/* Equipped Pet flying / walking beside */}
                {activePet && (
                  <div className="mt-4 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/40 flex items-center gap-2 shadow-lg animate-pulse">
                    <span className="text-xl">{activePet.icon}</span>
                    <span className="text-xs font-bold text-cyan-300">คู่หู: {activePet.name}</span>
                  </div>
                )}

                <div className="mt-4 text-center">
                  <h3 className="text-lg font-black text-white">{profile.name}</h3>
                  <p className="text-xs text-amber-400 font-bold">{profile.rankTitle}</p>
                </div>
              </div>

              {/* Equipped Slots Summary */}
              <div className="w-full grid grid-cols-4 gap-2 pt-4 border-t border-slate-800 text-center">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">หมวก/แว่น</span>
                  <span className="text-xs font-bold text-white truncate block">{activeHat?.name || 'ไม่มี'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">ชุดสูท</span>
                  <span className="text-xs font-bold text-white truncate block">{activeOutfit?.name || 'ไม่มี'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">คู่หู</span>
                  <span className="text-xs font-bold text-white truncate block">{activePet?.name.split(' ')[0] || 'ไม่มี'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">ออร่ากรอบ</span>
                  <span className="text-xs font-bold text-white truncate block">{activeFrame?.name || 'ไม่มี'}</span>
                </div>
              </div>
            </div>

            {/* Right: Avatar Wardrobe / Customizer */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  ตู้เสื้อผ้า & อุปกรณ์นักสืบ
                </h3>
                <span className="text-xs text-pink-300 font-semibold">
                  มีแล้ว {SHOP_ITEMS.filter(i => i.group === 'avatar' && inventory.includes(i.id)).length} ชิ้น
                </span>
              </div>

              {/* Wardrobe Grid */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {/* 1. Hats */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>🎩</span> หมวก & แว่นสายลับ
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SHOP_ITEMS.filter(i => i.category === 'avatar_hat').map(item => {
                      const isOwned = inventory.includes(item.id);
                      const isEquipped = equippedAvatar.hat === item.id;
                      return (
                        <button
                          key={item.id}
                          disabled={!isOwned}
                          onClick={() => handleToggleEquip(item)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            isEquipped
                              ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400'
                              : isOwned
                              ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                              : 'bg-slate-950/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{item.previewGraphic}</span>
                            {isEquipped && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                            {!isOwned && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                          </div>
                          <span className="text-[11px] font-bold text-white truncate mt-1">{item.name}</span>
                          <span className="text-[10px] text-slate-400">{isEquipped ? 'กำลังใช้งาน' : isOwned ? 'กดใส่' : `${item.price} 🪙`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Outfits */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>👔</span> ชุดเครื่องแบบ & สูท
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SHOP_ITEMS.filter(i => i.category === 'avatar_outfit').map(item => {
                      const isOwned = inventory.includes(item.id);
                      const isEquipped = equippedAvatar.outfit === item.id;
                      return (
                        <button
                          key={item.id}
                          disabled={!isOwned}
                          onClick={() => handleToggleEquip(item)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            isEquipped
                              ? 'bg-indigo-950/60 border-indigo-400 ring-1 ring-indigo-400'
                              : isOwned
                              ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                              : 'bg-slate-950/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{item.previewGraphic}</span>
                            {isEquipped && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                            {!isOwned && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                          </div>
                          <span className="text-[11px] font-bold text-white truncate mt-1">{item.name}</span>
                          <span className="text-[10px] text-slate-400">{isEquipped ? 'กำลังใช้งาน' : isOwned ? 'กดใส่' : `${item.price} 🪙`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Pets */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>🐾</span> สัตว์เลี้ยง & โดรนคู่หู
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SHOP_ITEMS.filter(i => i.category === 'avatar_pet').map(item => {
                      const isOwned = inventory.includes(item.id);
                      const isEquipped = equippedAvatar.pet === item.id;
                      return (
                        <button
                          key={item.id}
                          disabled={!isOwned}
                          onClick={() => handleToggleEquip(item)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            isEquipped
                              ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400'
                              : isOwned
                              ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                              : 'bg-slate-950/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{item.icon}</span>
                            {isEquipped && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                            {!isOwned && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                          </div>
                          <span className="text-[11px] font-bold text-white truncate mt-1">{item.name}</span>
                          <span className="text-[10px] text-slate-400">{isEquipped ? 'กำลังพกพา' : isOwned ? 'พกพา' : `${item.price} 🪙`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Frames */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>✨</span> กรอบรูป & ออร่าแสง
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SHOP_ITEMS.filter(i => i.category === 'avatar_frame').map(item => {
                      const isOwned = inventory.includes(item.id);
                      const isEquipped = equippedAvatar.frame === item.id;
                      return (
                        <button
                          key={item.id}
                          disabled={!isOwned}
                          onClick={() => handleToggleEquip(item)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            isEquipped
                              ? 'bg-pink-950/60 border-pink-400 ring-1 ring-pink-400'
                              : isOwned
                              ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                              : 'bg-slate-950/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{item.previewGraphic}</span>
                            {isEquipped && <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />}
                            {!isOwned && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                          </div>
                          <span className="text-[11px] font-bold text-white truncate mt-1">{item.name}</span>
                          <span className="text-[10px] text-slate-400">{isEquipped ? 'กำลังส่องแสง' : isOwned ? 'เปิดแสง' : `${item.price} 🪙`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: REWARD SHOP CATALOG (BROWSE & BUY ITEMS) */}
      {/* ========================================================================= */}
      {viewMode === 'shop' && (
        <div className="space-y-6">
          {/* Filters & Search Control Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            {/* Category Pills Slider */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {SHOP_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      playClickSound();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Secondary Filters (Rarity & Ownership) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">สถานะ:</span>
                <div className="flex items-center gap-1">
                  {(['all', 'unowned', 'owned'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFilterOwnership(mode)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        filterOwnership === mode
                          ? 'bg-slate-700 text-white font-bold'
                          : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode === 'all' ? 'ทั้งหมด' : mode === 'unowned' ? 'ยังไม่มี' : 'มีแล้ว'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">ความหายาก:</span>
                <select
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">ทุกระดับความหายาก</option>
                  <option value="common">ทั่วไป (Common)</option>
                  <option value="rare">หายาก (Rare)</option>
                  <option value="epic">มหากาพย์ (Epic)</option>
                  <option value="legendary">ตำนาน (Legendary)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const isOwned = inventory.includes(item.id);
              const isEquipped = isItemEquipped(item);
              const canAfford = coins >= item.price;

              return (
                <div
                  key={item.id}
                  className={`relative rounded-2xl bg-slate-900/90 border p-4 flex flex-col justify-between transition-all duration-200 group ${getRarityBorder(
                    item.rarity
                  )}`}
                  id={`shop-item-${item.id}`}
                >
                  {/* Top Status & Rarity */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      {getRarityBadge(item.rarity)}
                      {isEquipped ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <Check className="w-3 h-3" /> กำลังใช้งาน
                        </span>
                      ) : isOwned ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          เป็นเจ้าของแล้ว
                        </span>
                      ) : null}
                    </div>

                    {/* Graphic Box */}
                    <div className="h-28 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 group-hover:border-slate-700 transition-all">
                      <span className="text-5xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                        {item.icon || item.previewGraphic}
                      </span>
                      {item.visualDetails?.badgeText && (
                        <span className="absolute bottom-1.5 text-[9px] font-bold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-800">
                          {item.visualDetails.badgeText}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="mt-3">
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action & Price */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    {isOwned ? (
                      <button
                        onClick={() => handleToggleEquip(item)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                          isEquipped
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 hover:brightness-110'
                        }`}
                      >
                        {isEquipped ? 'ถอดออก (Unequip)' : 'สวมใส่ / ใช้งาน'}
                      </button>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 text-amber-300 font-black text-sm">
                          <span>🪙</span>
                          <span>{item.price}</span>
                        </div>

                        <button
                          onClick={() => {
                            playClickSound();
                            setItemToBuy(item);
                          }}
                          className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:brightness-110'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{canAfford ? 'แลกซื้อ' : 'เหรียญไม่พอ'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800">
              <span className="text-4xl block mb-2">🔍</span>
              <h4 className="text-sm font-bold text-white">ไม่พบไอเทมในหมวดหมู่นี้</h4>
              <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนตัวกรองความหายากหรือหมวดหมู่ดูนะ</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PURCHASE CONFIRMATION */}
      {/* ========================================================================= */}
      {itemToBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-3xl shadow-lg">
              {itemToBuy.icon || itemToBuy.previewGraphic}
            </div>

            <div>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">ยืนยันการแลกซื้อไอเทม</span>
              <h3 className="text-lg font-black text-white mt-1">{itemToBuy.name}</h3>
              <p className="text-xs text-slate-300 mt-1">{itemToBuy.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">ราคา:</span>
              <span className="text-amber-400 text-sm">🪙 {itemToBuy.price} Coins</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>เหรียญคงเหลือหลังซื้อ:</span>
              <span className={coins >= itemToBuy.price ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                🪙 {coins - itemToBuy.price} Coins
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  playClickSound();
                  setItemToBuy(null);
                }}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/30 hover:brightness-110 transition-all"
              >
                ยืนยันการแลกซื้อ 🪙
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DAILY COINS BONUS QUIZ */}
      {/* ========================================================================= */}
      {showDailyBonusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-400" />
                <h3 className="text-base font-black text-white">ภารกิจลับรายวัน: รับเหรียญฟรี!</h3>
              </div>
              <button
                onClick={() => setShowDailyBonusModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ ปิด
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ตอบคำถามเทคนิคการสืบค้นข้อมูล 1 ข้อให้ถูกต้อง เพื่อรับรางวัลพิเศษ <span className="text-amber-300 font-bold">+60 เหรียญทอง</span> ทันที!
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-cyan-300 leading-snug">
              ❓ {dailyRiddle.question}
            </div>

            <div className="space-y-2">
              {dailyRiddle.options.map((opt, idx) => {
                const isSelected = bonusQuizAnswer === idx;
                const isCorrect = idx === dailyRiddle.correctIndex;

                let btnStyle = 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700';
                if (bonusQuizSubmitted) {
                  if (isCorrect) btnStyle = 'bg-emerald-950/80 text-emerald-300 border-emerald-400 ring-1 ring-emerald-400';
                  else if (isSelected) btnStyle = 'bg-rose-950/80 text-rose-300 border-rose-400';
                } else if (isSelected) {
                  btnStyle = 'bg-indigo-950/90 text-indigo-300 border-indigo-400 ring-1 ring-indigo-400';
                }

                return (
                  <button
                    key={idx}
                    disabled={bonusQuizSubmitted}
                    onClick={() => handleBonusAnswer(idx)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {bonusQuizSubmitted ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-amber-400 block">💡 คำอธิบายเฉลย:</span>
                <span className="text-slate-300 leading-relaxed">{dailyRiddle.explanation}</span>
              </div>
            ) : null}

            <div className="pt-2">
              {!bonusQuizSubmitted ? (
                <button
                  disabled={bonusQuizAnswer === null}
                  onClick={handleSubmitBonusQuiz}
                  className={`w-full py-3 rounded-xl text-xs font-black shadow-lg transition-all ${
                    bonusQuizAnswer !== null
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-amber-500/30 hover:brightness-110'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  ส่งคำตอบ & รับเหรียญรางวัล 🪙
                </button>
              ) : (
                <button
                  onClick={() => setShowDailyBonusModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
                >
                  เสร็จสิ้น (กลับสู่ร้านค้า)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step Journey Next Step Card */}
      {onSelectTab && (
        <JourneyNextStepCard
          currentStepNumber={7}
          currentStepTitle="ร้านแลกของรางวัล & สตูดิโอห้องนอน"
          nextTab="summary_cert"
          nextStepTitle="ด่าน 8: เกียรติบัตร & สรุปผลความสำเร็จ"
          nextStepDesc="เข้าสู่ห้องเกียรติยศเพื่อตรวจดูสรุปผลทักษะการเรียนรู้ และดาวน์โหลด/พิมพ์ใบประกาศนียบัตรยอดนักสืบดิจิทัลทางการ"
          rewardEarnedText="เกียรติบัตรทางการ สพฐ."
          onSelectTab={onSelectTab}
        />
      )}
    </div>
  );
};
