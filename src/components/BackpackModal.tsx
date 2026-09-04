import React, { useState } from 'react';
import { DetectiveProfile, TabType } from '../types';
import { 
  X, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Search, 
  Award,
  Crown,
  Clock,
  HelpCircle,
  Ticket,
  Star,
  Lock,
  CheckCircle2,
  Bot,
  BookOpen,
  Coins,
  Gem,
  Package,
  Boxes,
  Zap,
  UserCheck,
  Heart
} from 'lucide-react';
import { playClickSound, playCorrectSound, playChestOpenSound, playBadgeUnlockSound } from '../utils/sound';
import { SHOP_ITEMS } from '../data/shopItems';

interface BackpackModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DetectiveProfile;
  onSelectTab: (tab: TabType) => void;
  onUpdateProfile?: (updated: Partial<DetectiveProfile> | ((prev: DetectiveProfile) => DetectiveProfile)) => void;
}

export const BackpackModal: React.FC<BackpackModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSelectTab,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'pets' | 'skins' | 'notebook'>('items');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openingItemId, setOpeningItemId] = useState<string | null>(null);
  const [chestRewardModal, setChestRewardModal] = useState<{
    title: string;
    icon: string;
    rewards: { label: string; icon: string }[];
  } | null>(null);

  if (!isOpen) return null;

  const isItemEquipped = (itemId: string) => {
    const currentEquipped = profile.equippedAvatar || {};
    return (
      currentEquipped.hat === itemId ||
      currentEquipped.outfit === itemId ||
      currentEquipped.pet === itemId ||
      currentEquipped.frame === itemId
    );
  };

  const handleEquipItem = (itemId: string, name: string) => {
    if (!onUpdateProfile) {
      playCorrectSound();
      showToast(`สวมใส่ "${name}" เรียบร้อย!`);
      return;
    }

    let cat: 'hat' | 'outfit' | 'pet' | 'frame' = 'hat';
    if (itemId.startsWith('hat_') || itemId.startsWith('glasses_')) cat = 'hat';
    else if (itemId.startsWith('wings_') || itemId.startsWith('outfit_')) cat = 'outfit';
    else if (itemId.startsWith('pet_')) cat = 'pet';
    else if (itemId.startsWith('frame_') || itemId.startsWith('chest_')) cat = 'frame';
    else {
      const shop = SHOP_ITEMS.find(s => s.id === itemId);
      if (shop?.category === 'avatar_outfit') cat = 'outfit';
      else if (shop?.category === 'avatar_pet') cat = 'pet';
      else if (shop?.category === 'avatar_frame') cat = 'frame';
    }

    const currentEquipped = profile.equippedAvatar || {};
    const isEquipped = currentEquipped[cat] === itemId;
    const newEquipped = {
      ...currentEquipped,
      [cat]: isEquipped ? undefined : itemId
    };

    onUpdateProfile({ equippedAvatar: newEquipped });
    playCorrectSound();
    if (isEquipped) {
      showToast(`ถอด "${name}" ออกจากโปรไฟล์แล้ว`);
    } else {
      showToast(`🎉 สวมใส่ "${name}" ตกแต่งโปรไฟล์สำเร็จ!`);
    }
  };

  // Items counting & inventory matching
  const inventoryIds = profile.inventory || [];
  const badges = profile.badges || [];
  const unlockedBadges = badges.filter(b => b.unlocked);

  const totalEarnedStars = profile.stars ?? 0;
  const maxStars = 42;

  // Consumable counts from actual inventory
  const countMagnifier = inventoryIds.filter(id => id === 'item_magnifier' || id === 'magnifier_magic').length;
  const countHint = inventoryIds.filter(id => id === 'item_potion_hint' || id === 'item_hint').length;
  const countTime = inventoryIds.filter(id => id === 'item_time_extend' || id === 'item_clock').length;
  const countShield = inventoryIds.filter(id => id === 'item_shield' || id === 'shield_truth').length;

  // Custom shop item details lookup map
  const ITEM_DETAILS_MAP: Record<string, { name: string; icon: string; desc: string; type: 'item' | 'pet' | 'skin' }> = {
    item_xp_500: { name: 'ขวดเพิ่ม XP 500 หน่วย', icon: '🧪', desc: 'เพิ่ม EXP +500 ทันที', type: 'item' },
    item_bag_expand: { name: 'ช่องกระเป๋าเพิ่ม 5 ช่อง', icon: '🎒', desc: 'ขยายความจุกระเป๋าเก็บของ', type: 'item' },
    item_star_lucky: { name: 'ดาวนำโชค', icon: '⭐', desc: 'ดาวสะสมเพิ่ม +1 ดวง', type: 'item' },
    item_gems_pack: { name: 'เพชร 10 เม็ด', icon: '💎', desc: 'เพชรวิเศษสำหรับซื้อของ', type: 'item' },
    chest_common: { name: 'กล่องธรรมดา', icon: '📦', desc: 'กล่องรับไอเทมทั่วไป', type: 'item' },
    chest_rare: { name: 'กล่องพิเศษ', icon: '🧰', desc: 'กล่องรับไอเทมพิเศษ', type: 'item' },
    chest_legendary: { name: 'กล่องในตำนาน', icon: '👑', desc: 'กล่องรับไอเทมหายาก', type: 'item' },
    item_potion_hint: { name: 'น้ำยาเร่งพลังสืบค้น', icon: '🧪', desc: 'เพิ่มประสิทธิภาพในการค้นหา', type: 'item' },
    hat_explorer: { name: 'หมวกนักสำรวจ', icon: '🤠', desc: 'หมวกปีกกว้างสไตล์นักสำรวจ', type: 'skin' },
    glasses_thinker: { name: 'แว่นนักคิด', icon: '👓', desc: 'แว่นเพิ่มสมาธิในการสืบค้น', type: 'skin' },
    wings_knowledge: { name: 'ปีกแห่งความรู้', icon: '🪽', desc: 'ปีกออร่าแห่งปัญญาความรู้', type: 'skin' },
    pet_robot: { name: 'เพ็ตหุ่นยนต์', icon: '🤖', desc: 'หุ่นยนต์ผู้ช่วยสกัดคีย์เวิร์ด', type: 'pet' },
    hat_sherlock: { name: 'หมวกนักสืบเชอร์ล็อก', icon: '🕵️‍♂️', desc: 'หมวกระดับพรีเมียมสไตล์คลาสสิก', type: 'skin' },
    wings_dragon_gold: { name: 'ปีกมังกรแสงดาว', icon: '🐉', desc: 'ปีกมังกรในตำนานระดับ Legendary', type: 'skin' },
  };

  // Group inventory items by count
  const inventoryCounts = inventoryIds.reduce((acc: Record<string, number>, id: string) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});
  const uniqueInventoryIds = Object.keys(inventoryCounts);

  const showToast = (msg: string) => {
    playCorrectSound();
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const isChestItem = (id: string) => {
    return id.startsWith('chest_') || id.startsWith('box_') || id.startsWith('gift_') || id.includes('chest');
  };

  const isConsumableItem = (id: string) => {
    return isChestItem(id) || id.startsWith('item_');
  };

  const handleOpenChestItem = (itemId: string, itemName: string, itemIcon: string) => {
    if (!onUpdateProfile || openingItemId) return;

    playChestOpenSound();
    setOpeningItemId(itemId);

    setTimeout(() => {
      let rCoins = 0;
      let rGems = 0;
      let rExp = 0;
      let rStars = 0;
      let rKeys = 0;
      let bonusItemName: string | null = null;
      let bonusItemId: string | null = null;

      if (itemId === 'chest_common') {
        rCoins = Math.floor(Math.random() * 120) + 60;
        rExp = Math.floor(Math.random() * 200) + 100;
        rGems = Math.floor(Math.random() * 4) + 2;
        rStars = Math.floor(Math.random() * 3) + 2;
        rKeys = Math.random() < 0.35 ? 1 : 0;
      } else if (itemId === 'chest_rare') {
        rCoins = Math.floor(Math.random() * 300) + 200;
        rExp = Math.floor(Math.random() * 500) + 300;
        rGems = Math.floor(Math.random() * 12) + 8;
        rStars = Math.floor(Math.random() * 8) + 5;
        rKeys = Math.floor(Math.random() * 2) + 1;
        if (Math.random() < 0.45) {
          bonusItemId = 'hat_cyber_visor';
          bonusItemName = 'แว่นสแกนเนอร์นีออนไซเบอร์ (Rare)';
        }
      } else if (itemId === 'chest_legendary') {
        rCoins = Math.floor(Math.random() * 800) + 500;
        rExp = Math.floor(Math.random() * 1200) + 800;
        rGems = Math.floor(Math.random() * 35) + 25;
        rStars = Math.floor(Math.random() * 20) + 15;
        rKeys = Math.floor(Math.random() * 3) + 2;
        if (Math.random() < 0.7) {
          bonusItemId = 'wings_dragon_gold';
          bonusItemName = 'ปีกมังกรแสงดาวทองคำ (Legendary)';
        }
      } else if (itemId === 'item_xp_500') {
        rExp = 500;
        rCoins = 50;
      } else if (itemId === 'item_gems_pack') {
        rGems = 10;
        rExp = 100;
      } else if (itemId === 'item_star_lucky') {
        rStars = 3;
        rExp = 150;
      } else if (itemId === 'item_potion_hint') {
        rExp = 200;
        rCoins = 100;
      } else if (itemId === 'item_bag_expand') {
        rGems = 15;
        rExp = 250;
      } else {
        // Generic chest or mystery box
        rCoins = Math.floor(Math.random() * 200) + 100;
        rExp = Math.floor(Math.random() * 300) + 150;
        rGems = Math.floor(Math.random() * 8) + 4;
        rStars = Math.floor(Math.random() * 5) + 2;
        rKeys = 1;
      }

      // Deduct 1 item from inventory and add rewards
      onUpdateProfile(prev => {
        const currentInv = [...(prev.inventory || [])];
        const removeIndex = currentInv.indexOf(itemId);
        if (removeIndex !== -1) {
          currentInv.splice(removeIndex, 1);
        }
        if (bonusItemId && !currentInv.includes(bonusItemId)) {
          currentInv.push(bonusItemId);
        }
        return {
          ...prev,
          inventory: currentInv,
          coins: (prev.coins || 0) + rCoins,
          gems: (prev.gems || 0) + rGems,
          exp: (prev.exp || 0) + rExp,
          stars: (prev.stars || 0) + rStars,
          keys: (prev.keys || 0) + rKeys,
        };
      });

      setOpeningItemId(null);

      const rewardsList = [];
      if (rCoins > 0) rewardsList.push({ label: `+${rCoins} เหรียญทอง`, icon: '🪙' });
      if (rGems > 0) rewardsList.push({ label: `+${rGems} เพชรวิเศษ`, icon: '💎' });
      if (rExp > 0) rewardsList.push({ label: `+${rExp} EXP ค่าประสบการณ์`, icon: '⚡' });
      if (rStars > 0) rewardsList.push({ label: `+${rStars} ดาวสะสม`, icon: '⭐' });
      if (rKeys > 0) rewardsList.push({ label: `+${rKeys} กุญแจนักสืบ`, icon: '🗝️' });
      if (bonusItemName) rewardsList.push({ label: `ได้รับไอเทมพิเศษ: ${bonusItemName}`, icon: '🎁' });

      setChestRewardModal({
        title: `เปิด "${itemName}" เรียบร้อย!`,
        icon: itemIcon,
        rewards: rewardsList,
      });
      playBadgeUnlockSound();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-[28px] bg-gradient-to-b from-indigo-50/95 via-white to-purple-50/95 border-2 border-indigo-200/90 shadow-2xl text-slate-800 flex flex-col overflow-hidden">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-slate-900 text-amber-300 text-xs font-black shadow-lg border border-amber-400/50 flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-purple-100/90 via-indigo-100/80 to-purple-50/90 border-b border-indigo-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 text-white text-2xl shrink-0">
              🎒
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-indigo-950 flex items-center gap-2">
                กระเป๋าของฉัน
              </h2>
              <p className="text-xs font-bold text-indigo-700/80">
                จัดการไอเทม สัตว์เลี้ยง สกิน และสมุดสะสม
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => { playClickSound(); onClose(); }}
            className="w-9 h-9 rounded-full bg-indigo-100/80 hover:bg-indigo-200 text-indigo-700 hover:text-indigo-950 flex items-center justify-center transition-all shadow-sm active:scale-90"
            title="ปิดกระเป๋า"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Category Navigation Bar (แท็บหมวดหมู่) */}
        <div className="px-5 sm:px-6 pt-3 pb-2 bg-indigo-50/50 border-b border-indigo-100 shrink-0">
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-indigo-100/60 border border-indigo-200/50">
            <button
              onClick={() => { playClickSound(); setActiveTab('items'); }}
              className={`py-2 rounded-xl text-xs sm:text-sm font-black transition-all text-center ${
                activeTab === 'items'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md shadow-orange-400/20 scale-[1.02]'
                  : 'text-indigo-800 hover:bg-indigo-200/50'
              }`}
            >
              ไอเทม
            </button>
            <button
              onClick={() => { playClickSound(); setActiveTab('pets'); }}
              className={`py-2 rounded-xl text-xs sm:text-sm font-black transition-all text-center ${
                activeTab === 'pets'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md shadow-orange-400/20 scale-[1.02]'
                  : 'text-indigo-800 hover:bg-indigo-200/50'
              }`}
            >
              สัตว์เลี้ยง
            </button>
            <button
              onClick={() => { playClickSound(); setActiveTab('skins'); }}
              className={`py-2 rounded-xl text-xs sm:text-sm font-black transition-all text-center ${
                activeTab === 'skins'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md shadow-orange-400/20 scale-[1.02]'
                  : 'text-indigo-800 hover:bg-indigo-200/50'
              }`}
            >
              สกิน
            </button>
            <button
              onClick={() => { playClickSound(); setActiveTab('notebook'); }}
              className={`py-2 rounded-xl text-xs sm:text-sm font-black transition-all text-center ${
                activeTab === 'notebook'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md shadow-orange-400/20 scale-[1.02]'
                  : 'text-indigo-800 hover:bg-indigo-200/50'
              }`}
            >
              สมุดบันทึก
            </button>
          </div>
        </div>

        {/* Modal Main Scroll Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[65vh] custom-scrollbar">
          
          {/* TAB 1: ITEMS (ไอเทม) */}
          {activeTab === 'items' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Section 1: ไอเทมใช้งาน (Active Consumables) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
                  <h3 className="text-sm font-black text-indigo-950 uppercase tracking-wider">
                    ไอเทมใช้งาน
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Item 1: แว่นขยาย */}
                  <div 
                    onClick={() => {
                      if (countMagnifier > 0) {
                        showToast('ใช้ แว่นขยาย: ช่วยตัดตัวเลือกที่ไม่ถูกต้อง!');
                      } else {
                        showToast('คุณยังไม่มีแว่นขยายในกระเป๋า (x0) ซื้อได้ที่ร้านค้าของรางวัล');
                      }
                    }}
                    className={`p-3 rounded-2xl bg-white border shadow-xs hover:shadow-md transition-all cursor-pointer relative flex flex-col items-center text-center group active:scale-95 ${
                      countMagnifier > 0 ? 'border-indigo-100 hover:border-indigo-300' : 'border-slate-100 opacity-70'
                    }`}
                  >
                    <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full font-black text-[10px] ${
                      countMagnifier > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      x{countMagnifier}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center my-1 group-hover:scale-110 transition-transform">
                      <Search className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-black text-slate-800">แว่นขยาย</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">ช่วยค้นหาคำตอบ 1 ครั้ง</span>
                  </div>

                  {/* Item 2: คำใบ้พิเศษ */}
                  <div 
                    onClick={() => {
                      if (countHint > 0) {
                        showToast('ใช้ คำใบ้พิเศษ: แสดงแนวคำตอบเพิ่มเติม!');
                      } else {
                        showToast('คุณยังไม่มีคำใบ้พิเศษในกระเป๋า (x0) ซื้อได้ที่ร้านค้าของรางวัล');
                      }
                    }}
                    className={`p-3 rounded-2xl bg-white border shadow-xs hover:shadow-md transition-all cursor-pointer relative flex flex-col items-center text-center group active:scale-95 ${
                      countHint > 0 ? 'border-indigo-100 hover:border-indigo-300' : 'border-slate-100 opacity-70'
                    }`}
                  >
                    <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full font-black text-[10px] ${
                      countHint > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      x{countHint}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center my-1 group-hover:scale-110 transition-transform">
                      <HelpCircle className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-black text-slate-800">คำใบ้พิเศษ</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">เผยคำใบ้เพิ่ม 1 ข้อ</span>
                  </div>

                  {/* Item 3: ขยายเวลา */}
                  <div 
                    onClick={() => {
                      if (countTime > 0) {
                        showToast('ใช้ ขยายเวลา: เพิ่มเวลาทำโจทย์ +15 วินาที!');
                      } else {
                        showToast('คุณยังไม่มีนาฬิกาขยายเวลาในกระเป๋า (x0) ซื้อได้ที่ร้านค้าของรางวัล');
                      }
                    }}
                    className={`p-3 rounded-2xl bg-white border shadow-xs hover:shadow-md transition-all cursor-pointer relative flex flex-col items-center text-center group active:scale-95 ${
                      countTime > 0 ? 'border-indigo-100 hover:border-indigo-300' : 'border-slate-100 opacity-70'
                    }`}
                  >
                    <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full font-black text-[10px] ${
                      countTime > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      x{countTime}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center my-1 group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-black text-slate-800">ขยายเวลา</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">เพิ่มเวลาในด่าน 15 วินาที</span>
                  </div>

                  {/* Item 4: โล่ป้องกัน */}
                  <div 
                    onClick={() => {
                      if (countShield > 0) {
                        showToast('เปิดใช้งาน โล่ป้องกัน: ป้องกันตอบผิด 1 ครั้ง!');
                      } else {
                        showToast('คุณยังไม่มีโล่ป้องกันในกระเป๋า (x0) ซื้อได้ที่ร้านค้าของรางวัล');
                      }
                    }}
                    className={`p-3 rounded-2xl bg-white border shadow-xs hover:shadow-md transition-all cursor-pointer relative flex flex-col items-center text-center group active:scale-95 ${
                      countShield > 0 ? 'border-indigo-100 hover:border-indigo-300' : 'border-slate-100 opacity-70'
                    }`}
                  >
                    <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full font-black text-[10px] ${
                      countShield > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      x{countShield}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center my-1 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-black text-slate-800">โล่ป้องกัน</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">ป้องกันการตอบผิด 1 ครั้ง</span>
                  </div>
                </div>
              </div>

              {/* Section 2: ไอเทมที่ได้รับจากร้านค้า (Purchased Items & Collectibles) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-purple-600 rounded-full" />
                    <h3 className="text-sm font-black text-indigo-950 uppercase tracking-wider">
                      ไอเทมในกระเป๋า ({inventoryIds.length} ชิ้น)
                    </h3>
                  </div>
                  {inventoryIds.length === 0 && (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      ยังไม่มีไอเทมใหม่
                    </span>
                  )}
                </div>

                {inventoryIds.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-2">
                    <p className="text-xs font-bold text-amber-900">
                      กระเป๋าของคุณยังไม่มีไอเทมที่ซื้อ! ไปที่ร้านค้าเพื่อเลือกซื้อไอเทมสะสมได้ทันที
                    </p>
                    <button
                      onClick={() => {
                        playClickSound();
                        onClose();
                        onSelectTab('shop');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-xs"
                    >
                      ไปที่ร้านค้า
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {uniqueInventoryIds.map((itemId) => {
                      const count = inventoryCounts[itemId] || 1;
                      const customInfo = ITEM_DETAILS_MAP[itemId];
                      const shopInfo = SHOP_ITEMS.find(s => s.id === itemId);
                      const name = customInfo?.name || shopInfo?.name || itemId;
                      const icon = customInfo?.icon || shopInfo?.icon || '📦';
                      const desc = customInfo?.desc || shopInfo?.description || 'ไอเทมจากร้านค้า';
                      const equippedNow = isItemEquipped(itemId);

                      const isChest = isChestItem(itemId);
                      const isConsumable = isConsumableItem(itemId);
                      const isOpeningThis = openingItemId === itemId;

                      return (
                        <div
                          key={itemId}
                          onClick={() => {
                            if (isConsumable) {
                              handleOpenChestItem(itemId, name, icon);
                            } else {
                              handleEquipItem(itemId, name);
                            }
                          }}
                          className={`p-3 rounded-2xl border shadow-xs hover:shadow-md transition-all cursor-pointer relative flex flex-col items-center text-center group active:scale-95 ${
                            equippedNow 
                              ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300' 
                              : isChest
                                ? 'bg-gradient-to-b from-amber-50/80 to-orange-50/60 border-amber-300 hover:border-amber-400 ring-1 ring-amber-200/50'
                                : 'bg-white border-indigo-100 hover:border-indigo-300'
                          }`}
                        >
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-black text-[10px]">
                            x{count}
                          </span>
                          {equippedNow && (
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] shadow-2xs">
                              ใส่อยู่
                            </span>
                          )}
                          {isChest && !equippedNow && (
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[9px] shadow-2xs animate-pulse">
                              🎁 กล่องสุ่ม
                            </span>
                          )}

                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-50 to-indigo-50 text-slate-800 flex items-center justify-center text-3xl my-1 group-hover:scale-110 transition-transform ${isOpeningThis ? 'animate-bounce scale-110' : ''}`}>
                            {icon}
                          </div>
                          <span className="text-xs font-black text-slate-800 line-clamp-1">{name}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5 leading-tight line-clamp-1">{desc}</span>

                          {isConsumable ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenChestItem(itemId, name, icon);
                              }}
                              disabled={isOpeningThis}
                              className="mt-2 w-full py-1.5 rounded-xl font-black text-[10px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1"
                            >
                              {isOpeningThis ? '⏳ กำลังเปิด...' : isChest ? '🎁 เปิดกล่องสุ่ม' : '🧪 เปิดใช้งาน'}
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEquipItem(itemId, name);
                              }}
                              className={`mt-2 w-full py-1.5 rounded-xl font-black text-[10px] transition ${
                                equippedNow
                                  ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs'
                              }`}
                            >
                              {equippedNow ? '✕ ถอดออก' : '✨ สวมใส่'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 3: เหรียญและเพชร (Coins & Gems) */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-indigo-950 uppercase tracking-wider">
                  เหรียญและเพชร
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Coin Card */}
                  <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-md shadow-amber-400/30 shrink-0 border-2 border-amber-200">
                        ฿
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-900 leading-none">
                          {(profile.coins ?? 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold block mt-1">
                          ใช้ซื้อไอเทมหรือปลดล็อกของ
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playClickSound();
                        onClose();
                        onSelectTab('reward_shop');
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition-all shadow-xs shrink-0 active:scale-95"
                    >
                      ไปที่ร้านค้า
                    </button>
                  </div>

                  {/* Gem Card */}
                  <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-purple-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-purple-500/30 shrink-0 border-2 border-purple-300">
                        💎
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-900 leading-none">
                          {profile.gems ?? 0}
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold block mt-1">
                          ได้รับจากภารกิจพิเศษ
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playClickSound();
                        onClose();
                        onSelectTab('reward_shop');
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-purple-500 hover:bg-purple-600 text-white font-black text-xs transition-all shadow-xs shrink-0 active:scale-95"
                    >
                      ไปที่ร้านค้า
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 4: ความคืบหน้าการสะสม (Collection Progress Track) */}
              <div className="p-4 rounded-2xl bg-white/80 border border-indigo-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-indigo-950">
                      ความคืบหน้าการสะสม
                    </h4>
                    <p className="text-[11px] text-slate-500 font-bold">
                      สะสมดาวเพื่อปลดล็อกรางวัลใหญ่!
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-black text-xs shadow-2xs">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>{totalEarnedStars}/{maxStars}</span>
                  </div>
                </div>

                {/* Star Progress Bar */}
                <div className="pt-2 relative">
                  <div className="w-full h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (totalEarnedStars / maxStars) * 100)}%` }}
                    />
                  </div>

                  {/* Chest Milestones */}
                  <div className="grid grid-cols-4 gap-2 pt-3 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg shadow-2xs border border-amber-200">
                        🎁
                      </div>
                      <span className="text-[10px] font-black text-slate-600 mt-1">10 ดาว</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg shadow-2xs border border-amber-200">
                        📦
                      </div>
                      <span className="text-[10px] font-black text-slate-600 mt-1">20 ดาว</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg shadow-2xs border border-amber-200">
                        🧰
                      </div>
                      <span className="text-[10px] font-black text-slate-600 mt-1">30 ดาว</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-lg shadow-md border-2 border-amber-200 animate-pulse">
                        👑
                      </div>
                      <span className="text-[10px] font-black text-amber-700 mt-1">42 ดาว</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PETS (สัตว์เลี้ยง) */}
          {activeTab === 'pets' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900 font-bold flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>สัตว์เลี้ยงคู่หูช่วยเพิ่มโบนัส EXP และมอบคำใบ้พิเศษในแต่ละด่าน!</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Pet 1 */}
                {(() => {
                  const isOwned = inventoryIds.includes('pet_robot');
                  const isEquipped = isOwned && profile.equippedAvatar?.pet === 'pet_robot';
                  return (
                    <div className={`p-4 rounded-2xl bg-white border shadow-sm flex flex-col items-center text-center relative ${
                      isEquipped ? 'border-2 border-indigo-500' : isOwned ? 'border-slate-200' : 'border-slate-200 opacity-80'
                    }`}>
                      {isEquipped && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-black text-[10px]">
                          ติดตั้งอยู่
                        </span>
                      )}
                      <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl my-2 shadow-inner">
                        🤖
                      </div>
                      <h4 className="text-sm font-black text-slate-900">สารวัตรไบต์ Bot</h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">หุ่นยนต์ช่วยสกัดคีย์เวิร์ด</p>
                      {isOwned ? (
                        <button 
                          onClick={() => showToast(isEquipped ? 'ติดตั้งอยู่แล้ว' : 'สลับใช้ สารวัตรไบต์ Bot')}
                          className={`mt-3 w-full py-1.5 rounded-xl font-black text-xs ${
                            isEquipped ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          {isEquipped ? 'ใช้อยู่' : 'สลับใช้งาน'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => { onClose(); onSelectTab('reward_shop'); }}
                          className="mt-3 w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition"
                        >
                          ปลดล็อกในร้านค้า
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Pet 2 */}
                {(() => {
                  const isOwned = inventoryIds.includes('pet_owl');
                  const isEquipped = isOwned && profile.equippedAvatar?.pet === 'pet_owl';
                  return (
                    <div className={`p-4 rounded-2xl bg-white border shadow-xs flex flex-col items-center text-center ${
                      isEquipped ? 'border-2 border-indigo-500' : isOwned ? 'border-slate-200' : 'border-slate-200 opacity-80'
                    }`}>
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl my-2">
                        🦉
                      </div>
                      <h4 className="text-sm font-black text-slate-900">นกฮูกนักสืบ</h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">+10% EXP ทุกภารกิจ</p>
                      {isOwned ? (
                        <button 
                          onClick={() => showToast('เปลี่ยนเป็น นกฮูกนักสืบ เรียบร้อย!')}
                          className="mt-3 w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-colors"
                        >
                          {isEquipped ? 'ใช้อยู่' : 'สลับใช้งาน'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => { onClose(); onSelectTab('reward_shop'); }}
                          className="mt-3 w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition"
                        >
                          ปลดล็อกในร้านค้า
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Pet 3 */}
                {(() => {
                  const isOwned = inventoryIds.includes('pet_fox');
                  const isEquipped = isOwned && profile.equippedAvatar?.pet === 'pet_fox';
                  return (
                    <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col items-center text-center ${isOwned ? '' : 'opacity-75'}`}>
                      <div className="w-16 h-16 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center text-3xl my-2">
                        🦊
                      </div>
                      <h4 className="text-sm font-black text-slate-700">จิ้งจอกสายลับ</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">ช่วยค้นหาข่าวปลอม</p>
                      {isOwned ? (
                        <button 
                          onClick={() => showToast('เปลี่ยนเป็น จิ้งจอกสายลับ เรียบร้อย!')}
                          className="mt-3 w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs"
                        >
                          {isEquipped ? 'ใช้อยู่' : 'สลับใช้งาน'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => { onClose(); onSelectTab('reward_shop'); }}
                          className="mt-3 w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs"
                        >
                          ปลดล็อกในร้านค้า
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 3: SKINS (สกิน) */}
          {activeTab === 'skins' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-100 text-xs text-purple-900 font-bold flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600 shrink-0" />
                <span>แต่งตัวให้อวาตาร์และปรับแต่งกรอบโปรไฟล์ของคุณให้เท่ที่สุด!</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Skin 1 */}
                {(() => {
                  const isOwned = inventoryIds.includes('hat_sherlock') || inventoryIds.includes('skin_sherlock');
                  const isEquipped = isOwned && (profile.equippedAvatar?.hat === 'hat_sherlock' || profile.equippedAvatar?.outfit === 'skin_sherlock');
                  return (
                    <div className={`p-4 rounded-2xl bg-white border shadow-sm flex flex-col items-center text-center relative ${
                      isEquipped ? 'border-2 border-amber-400' : isOwned ? 'border-slate-200' : 'border-slate-200 opacity-80'
                    }`}>
                      {isEquipped && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black text-[10px]">
                          สวมใส่อยู่
                        </span>
                      )}
                      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl my-2">
                        🕵️‍♂️
                      </div>
                      <h4 className="text-sm font-black text-slate-900">ชุดนักสืบฝึกหัด</h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">ชุดมาตรฐานองค์กร</p>
                      {isOwned ? (
                        <button 
                          onClick={() => showToast(isEquipped ? 'สวมใส่อยู่แล้ว' : 'สวมใส่ชุดนักสืบ')}
                          className={`mt-3 w-full py-1.5 rounded-xl font-black text-xs ${
                            isEquipped ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {isEquipped ? 'สวมใส่อยู่' : 'สวมใส่'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => { onClose(); onSelectTab('reward_shop'); }}
                          className="mt-3 w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs"
                        >
                          ปลดล็อกในร้านค้า
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Skin 2 */}
                {(() => {
                  const isOwned = inventoryIds.includes('skin_wizard') || inventoryIds.includes('outfit_wizard');
                  const isEquipped = isOwned && profile.equippedAvatar?.outfit === 'outfit_wizard';
                  return (
                    <div className={`p-4 rounded-2xl bg-white border shadow-xs flex flex-col items-center text-center ${
                      isEquipped ? 'border-2 border-indigo-400' : isOwned ? 'border-slate-200' : 'border-slate-200 opacity-80'
                    }`}>
                      <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-3xl my-2">
                        🧙‍♂️
                      </div>
                      <h4 className="text-sm font-black text-slate-900">ชุดจอมเวทย์คำค้น</h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">ชุดสืบค้นข้อมูลขั้นสูง</p>
                      {isOwned ? (
                        <button 
                          onClick={() => showToast('เปลี่ยนเป็น ชุดจอมเวทย์คำค้น เรียบร้อย!')}
                          className="mt-3 w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs"
                        >
                          {isEquipped ? 'สวมใส่อยู่' : 'สลับใช้'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => { onClose(); onSelectTab('reward_shop'); }}
                          className="mt-3 w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs"
                        >
                          ปลดล็อกในร้านค้า
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Skin 3 */}
                {(() => {
                  const isOwned = inventoryIds.includes('skin_truth_guardian');
                  const isEquipped = isOwned && profile.equippedAvatar?.outfit === 'skin_truth_guardian';
                  return (
                    <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex flex-col items-center text-center ${isOwned ? '' : 'opacity-80'}`}>
                      <div className="w-16 h-16 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center text-3xl my-2">
                        🛡️
                      </div>
                      <h4 className="text-sm font-black text-slate-700">ชุดผู้พิทักษ์ความจริง</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">รางวัลผ่านด่าน 6</p>
                      {isOwned ? (
                        <button 
                          onClick={() => showToast('สวมใส่ ชุดผู้พิทักษ์ความจริง เรียบร้อย!')}
                          className="mt-3 w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs"
                        >
                          {isEquipped ? 'สวมใส่อยู่' : 'สลับใช้'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => { onClose(); onSelectTab('reward_shop'); }}
                          className="mt-3 w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs"
                        >
                          ปลดล็อกในร้านค้า
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 4: NOTEBOOK (สมุดบันทึก) */}
          {activeTab === 'notebook' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs font-bold text-indigo-950">
                <span className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span>ตราเกียรติยศและบันทึกคดีสะสม</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-200/80 text-indigo-900 font-black">
                  {unlockedBadges.length}/{badges.length} ตรา
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      badge.unlocked
                        ? 'bg-white border-amber-300 shadow-xs text-slate-800'
                        : 'bg-slate-50 border-slate-200 opacity-50 text-slate-400'
                    }`}
                  >
                    <div className="text-3xl mb-1">{badge.unlocked ? '🏅' : '🔒'}</div>
                    <span className="text-xs font-black block leading-tight">{badge.title}</span>
                    <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1">{badge.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Footer */}
        <div className="p-4 bg-indigo-50/70 border-t border-indigo-100 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
            <span>ต้องการไอเทมเพิ่ม? ไปที่ร้านค้า</span>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
              onSelectTab('reward_shop');
            }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-orange-400/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <span>เปิดร้านค้าของรางวัล</span>
          </button>
        </div>

      </div>

      {/* Reward Modal Popup when opening chest/consumable from backpack */}
      {chestRewardModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-[32px] bg-gradient-to-b from-amber-400 via-orange-500 to-indigo-900 p-1 shadow-2xl text-white text-center animate-scaleUp">
            <div className="rounded-[28px] bg-slate-900/95 p-6 space-y-4 backdrop-blur-md border border-amber-400/40">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950 flex items-center justify-center text-5xl shadow-xl shadow-orange-500/50 animate-bounce border-2 border-amber-200">
                {chestRewardModal.icon}
              </div>
              
              <div>
                <h3 className="text-xl font-black text-amber-300">
                  {chestRewardModal.title}
                </h3>
                <p className="text-xs text-slate-300 font-bold mt-1">
                  ของรางวัลถูกบวกเข้าสู่บัญชีนักสืบของคุณเรียบร้อยแล้ว!
                </p>
              </div>

              <div className="space-y-2 py-2 bg-slate-800/90 rounded-2xl p-3 border border-slate-700 max-h-48 overflow-y-auto custom-scrollbar">
                {chestRewardModal.rewards.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-amber-400/30 text-xs font-black text-amber-300 shadow-2xs">
                    <span className="flex items-center gap-2">
                      <span className="text-base">{r.icon}</span>
                      <span>{r.label}</span>
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  setChestRewardModal(null);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/40 transition-all active:scale-95"
              >
                🎉 รับของรางวัล!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
