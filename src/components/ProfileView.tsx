import React, { useState, useRef } from 'react';
import { DetectiveProfile, TabType, Badge } from '../types';
import { 
  Sparkles, 
  Star, 
  Coins, 
  Gem, 
  Settings, 
  Edit3, 
  ChevronRight, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Package, 
  BookOpen, 
  Sparkle,
  X,
  Volume2,
  VolumeX,
  Share2,
  Trophy,
  Flame,
  Clock,
  Shirt,
  Heart,
  Camera
} from 'lucide-react';
import { 
  playClickSound, 
  playCoinSound, 
  playBadgeUnlockSound,
  playCorrectSound 
} from '../utils/sound';
import { SHOP_ITEMS } from '../data/shopItems';

// Decoration lookup helper
const DECORATION_MAP: Record<string, { name: string; icon: string; category: 'hat' | 'outfit' | 'pet' | 'frame'; desc: string }> = {
  hat_sherlock: { name: 'หมวกนักสืบเชอร์ล็อก', icon: '🕵️‍♂️', category: 'hat', desc: 'หมวกสไตล์คลาสสิก' },
  hat_explorer: { name: 'หมวกนักสำรวจ', icon: '🤠', category: 'hat', desc: 'หมวกปีกกว้าง' },
  glasses_thinker: { name: 'แว่นนักคิด', icon: '👓', category: 'hat', desc: 'แว่นวิเคราะห์ข้อมูล' },
  hat_cyber_visor: { name: 'แว่นสแกนเนอร์นีออน', icon: '🥽', category: 'hat', desc: 'แว่นตาไฮเทค' },
  hat_gold_crown: { name: 'มงกุฎนักสืบยอดอัจฉริยะ', icon: '👑', category: 'hat', desc: 'มงกุฎทองคำประดับอัญมณี' },
  wings_knowledge: { name: 'ปีกแห่งความรู้', icon: '🪽', category: 'outfit', desc: 'ปีกออร่าแห่งปัญญา' },
  wings_dragon_gold: { name: 'ปีกมังกรแสงดาว', icon: '🐉', category: 'outfit', desc: 'ปีกมังกรในตำนาน' },
  outfit_trench_coat: { name: 'เสื้อโค้ตยาวกันลม', icon: '🧥', category: 'outfit', desc: 'เสื้อโค้ตนักสืบ' },
  pet_robot: { name: 'เพ็ตหุ่นยนต์', icon: '🤖', category: 'pet', desc: 'หุ่นยนต์คู่หู AI' },
  pet_robot_byte: { name: 'เพ็ตหุ่นยนต์ไบต์', icon: '🤖', category: 'pet', desc: 'หุ่นยนต์คู่หู AI' },
  pet_cat_detective: { name: 'น้องแมวสายสืบ', icon: '🐱', category: 'pet', desc: 'แมวช่วยดมกลิ่น' },
  pet_owl_wisdom: { name: 'นกฮูกปัญญา', icon: '🦉', category: 'pet', desc: 'นกฮูกผู้รอบรู้' },
  frame_neon_aura: { name: 'กรอบออร่านีออน', icon: '✨', category: 'frame', desc: 'แสงนีออนเรืองแสง' },
  frame_gold_star: { name: 'กรอบดาวทองคำ', icon: '⭐', category: 'frame', desc: 'ดาวทองเกียรติยศ' },
  chest_legendary: { name: 'ออร่ากล่องตำนาน', icon: '👑', category: 'frame', desc: 'ออร่าสีชมพูฉายแสง' },
};

function getItemMeta(itemId: string) {
  if (DECORATION_MAP[itemId]) return DECORATION_MAP[itemId];
  const shopItem = SHOP_ITEMS.find(s => s.id === itemId);
  if (shopItem) {
    let cat: 'hat' | 'outfit' | 'pet' | 'frame' = 'hat';
    if (shopItem.category === 'avatar_outfit') cat = 'outfit';
    if (shopItem.category === 'avatar_pet') cat = 'pet';
    if (shopItem.category === 'avatar_frame') cat = 'frame';
    return {
      name: shopItem.name,
      icon: shopItem.icon || shopItem.previewGraphic || '✨',
      category: cat,
      desc: shopItem.description || 'ไอเทมตกแต่งโปรไฟล์'
    };
  }
  return {
    name: itemId,
    icon: '✨',
    category: (itemId.startsWith('hat_') || itemId.startsWith('glasses_') ? 'hat' : itemId.startsWith('wings_') || itemId.startsWith('outfit_') ? 'outfit' : itemId.startsWith('pet_') ? 'pet' : 'frame') as 'hat' | 'outfit' | 'pet' | 'frame',
    desc: 'ไอเทมจากกระเป๋า'
  };
}

interface ProfileViewProps {
  profile: DetectiveProfile;
  onUpdateProfile: (updated: Partial<DetectiveProfile>) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenEditProfile: () => void;
  onShowToast: (title: string, message: string, type?: 'exp' | 'badge') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onNavigateTab,
  onOpenEditProfile,
  onShowToast,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [selectedInventoryCategory, setSelectedInventoryCategory] = useState<'items' | 'pets' | 'skins' | 'notes'>('items');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์รูปภาพต้องไม่เกิน 5 MB ครับ');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateProfile({ customAvatarImage: base64String });
        playCorrectSound();
        onShowToast('📸 เปลี่ยนรูปโปรไฟล์สำเร็จ!', 'อัปโหลดรูปถ่ายส่วนตัวของคุณเรียบร้อยแล้ว', 'exp');
      };
      reader.readAsDataURL(file);
    }
  };

  const exp = profile.exp ?? 0;
  const maxExp = profile.maxExp || 100;
  const level = profile.level ?? 1;
  const expPercent = Math.min(100, Math.round((exp / maxExp) * 100));

  const stars = profile.stars ?? 0;
  const coins = profile.coins ?? 0;
  const gems = profile.gems ?? 0;

  // Stats calculation - starts from 0 for new accounts
  const completedMissionsCount = (profile.completedCases?.length || 0) + (profile.completedDailyQuests?.length || 0);
  const passedZonesCount = (profile.completedCases || []).length;
  const totalScore = profile.totalQuizTaken && profile.totalQuizTaken > 0 ? Math.round((profile.quizScore / (profile.totalQuizTaken * 10)) * 100) : 0;
  const streakDays = profile.streak ?? profile.dailyCheckInDays ?? 0;

  // 4 Badges matching user achievements
  const badgesList = [
    {
      id: 'first_clue',
      title: 'แว่นขยายแรกเริ่ม',
      icon: '🛡️',
      unlocked: profile.badges?.some(b => b.id === 'first_clue' && b.unlocked) || false,
      desc: 'เริ่มทำภารกิจสืบข้อมูลแรกสำเร็จ',
      color: 'from-amber-400 to-yellow-500',
    },
    {
      id: 'keyword_master',
      title: 'เซียนคีย์เวิร์ด',
      icon: '🌟',
      unlocked: profile.badges?.some(b => b.id === 'keyword_master' && b.unlocked) || false,
      desc: 'ไขปริศนาคดีค้นหาข้อมูลและใช้คีย์เวิร์ดได้อย่างแม่นยำ',
      color: 'from-emerald-400 to-teal-500',
    },
    {
      id: 'operator_wizard',
      title: 'จอมเวทย์สืบค้น',
      icon: '🎖️',
      unlocked: profile.badges?.some(b => b.id === 'operator_wizard' && b.unlocked) || false,
      desc: 'ใช้ตัวดำเนินการพิเศษ site:, filetype: และเครื่องหมายคำพูดคล่องแคล่ว',
      color: 'from-purple-400 to-indigo-500',
    },
    {
      id: 'master_inspector',
      title: 'สารวัตรข้อมูล ป.5',
      icon: '👑',
      unlocked: profile.badges?.some(b => b.id === 'master_inspector' && b.unlocked) || false,
      desc: 'พิชิตบอสใหญ่ดาร์กบักและสอบผ่านระดับยอดนักสืบ 80% ขึ้นไป',
      color: 'from-slate-400 to-slate-500',
    },
  ];

  // Equipped profile decorations lookup
  const equipped = profile.equippedAvatar || {};
  const equippedHatInfo = equipped.hat ? getItemMeta(equipped.hat) : null;
  const equippedOutfitInfo = equipped.outfit ? getItemMeta(equipped.outfit) : null;
  const equippedPetInfo = equipped.pet ? getItemMeta(equipped.pet) : null;
  const equippedFrameInfo = equipped.frame ? getItemMeta(equipped.frame) : null;

  const handleToggleEquip = (itemId: string) => {
    const meta = getItemMeta(itemId);
    const cat = meta.category;
    const isEquipped = equipped[cat] === itemId;

    const newEquipped = {
      ...equipped,
      [cat]: isEquipped ? undefined : itemId
    };

    onUpdateProfile({ equippedAvatar: newEquipped });
    playCorrectSound();
    if (isEquipped) {
      onShowToast('ถอดของตกแต่ง', `ถอด "${meta.name}" ออกจากโปรไฟล์แล้ว`, 'exp');
    } else {
      onShowToast('🎉 ตกแต่งโปรไฟล์สำเร็จ!', `สวมใส่ "${meta.name}" บนอวาตาร์แล้ว`, 'exp');
    }
  };

  // Inventory list enhanced with profile inventory - strictly reflects user's actual items (starts at 0)
  const userInventoryIds = profile.inventory || [];
  const dynamicSkins = userInventoryIds.filter(id => id.startsWith('hat_') || id.startsWith('wings_') || id.startsWith('outfit_') || id.startsWith('frame_') || id.startsWith('glasses_')).map(id => {
    const meta = getItemMeta(id);
    return { id, name: meta.name, icon: meta.icon, count: 1, desc: meta.desc };
  });

  const dynamicPets = userInventoryIds.filter(id => id.startsWith('pet_')).map(id => {
    const meta = getItemMeta(id);
    return { id, name: meta.name, icon: meta.icon, count: 1, desc: meta.desc };
  });

  const defaultItems = userInventoryIds.filter(id => id.startsWith('item_') || id.startsWith('potion_') || id.startsWith('magnifier_') || id.startsWith('shield_') || id.startsWith('chest_')).map(id => {
    const meta = getItemMeta(id);
    return { id, name: meta.name, icon: meta.icon, count: 1, desc: meta.desc };
  });

  const defaultNotes = userInventoryIds.filter(id => id.startsWith('note_')).map(id => {
    const meta = getItemMeta(id);
    return { id, name: meta.name, icon: meta.icon, count: 1, desc: meta.desc };
  });

  const inventoryItems = {
    items: defaultItems,
    pets: dynamicPets,
    skins: dynamicSkins,
    notes: defaultNotes,
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-sky-200 via-blue-50 to-indigo-100 font-sans text-slate-800 relative select-none">
      
      {/* Background Soft Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-10 left-10 w-80 h-80 bg-sky-300 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 space-y-4 relative z-10">
        
        {/* TOP BLUE HEADER BANNER: ⭐ โปรไฟล์ ⚙️ */}
        <div className="flex items-center justify-between px-2">
          <div className="w-9 h-9 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center text-amber-400 shadow-sm border border-white">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>

          {/* Title */}
          <h1 className="font-black text-xl sm:text-2xl text-slate-800 tracking-wide drop-shadow-sm">
            โปรไฟล์
          </h1>

          {/* Settings Button */}
          <button
            onClick={() => {
              playClickSound();
              setIsSettingsOpen(true);
            }}
            className="w-9 h-9 rounded-full bg-white/60 hover:bg-white backdrop-blur-md flex items-center justify-center text-slate-700 shadow-sm border border-white transition active:scale-95"
            title="ตั้งค่า"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* TEACHER DASHBOARD SHORTCUT CARD (Visible ONLY to Teachers) */}
        {profile.authUser?.role === 'teacher' && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-[28px] p-4 text-white shadow-lg flex items-center justify-between gap-3 border border-emerald-400/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shrink-0">
                👩‍🏫
              </div>
              <div>
                <h3 className="font-black text-sm text-white">ระบบจัดการการเรียนรู้สำหรับคุณครู</h3>
                <p className="text-xs text-emerald-100">ตรวจผลงานนักเรียน จัดการสื่อ และเครื่องมือห้องเรียน</p>
              </div>
            </div>
            <button
              onClick={() => {
                playClickSound();
                onNavigateTab('teacher_portal');
              }}
              className="px-3.5 py-2 rounded-xl bg-white text-emerald-800 font-black text-xs hover:bg-emerald-50 transition shadow-sm shrink-0 active:scale-95"
            >
              เข้าสู่ระบบครู &rarr;
            </button>
          </div>
        )}

        {/* MAIN PROFILE CARD (Avatar, Name, Level, EXP bar, Currency) */}
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-xl border-4 border-white/90 p-5 sm:p-6 space-y-4">
          
          {/* Top Row: Big Avatar + Info */}
          <div className="flex items-center gap-4 sm:gap-5">
            
            {/* Avatar Container with Equipped Decorations & Edit Pencil / Photo Upload Buttons */}
            <div className="relative shrink-0 my-1">
              {/* Outer Frame Ring Aura */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-pink-200 via-amber-100 to-sky-100 p-1 shadow-lg border-2 border-white flex items-center justify-center overflow-hidden relative cursor-pointer group transition-all ${
                  equippedFrameInfo ? 'ring-4 ring-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.6)]' : ''
                }`}
                title="คลิกเพื่ออัปโหลดรูปถ่ายส่วนตัวของคุณ"
              >
                {profile.customAvatarImage ? (
                  <img 
                    src={profile.customAvatarImage} 
                    alt={profile.name} 
                    className="w-full h-full object-cover rounded-full" 
                  />
                ) : (
                  <span className="text-4xl sm:text-5xl">{profile.avatar || '👧'}</span>
                )}

                {/* Hover Camera Overlay */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-black transition-opacity backdrop-blur-[1px] rounded-full">
                  <Camera className="w-5 h-5 text-amber-300 mb-0.5" />
                  <span>เปลี่ยนรูป</span>
                </div>
              </div>

              {/* Equipped Hat Badge (Top-Right) */}
              {equippedHatInfo && (
                <div className="absolute -top-2 -right-1 w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-lg shadow-md border-2 border-white animate-bounce" title={`สวมใส่: ${equippedHatInfo.name}`}>
                  {equippedHatInfo.icon}
                </div>
              )}

              {/* Equipped Outfit/Wings Badge (Top-Left) */}
              {equippedOutfitInfo && (
                <div className="absolute -top-1 -left-2 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-lg shadow-md border-2 border-white animate-pulse" title={`สวมใส่: ${equippedOutfitInfo.name}`}>
                  {equippedOutfitInfo.icon}
                </div>
              )}

              {/* Equipped Pet Badge (Bottom-Right) */}
              {equippedPetInfo && (
                <div className="absolute -bottom-1 -right-2 w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-lg shadow-md border-2 border-white animate-pulse" title={`สัตว์เลี้ยง: ${equippedPetInfo.name}`}>
                  {equippedPetInfo.icon}
                </div>
              )}

              {/* Edit Profile Pencil Button */}
              <button
                onClick={() => {
                  playClickSound();
                  onOpenEditProfile();
                }}
                className="absolute bottom-0 left-0 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md border-2 border-white transition active:scale-90"
                title="แก้ไขข้อมูลโปรไฟล์"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              {/* Photo Upload Camera Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 -right-1 w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md border-2 border-white transition active:scale-90"
                title="อัปโหลดรูปถ่ายส่วนตัวของคุณ"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* User Info & Level */}
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-lg sm:text-xl text-slate-800 truncate">
                {profile.name || 'น้องมินนี่'}
              </h2>
              
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-black text-xs sm:text-sm text-indigo-600">
                  Level {level}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {profile.rankTitle || 'ยอดนักสืบฝึกหัด'}
                </span>
              </div>

              {/* Level EXP Bar */}
              <div className="mt-2 space-y-1">
                <div className="h-3 w-full bg-indigo-100 rounded-full overflow-hidden p-0.5 border border-indigo-200">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${expPercent}%` }}
                  />
                </div>
                <div className="text-right text-[10px] font-bold text-indigo-900">
                  {exp.toLocaleString()} / {maxExp.toLocaleString()} XP
                </div>
              </div>
            </div>

          </div>

          {/* EQUIPPED GEAR BAR (ของตกแต่งโปรไฟล์ที่สวมใส่อยู่) */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider mr-1">
                ✨ ของตกแต่ง:
              </span>

              {equippedHatInfo && (
                <button
                  onClick={() => handleToggleEquip(equipped.hat!)}
                  className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1 border border-amber-300 transition"
                  title="คลิกเพื่อถอดหมวก/แว่น"
                >
                  <span>{equippedHatInfo.icon}</span>
                  <span>{equippedHatInfo.name}</span>
                  <span className="text-[10px] text-amber-600 font-black ml-0.5">✕</span>
                </button>
              )}

              {equippedOutfitInfo && (
                <button
                  onClick={() => handleToggleEquip(equipped.outfit!)}
                  className="px-2.5 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1 border border-purple-300 transition"
                  title="คลิกเพื่อถอดชุด/ปีก"
                >
                  <span>{equippedOutfitInfo.icon}</span>
                  <span>{equippedOutfitInfo.name}</span>
                  <span className="text-[10px] text-purple-600 font-black ml-0.5">✕</span>
                </button>
              )}

              {equippedPetInfo && (
                <button
                  onClick={() => handleToggleEquip(equipped.pet!)}
                  className="px-2.5 py-1 rounded-xl bg-cyan-100 hover:bg-cyan-200 text-cyan-900 font-bold text-xs flex items-center gap-1 border border-cyan-300 transition"
                  title="คลิกเพื่อถอดสัตว์เลี้ยง"
                >
                  <span>{equippedPetInfo.icon}</span>
                  <span>{equippedPetInfo.name}</span>
                  <span className="text-[10px] text-cyan-600 font-black ml-0.5">✕</span>
                </button>
              )}

              {equippedFrameInfo && (
                <button
                  onClick={() => handleToggleEquip(equipped.frame!)}
                  className="px-2.5 py-1 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-900 font-bold text-xs flex items-center gap-1 border border-pink-300 transition"
                  title="คลิกเพื่อถอดกรอบออร่า"
                >
                  <span>{equippedFrameInfo.icon}</span>
                  <span>{equippedFrameInfo.name}</span>
                  <span className="text-[10px] text-pink-600 font-black ml-0.5">✕</span>
                </button>
              )}

              {!equippedHatInfo && !equippedOutfitInfo && !equippedPetInfo && !equippedFrameInfo && (
                <span className="text-xs text-slate-400 font-bold">ยังไม่ได้สวมใส่ของตกแต่ง</span>
              )}
            </div>

            <button
              onClick={() => {
                playClickSound();
                setSelectedInventoryCategory('skins');
                setIsInventoryModalOpen(true);
              }}
              className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black text-xs border border-indigo-200 transition active:scale-95 flex items-center gap-1"
            >
              <span>🎨 แต่งโปรไฟล์</span>
            </button>
          </div>

          {/* CURRENCY BAR IN PROFILE (⭐ 250 ดาว, ฿ 1,250 เหรียญ, 💎 45 เพชร) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 border-t border-slate-100">
            {/* Stars */}
            <div className="flex items-center justify-center gap-2 bg-amber-50/70 py-2 px-1 rounded-2xl border border-amber-200/80">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <div className="text-left">
                <span className="block font-black text-xs sm:text-sm text-slate-800 leading-none">
                  {stars.toLocaleString()}
                </span>
                <span className="block text-[9px] text-slate-400 font-bold leading-none mt-0.5">ดาว</span>
              </div>
            </div>

            {/* Coins */}
            <div className="flex items-center justify-center gap-2 bg-yellow-50/70 py-2 px-1 rounded-2xl border border-yellow-200/80">
              <span className="font-black text-amber-600 text-sm">฿</span>
              <div className="text-left">
                <span className="block font-black text-xs sm:text-sm text-slate-800 leading-none">
                  {coins.toLocaleString()}
                </span>
                <span className="block text-[9px] text-slate-400 font-bold leading-none mt-0.5">เหรียญ</span>
              </div>
            </div>

            {/* Gems */}
            <div className="flex items-center justify-center gap-2 bg-purple-50/70 py-2 px-1 rounded-2xl border border-purple-200/80">
              <Gem className="w-3.5 h-3.5 text-purple-600" />
              <div className="text-left">
                <span className="block font-black text-xs sm:text-sm text-slate-800 leading-none">
                  {gems.toLocaleString()}
                </span>
                <span className="block text-[9px] text-slate-400 font-bold leading-none mt-0.5">เพชร</span>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 1: สถิติการเรียนรู้ (4 Big Stats Grid matching mockup) */}
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-xl border-4 border-white/90 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-1.5 font-black text-slate-800 text-sm sm:text-base">
            <span>สถิติการเรียนรู้</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            
            {/* Stat 1: ภารกิจที่สำเร็จ */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-500 font-bold block">ภารกิจที่สำเร็จ</span>
              <span className="font-black text-2xl text-slate-800 mt-1 block">
                {completedMissionsCount}
              </span>
              <span className="text-[10px] text-slate-400 block">ภารกิจ</span>
            </div>

            {/* Stat 2: ด่านที่ผ่าน */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-500 font-bold block">ด่านที่ผ่าน</span>
              <span className="font-black text-2xl text-slate-800 mt-1 block">
                {passedZonesCount}
              </span>
              <span className="text-[10px] text-slate-400 block">ด่าน</span>
            </div>

            {/* Stat 3: คะแนนรวม */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-500 font-bold block">คะแนนรวม</span>
              <span className="font-black text-2xl text-slate-800 mt-1 block">
                {totalScore}%
              </span>
              <span className="text-[10px] text-slate-400 block">เฉลี่ย</span>
            </div>

            {/* Stat 4: วันเข้าเรียนต่อเนื่อง */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-500 font-bold block">วันเข้าเรียนต่อเนื่อง</span>
              <span className="font-black text-2xl text-slate-800 mt-1 block">
                {streakDays}
              </span>
              <span className="text-[10px] text-slate-400 block">วัน</span>
            </div>

          </div>
        </div>

        {/* SECTION 2: ความสำเร็จ (ดูทั้งหมด >) */}
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-xl border-4 border-white/90 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-slate-800 text-sm sm:text-base">
              <span>ความสำเร็จ</span>
            </div>
            <button
              onClick={() => {
                playClickSound();
                setIsBadgesModalOpen(true);
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Badges/Shields Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {badgesList.map((b) => (
              <div 
                key={b.id}
                onClick={() => {
                  playClickSound();
                  setIsBadgesModalOpen(true);
                }}
                className={`rounded-2xl p-3 border text-center flex flex-col items-center justify-center transition cursor-pointer hover:scale-105 ${
                  b.unlocked 
                    ? 'bg-white border-slate-100 shadow-sm hover:border-indigo-300' 
                    : 'bg-slate-50 border-dashed border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-1.5 shadow-sm ${
                  b.unlocked 
                    ? `bg-gradient-to-tr ${b.color} text-white` 
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {b.unlocked ? b.icon : <Lock className="w-6 h-6 text-slate-400" />}
                </div>

                <span className="font-black text-xs text-slate-800 block truncate w-full">
                  {b.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: กระเป๋าของฉัน (ดูทั้งหมด >) */}
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-xl border-4 border-white/90 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-slate-800 text-sm sm:text-base">
              <span>กระเป๋าของฉัน</span>
            </div>
            <button
              onClick={() => {
                playClickSound();
                setIsInventoryModalOpen(true);
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Inventory Categories Grid matching mockup */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            
            {/* 1. ไอเทม */}
            <div 
              onClick={() => {
                playClickSound();
                setSelectedInventoryCategory('items');
                setIsInventoryModalOpen(true);
              }}
              className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 hover:scale-105 transition"
            >
              <div className="flex items-center gap-1 text-amber-600 text-xs font-bold mb-1">
                <span>📦</span>
                <span>ไอเทม</span>
              </div>
              <span className="font-black text-xl text-slate-800">{inventoryItems.items.length}</span>
              <span className="text-[10px] text-slate-400">ชิ้น</span>
            </div>

            {/* 2. สัตว์เลี้ยง */}
            <div 
              onClick={() => {
                playClickSound();
                setSelectedInventoryCategory('pets');
                setIsInventoryModalOpen(true);
              }}
              className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 hover:scale-105 transition"
            >
              <div className="flex items-center gap-1 text-purple-600 text-xs font-bold mb-1">
                <span>🐾</span>
                <span>สัตว์เลี้ยง</span>
              </div>
              <span className="font-black text-xl text-slate-800">{inventoryItems.pets.length}</span>
              <span className="text-[10px] text-slate-400">ตัว</span>
            </div>

            {/* 3. สกิน */}
            <div 
              onClick={() => {
                playClickSound();
                setSelectedInventoryCategory('skins');
                setIsInventoryModalOpen(true);
              }}
              className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 hover:scale-105 transition"
            >
              <div className="flex items-center gap-1 text-pink-600 text-xs font-bold mb-1">
                <span>👗</span>
                <span>สกิน</span>
              </div>
              <span className="font-black text-xl text-slate-800">{inventoryItems.skins.length}</span>
              <span className="text-[10px] text-slate-400">ชิ้น</span>
            </div>

            {/* 4. สมุดบันทึก */}
            <div 
              onClick={() => {
                playClickSound();
                setSelectedInventoryCategory('notes');
                setIsInventoryModalOpen(true);
              }}
              className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 hover:scale-105 transition"
            >
              <div className="flex items-center gap-1 text-blue-600 text-xs font-bold mb-1">
                <span>📓</span>
                <span>สมุดบันทึก</span>
              </div>
              <span className="font-black text-xl text-slate-800">{inventoryItems.notes.length}</span>
              <span className="text-[10px] text-slate-400">เล่ม</span>
            </div>

          </div>
        </div>

      </div>

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-2 border-indigo-200 text-slate-800 space-y-4">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-lg">ตั้งค่าระบบ</h3>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-xs">🔊 เสียงเอฟเฟกต์ (SFX)</span>
                <button
                  onClick={() => onUpdateProfile({ soundEnabled: !profile.soundEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    profile.soundEnabled !== false ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    profile.soundEnabled !== false ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-xs">👤 แก้ไขข้อมูลนักสืบ</span>
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    onOpenEditProfile();
                  }}
                  className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs border border-indigo-200"
                >
                  แก้ไข
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-2.5 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-md hover:bg-indigo-700"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      )}

      {/* BADGES MODAL */}
      {isBadgesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-2 border-amber-200 text-slate-800 space-y-4 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsBadgesModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-lg">เหรียญตราความสำเร็จ (4/4)</h3>
            </div>

            <div className="space-y-3">
              {badgesList.map((b) => (
                <div 
                  key={b.id}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3.5 ${
                    b.unlocked ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-xs ${
                    b.unlocked ? `bg-gradient-to-tr ${b.color} text-white` : 'bg-slate-200 text-slate-400'
                  }`}>
                    {b.unlocked ? b.icon : <Lock className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-800">{b.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY EXPLORER MODAL */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-2 border-indigo-200 text-slate-800 space-y-4 max-h-[85vh] flex flex-col">
            <button
              onClick={() => setIsInventoryModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-lg">กระเป๋าของฉัน (Inventory)</h3>
            </div>

            {/* Category tabs inside modal */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {(['items', 'pets', 'skins', 'notes'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedInventoryCategory(cat)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                    selectedInventoryCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'items' ? '📦 ไอเทม' : cat === 'pets' ? '🐾 สัตว์เลี้ยง' : cat === 'skins' ? '👗 สกิน' : '📓 สมุด'}
                </button>
              ))}
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {(() => {
                const currentCategoryItems = selectedInventoryCategory === 'skins' 
                  ? dynamicSkins 
                  : selectedInventoryCategory === 'pets' 
                    ? dynamicPets 
                    : (inventoryItems as any)[selectedInventoryCategory];

                if (!currentCategoryItems || currentCategoryItems.length === 0) {
                  return (
                    <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-2.5 text-slate-400">
                        {selectedInventoryCategory === 'items' ? '📦' : selectedInventoryCategory === 'pets' ? '🐾' : selectedInventoryCategory === 'skins' ? '👗' : '📓'}
                      </div>
                      <h4 className="font-black text-sm text-slate-700">ยังไม่มีไอเทมในหมวดนี้</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        {selectedInventoryCategory === 'pets' 
                          ? 'สามารถรับสัตว์เลี้ยงคู่หูได้จากร้านค้ารางวัลหรือทำภารกิจพิเศษ' 
                          : selectedInventoryCategory === 'skins' 
                            ? 'สามารถสะสมชุดตกแต่งและหมวกได้จากร้านค้าหรือด่านผจญภัย' 
                            : 'ทำภารกิจและเปิดหีบสมบัติเพื่อรับไอเทมสะสม'}
                      </p>
                    </div>
                  );
                }

                return currentCategoryItems.map((item: any, idx: number) => {
                  const itemId = item.id || '';
                  const meta = itemId ? getItemMeta(itemId) : null;
                  const cat = meta ? meta.category : 'hat';
                  const isEquipped = itemId ? equipped[cat] === itemId : false;

                  return (
                    <div key={idx} className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition ${
                      isEquipped ? 'bg-indigo-50/90 border-indigo-300 shadow-xs' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-2xl shadow-xs border border-slate-100 shrink-0">
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-xs text-slate-800 truncate">{item.name}</h4>
                            {isEquipped && (
                              <span className="text-[9px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-full shrink-0">
                                สวมใส่อยู่
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{item.desc}</p>
                        </div>
                      </div>

                      {itemId ? (
                        <button
                          onClick={() => handleToggleEquip(itemId)}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs shrink-0 transition active:scale-95 shadow-2xs ${
                            isEquipped 
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                          }`}
                        >
                          {isEquipped ? '✕ ถอดออก' : '✨ สวมใส่'}
                        </button>
                      ) : (
                        <span className="font-black text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 shrink-0">
                          x{item.count || 1}
                        </span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
