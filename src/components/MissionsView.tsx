import React, { useState, useEffect } from 'react';
import { DetectiveProfile, TabType } from '../types';
import { 
  Search, 
  BookOpen, 
  ClipboardList, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  Star, 
  Coins, 
  Gem, 
  Bell, 
  Settings, 
  Pencil, 
  Map, 
  ShoppingBag, 
  Users, 
  User, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Target, 
  ChevronRight,
  Flame,
  Swords,
  Gift,
  X,
  ShieldCheck,
  Award,
  ArrowRight
} from 'lucide-react';
import { 
  playClickSound, 
  playCorrectSound, 
  playCoinSound, 
  playBadgeUnlockSound,
  playChestOpenSound 
} from '../utils/sound';
import { isStageUnlocked } from '../utils/stageUnlock';

interface MissionsViewProps {
  profile: DetectiveProfile;
  onUpdateProfile: (updated: Partial<DetectiveProfile>) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenProfile: () => void;
  onOpenLeaderboard?: () => void;
  onOpenDailyCheckIn?: () => void;
  onShowToast: (title: string, message: string, type?: 'exp' | 'badge') => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  profile,
  onUpdateProfile,
  onNavigateTab,
  onOpenProfile,
  onOpenLeaderboard,
  onOpenDailyCheckIn,
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<'main' | 'special'>('main');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Real-time ticking countdown to midnight (e.g. 14 : 23 : 45)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 23, seconds: 45 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = Math.max(0, endOfDay.getTime() - now.getTime());
      
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const completedDaily = profile.completedDailyQuests || [];
  const completedSpecial = profile.completedSpecialQuests || [];
  const unlockedZones = profile.unlockedZones || ['zone1_basics'];
  const completedCases = profile.completedCases || [];

  // Claim Daily Quest
  const handleClaimDaily = (questId: string, starReward: number, coinReward: number) => {
    if (completedDaily.includes(questId)) return;
    playCoinSound();
    const nextCompleted = [...completedDaily, questId];
    onUpdateProfile({
      completedDailyQuests: nextCompleted,
      stars: (profile.stars || 0) + starReward,
      coins: (profile.coins || 0) + coinReward,
      exp: (profile.exp || 0) + 30,
    });
    onShowToast('🎉 รับรางวัลสำเร็จ!', `+⭐ ${starReward} ดาว  +🪙 ${coinReward} เหรียญ`, 'exp');
  };

  // Claim Special Quest
  const handleClaimSpecial = (questId: string, starReward: number, coinReward: number, gemReward: number) => {
    if (completedSpecial.includes(questId)) return;
    playBadgeUnlockSound();
    const nextSpecial = [...completedSpecial, questId];
    onUpdateProfile({
      completedSpecialQuests: nextSpecial,
      stars: (profile.stars || 0) + starReward,
      coins: (profile.coins || 0) + coinReward,
      gems: (profile.gems || 0) + gemReward,
      exp: (profile.exp || 0) + 80,
    });
    onShowToast('🏆 รับรางวัลภารกิจพิเศษ!', `+⭐ ${starReward}  +🪙 ${coinReward}  +💎 ${gemReward} เพชร`, 'badge');
  };

  // Check progress calculation
  const dailyQuestsData = [
    {
      id: 'daily_search_1',
      title: 'ค้นหาข้อมูล 1 ครั้ง',
      desc: 'ใช้เครื่องมือค้นหาเพื่อค้นหาข้อมูล 1 ครั้ง',
      progress: profile.solvedCluesCount > 0 ? 1 : 1, // Ready
      max: 1,
      stars: 10,
      coins: 20,
      icon: 'search',
      targetTab: 'zone1_basics' as TabType,
    },
    {
      id: 'daily_read_1',
      title: 'อ่านเนื้อหาให้จบ 1 บท',
      desc: 'อ่านบทเรียนในบทที่กำหนดให้จบ 1 บท',
      progress: profile.level >= 2 || (unlockedZones || []).length > 1 ? 1 : 0,
      max: 1,
      stars: 15,
      coins: 30,
      icon: 'book',
      targetTab: 'zone2_spells' as TabType,
    },
    {
      id: 'daily_quiz_1',
      title: 'ทำแบบทดสอบ 1 ชุด',
      desc: 'ทำแบบทดสอบให้ได้คะแนนอย่างน้อย 70%',
      progress: profile.totalQuizTaken > 0 ? 1 : 0,
      max: 1,
      stars: 20,
      coins: 40,
      icon: 'quiz',
      targetTab: 'zone6_exam' as TabType,
    }
  ];

  const dailyDoneCount = dailyQuestsData.filter(q => completedDaily.includes(q.id) || q.progress >= q.max).length;

  // Main Story Questline Stages (1-6 + Boss)
  const mainStagesData = [
    {
      num: 1,
      color: 'bg-emerald-500',
      title: 'ทำความรู้จักการค้นหาข้อมูล',
      desc: 'เรียนรู้พื้นฐานของการค้นหาข้อมูลบนอินเทอร์เน็ต',
      stars: 30,
      coins: 60,
      gems: 5,
      tab: 'zone1_basics' as TabType,
      isUnlocked: true,
      progressText: unlockedZones && unlockedZones.includes('zone2_spells') ? 'สำเร็จ 3/3' : 'กำลังเรียน 2/3',
      isCompleted: unlockedZones && unlockedZones.includes('zone2_spells'),
    },
    {
      num: 2,
      color: 'bg-sky-500',
      title: 'แหล่งข้อมูลในอินเทอร์เน็ต',
      desc: 'สำรวจแหล่งข้อมูลที่เชื่อถือได้และประเภทของข้อมูล',
      stars: 40,
      coins: 80,
      gems: 10,
      tab: 'zone2_spells' as TabType,
      isUnlocked: isStageUnlocked('zone2_spells', profile),
      progressText: unlockedZones && unlockedZones.includes('zone3_trust') ? 'สำเร็จ 3/3' : 'ด่านที่ 2',
      isCompleted: unlockedZones && unlockedZones.includes('zone3_trust'),
    },
    {
      num: 3,
      color: 'bg-purple-500',
      title: 'เทคนิคการค้นหา',
      desc: 'ใช้เทคนิคการค้นหาขั้นสูง เพื่อให้ได้ผลลัพธ์ที่ตรงใจ',
      stars: 40,
      coins: 80,
      gems: 10,
      tab: 'zone3_trust' as TabType,
      isUnlocked: isStageUnlocked('zone3_trust', profile),
      progressText: unlockedZones && unlockedZones.includes('zone4_cases') ? 'สำเร็จ 3/3' : 'ด่านที่ 3',
      isCompleted: unlockedZones && unlockedZones.includes('zone4_cases'),
    },
    {
      num: 4,
      color: 'bg-amber-500',
      title: 'แฟ้มคดีปริศนาข้อมูลลับ',
      desc: 'ไขคดีปริศนา 4 คดี วิเคราะห์หลักฐานและจับผิดข่าวลวง',
      stars: 50,
      coins: 100,
      gems: 15,
      tab: 'zone4_cases' as TabType,
      isUnlocked: isStageUnlocked('zone4_cases', profile),
      progressText: `${(completedCases || []).length}/4 คดี`,
      isCompleted: (completedCases || []).length >= 4,
    },
    {
      num: 5,
      color: 'bg-teal-500',
      title: 'ห้องทดลองสืบค้น & AI',
      desc: 'ฝึกสืบค้นข้อมูลในสถานการณ์จำลองร่วมกับสารวัตรไบต์',
      stars: 50,
      coins: 100,
      gems: 15,
      tab: 'zone5_sandbox' as TabType,
      isUnlocked: isStageUnlocked('zone5_sandbox', profile),
      progressText: 'โหมดสืบค้น',
      isCompleted: profile.solvedCluesCount >= 3,
    },
    {
      num: 6,
      color: 'bg-indigo-600',
      title: 'สอบวัดระดับยอดนักสืบ',
      desc: 'ทำข้อสอบประเมินผลความรู้ข้อมูลสารสนเทศ ป.5',
      stars: 60,
      coins: 150,
      gems: 20,
      tab: 'zone6_exam' as TabType,
      isUnlocked: isStageUnlocked('zone6_exam', profile),
      progressText: profile.totalQuizTaken > 0 ? `คะแนน ${profile.quizScore || 80}%` : 'ยังไม่ได้สอบ',
      isCompleted: (profile.quizScore || 0) >= 70,
    },
    {
      num: '👑',
      color: 'bg-gradient-to-r from-red-600 to-rose-600',
      title: 'ศึกบอสใหญ่: ดาร์กบัก',
      desc: 'เผชิญหน้าจอมวายร้าย ปราบปีศาจข่าวลวงกอบกู้โลกสารสนเทศ',
      stars: 100,
      coins: 300,
      gems: 50,
      tab: 'boss_battle' as TabType,
      isUnlocked: isStageUnlocked('boss_battle', profile),
      progressText: profile.bossDefeated ? 'ปราบบอสแล้ว 🎉' : 'ศึกตัดสินชี้ชะตา',
      isCompleted: !!profile.bossDefeated,
    }
  ];

  // Special Missions
  const specialMissionsData = [
    {
      id: 'spec_checkin_3',
      title: 'เช็กอินสะสมครบ 3 วัน',
      desc: 'เข้าสู่ระบบเรียนรู้และเช็กอินรายวันต่อเนื่อง',
      progress: profile.dailyCheckInDays || 2,
      max: 3,
      stars: 50,
      coins: 150,
      gems: 20,
      icon: 'calendar',
    },
    {
      id: 'spec_boss_1',
      title: 'พิชิตจอมวายร้ายบอสดาร์กบัก',
      desc: 'เอาชนะบอสใหญ่ในดันเจี้ยนศึกตัดสิน',
      progress: profile.bossDefeated ? 1 : 0,
      max: 1,
      stars: 100,
      coins: 300,
      gems: 50,
      icon: 'swords',
    },
    {
      id: 'spec_exam_master',
      title: 'ทำคะแนนสอบข้อสอบ ป.5 ได้ 80% ขึ้นไป',
      desc: 'ผ่านการทดสอบวัดระดับด้วยเกรดระดับยอดเยี่ยม',
      progress: (profile.quizScore || 0) >= 80 ? 1 : 0,
      max: 1,
      stars: 80,
      coins: 250,
      gems: 30,
      icon: 'award',
    },
    {
      id: 'spec_cases_all',
      title: 'คลี่คลายแฟ้มคดีปริศนาครบ 4 คดี',
      desc: 'สืบหาความจริงและจับคนร้ายในแฟ้มคดีทั้ง 4 เรื่อง',
      progress: (completedCases || []).length,
      max: 4,
      stars: 70,
      coins: 200,
      gems: 25,
      icon: 'shield',
    },
    {
      id: 'spec_shop_3',
      title: 'ซื้อของตกแต่งหรือเครื่องแต่งกายครบ 3 ชิ้น',
      desc: 'นำเหรียญรางวัลไปช้อปปิ้งที่ร้านค้าและแต่งห้องนอน',
      progress: Math.min(3, (profile.inventory || []).length),
      max: 3,
      stars: 40,
      coins: 100,
      gems: 15,
      icon: 'gift',
    }
  ];

  const padZero = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-100 font-sans text-slate-800 relative select-none">
      
      {/* Background Soft Scenery Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-10 left-10 w-72 h-40 bg-white/70 rounded-full blur-2xl" />
        <div className="absolute top-40 right-10 w-96 h-48 bg-white/60 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-80 h-32 bg-emerald-200/50 rounded-full blur-2xl" />
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 space-y-4 relative z-10">
        
        {/* TOP BAR: Profile Card + Currencies (Matching the exact UI in reference image) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Left: User Profile Pill Card */}
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-3xl shadow-md border border-white/80">
            {/* Avatar with Cute Border */}
            <div 
              onClick={() => { playClickSound(); onOpenProfile(); }}
              className="relative cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-200 shadow-sm bg-gradient-to-tr from-amber-100 to-pink-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                {profile.customAvatarImage ? (
                  <img 
                    src={profile.customAvatarImage} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-2xl">{profile.avatar || '👧'}</span>
                )}
              </div>
            </div>

            {/* Name, Edit Icon & Level */}
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium leading-none">สวัสดีค่ะ</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-extrabold text-sm sm:text-base text-slate-800 leading-tight">
                  {profile.name || 'น้องมินนี่'}
                </span>
                <button 
                  onClick={() => { playClickSound(); onOpenProfile(); }}
                  className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition shadow-sm"
                  title="แก้ไขโปรไฟล์"
                >
                  <Pencil className="w-2.5 h-2.5" />
                </button>
              </div>
              
              {/* Level & XP Bar */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-black text-indigo-600">
                  Level {profile.level || 5}
                </span>
                <div className="w-20 sm:w-28 bg-indigo-100 rounded-full h-2 overflow-hidden border border-indigo-200/60">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round(((profile.exp || 65) / (profile.maxExp || 100)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Center-Right: 3 Currency Cards (Stars, Coins, Gems) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stars Pill (⭐ ดาว) */}
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-3xl shadow-md border border-white/80">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-white shadow-sm shadow-amber-300">
                <Star className="w-4 h-4 fill-white text-white" />
              </div>
              <div className="text-left">
                <span className="block font-black text-sm text-slate-800 leading-none">
                  {(profile.stars || 250).toLocaleString()}
                </span>
                <span className="block text-[10px] text-slate-400 font-bold leading-none mt-0.5">ดาว</span>
              </div>
            </div>

            {/* Coins Pill (🪙 เหรียญ) */}
            <div 
              onClick={() => { playClickSound(); onNavigateTab('reward_shop'); }}
              className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-3xl shadow-md border border-white/80 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              title="ร้านค้าของรางวัล"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm shadow-amber-400">
                ฿
              </div>
              <div className="text-left">
                <span className="block font-black text-sm text-slate-800 leading-none">
                  {(profile.coins ?? 0).toLocaleString()}
                </span>
                <span className="block text-[10px] text-slate-400 font-bold leading-none mt-0.5">เหรียญ</span>
              </div>
            </div>

            {/* Gems Pill (💎 เพชร) */}
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-3xl shadow-md border border-white/80">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center text-white shadow-sm shadow-purple-400">
                <Gem className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="text-left">
                <span className="block font-black text-sm text-slate-800 leading-none">
                  {(profile.gems || 45).toLocaleString()}
                </span>
                <span className="block text-[10px] text-slate-400 font-bold leading-none mt-0.5">เพชร</span>
              </div>
            </div>

            {/* Top Right Controls (Bell & Settings) */}
            <div className="flex items-center gap-1.5 ml-1">
              {/* Notification Bell */}
              <button
                onClick={() => { playClickSound(); setIsNotificationOpen(true); }}
                className="relative w-9 h-9 rounded-2xl bg-white/95 hover:bg-white text-slate-600 hover:text-indigo-600 shadow-md border border-white/80 flex items-center justify-center transition"
                title="การแจ้งเตือน & ประกาศ"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
              </button>

              {/* Settings Gear */}
              <button
                onClick={() => { playClickSound(); setIsSettingsOpen(true); }}
                className="w-9 h-9 rounded-2xl bg-white/95 hover:bg-white text-slate-600 hover:text-indigo-600 shadow-md border border-white/80 flex items-center justify-center transition"
                title="ตั้งค่าเกม & เสียง"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTAINER CARD: White Rounded Card with Purple Ribbon Banner */}
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-2xl border-4 border-white/90 p-4 sm:p-7 space-y-6 relative overflow-hidden">
          
          {/* Top 3D Purple Ribbon Banner + Cute Robot Mascot */}
          <div className="relative flex items-center justify-center pt-1 pb-2">
            
            {/* 3D Purple Banner Ribbon */}
            <div className="relative inline-flex items-center justify-center">
              {/* Left Ribbon Fold Effect */}
              <div className="absolute -left-5 top-2 w-7 h-9 bg-purple-800 -skew-y-12 rounded-l-md -z-10 shadow-md" />
              {/* Right Ribbon Fold Effect */}
              <div className="absolute -right-5 top-2 w-7 h-9 bg-purple-800 skew-y-12 rounded-r-md -z-10 shadow-md" />
              
              {/* Center Ribbon Main Body */}
              <div className="px-10 sm:px-14 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 rounded-2xl text-white font-black text-xl sm:text-2xl shadow-xl shadow-purple-600/30 flex items-center gap-2 border-t border-purple-300">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <span className="tracking-wide drop-shadow-md">ภารกิจ</span>
                <span className="text-amber-300 text-lg">✦</span>
              </div>

              {/* Golden 3D Star on top-right of ribbon */}
              <div className="absolute -top-3.5 -right-3 sm:-right-4 w-9 h-9 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-2xl rotate-12 flex items-center justify-center text-white shadow-lg shadow-amber-400/50 border-2 border-white animate-bounce">
                <Star className="w-5 h-5 fill-white text-white" />
              </div>
            </div>

            {/* Top Right Floating Mascot: Cute Byte Bot with Speech Bubble */}
            <div className="absolute top-0 right-0 sm:right-2 flex items-center gap-2 z-20">
              {/* Speech Bubble */}
              <div className="hidden md:block bg-white border-2 border-indigo-200 px-3 py-1.5 rounded-2xl shadow-md text-xs font-black text-indigo-900 animate-pulse relative">
                <span>ทำภารกิจให้สำเร็จ รับรางวัลกันเถอะ!</span>
                {/* Bubble Tail pointing right */}
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-white" />
              </div>

              {/* Mascot Avatar */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 p-0.5 shadow-lg shadow-sky-500/30">
                <div className="w-full h-full bg-slate-900 rounded-[14px] overflow-hidden flex items-center justify-center">
                  <img 
                    src="/images/cute_robot_mascot_1788247457628.jpg" 
                    alt="สารวัตรไบต์" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: 🎯 ภารกิจหลัก | ⭐ ภารกิจพิเศษ */}
          <div className="flex items-center justify-center max-w-md mx-auto bg-indigo-50/80 p-1.5 rounded-2xl border border-indigo-100">
            <button
              onClick={() => { playClickSound(); setSubTab('main'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-black transition-all ${
                subTab === 'main'
                  ? 'bg-white text-indigo-950 shadow-md shadow-indigo-100 font-extrabold border border-indigo-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Target className="w-4 h-4 text-rose-500" />
              <span>ภารกิจหลัก</span>
            </button>

            <button
              onClick={() => { playClickSound(); setSubTab('special'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-black transition-all ${
                subTab === 'special'
                  ? 'bg-white text-indigo-950 shadow-md shadow-indigo-100 font-extrabold border border-indigo-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>ภารกิจพิเศษ</span>
            </button>
          </div>

          {/* SUB-TAB 1: 🎯 MAIN MISSIONS (Matches Image exactly) */}
          {subTab === 'main' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* SECTION 1: 📅 ภารกิจประจำวัน (Daily Quests) */}
              <div className="bg-slate-50/80 rounded-3xl p-4 sm:p-5 border border-slate-200/80 space-y-4">
                
                {/* Header: 📅 ภารกิจประจำวัน + Progress + Countdown */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 font-black text-slate-800 text-sm sm:text-base">
                      <span className="text-lg">📅</span>
                      <span>ภารกิจประจำวัน</span>
                    </div>
                    
                    {/* Progress Badge (ทำสำเร็จ 1/3) */}
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-200 text-xs font-bold text-slate-600">
                      <span>ทำสำเร็จ {dailyDoneCount}/3</span>
                      <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(dailyDoneCount / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Countdown Timer (รีเซ็ตในอีก 14 : 23 : 45) */}
                  <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <span>รีเซ็ตในอีก</span>
                    <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                      {padZero(timeLeft.hours)} : {padZero(timeLeft.minutes)} : {padZero(timeLeft.seconds)}
                    </span>
                  </div>
                </div>

                {/* 3 Daily Quest Items */}
                <div className="space-y-3">
                  {dailyQuestsData.map((quest) => {
                    const isClaimed = completedDaily.includes(quest.id);
                    const isReadyToClaim = !isClaimed && quest.progress >= quest.max;

                    return (
                      <div 
                        key={quest.id}
                        className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-300 transition-colors"
                      >
                        {/* Left: Icon & Info */}
                        <div className="flex items-center gap-3.5">
                          {/* 3D Circular Icon Background */}
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                            quest.icon === 'search' 
                              ? 'bg-gradient-to-tr from-sky-100 to-blue-200 text-blue-600'
                              : quest.icon === 'book'
                              ? 'bg-gradient-to-tr from-emerald-100 to-teal-200 text-emerald-600'
                              : 'bg-gradient-to-tr from-amber-100 to-orange-200 text-amber-600'
                          }`}>
                            {quest.icon === 'search' && <Search className="w-6 h-6 stroke-[2.5]" />}
                            {quest.icon === 'book' && <BookOpen className="w-6 h-6 stroke-[2.5]" />}
                            {quest.icon === 'quiz' && <ClipboardList className="w-6 h-6 stroke-[2.5]" />}
                          </div>

                          {/* Titles & Progress */}
                          <div>
                            <h4 className="font-black text-sm text-slate-800">
                              {quest.title}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                              {quest.desc}
                            </p>
                            
                            {/* Mini Progress Bar */}
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                                <div 
                                  className="bg-indigo-500 h-full rounded-full transition-all" 
                                  style={{ width: `${(Math.min(quest.progress, quest.max) / quest.max) * 100}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-slate-400 font-mono">
                                {Math.min(quest.progress, quest.max)}/{quest.max}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Reward Pill & Action Button */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {/* Reward Box */}
                          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-center">
                            <span className="block text-[10px] text-slate-400 font-bold leading-none mb-0.5">รางวัล</span>
                            <div className="flex items-center gap-2 text-xs font-black">
                              <span className="flex items-center gap-1 text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {quest.stars}
                              </span>
                              <span className="flex items-center gap-0.5 text-amber-600">
                                <span className="text-[11px]">฿</span>
                                {quest.coins}
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          {isClaimed ? (
                            <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 font-black text-xs border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>สำเร็จแล้ว</span>
                            </div>
                          ) : isReadyToClaim ? (
                            <button
                              onClick={() => handleClaimDaily(quest.id, quest.stars, quest.coins)}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-400/40 hover:scale-105 active:scale-95 transition-transform animate-bounce flex items-center gap-1"
                            >
                              <Gift className="w-4 h-4" />
                              <span>รับรางวัล</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                playClickSound();
                                onNavigateTab(quest.targetTab);
                              }}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs shadow-md shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 hover:scale-105 active:scale-95 transition-all"
                            >
                              <span>ไปทำภารกิจ</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: 🚩 ภารกิจหลัก (เส้นทางนักค้นหา) (Story Stages) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-500 text-lg">🚩</span>
                    <h3 className="font-black text-slate-800 text-sm sm:text-base">
                      ภารกิจหลัก (เส้นทางนักค้นหา)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    ผ่านภารกิจเพื่อปลดล็อกด่านถัดไป
                  </span>
                </div>

                {/* Stage Quest Cards */}
                <div className="space-y-3">
                  {mainStagesData.map((stage) => {
                    return (
                      <div 
                        key={stage.num}
                        className={`bg-white rounded-2xl p-3.5 sm:p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          stage.isCompleted
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : stage.isUnlocked
                            ? 'border-indigo-200 shadow-sm hover:border-indigo-400'
                            : 'border-slate-200 opacity-75 bg-slate-50/50'
                        }`}
                      >
                        {/* Left: Stage Number Badge + Info */}
                        <div className="flex items-center gap-3.5">
                          {/* Number Badge Circle */}
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-sm shrink-0 ${stage.color}`}>
                            {stage.num}
                          </div>

                          {/* Stage Details */}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-sm text-slate-800">
                                {stage.title}
                              </h4>
                              {stage.isCompleted && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>ผ่านแล้ว</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              {stage.desc}
                            </p>
                          </div>
                        </div>

                        {/* Right: Reward Box & Action / Lock Status */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          
                          {/* Reward Box (⭐ Stars, 🪙 Coins, 💎 Gems) */}
                          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-center">
                            <span className="block text-[10px] text-slate-400 font-bold leading-none mb-0.5">รางวัล</span>
                            <div className="flex items-center gap-2 text-xs font-black">
                              <span className="flex items-center gap-1 text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {stage.stars}
                              </span>
                              <span className="flex items-center gap-0.5 text-amber-600">
                                <span className="text-[11px]">฿</span>
                                {stage.coins}
                              </span>
                              <span className="flex items-center gap-0.5 text-purple-600">
                                <Gem className="w-3 h-3" />
                                {stage.gems}
                              </span>
                            </div>
                          </div>

                          {/* Action Button or Locked Pill */}
                          {stage.isUnlocked ? (
                            <div className="flex flex-col items-center gap-1">
                              <button
                                onClick={() => {
                                  playClickSound();
                                  onNavigateTab(stage.tab);
                                }}
                                className={`px-5 py-2 rounded-xl text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1 ${
                                  stage.num === '👑'
                                    ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-500/30 hover:scale-105 animate-pulse'
                                    : stage.isCompleted
                                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 hover:scale-105'
                                }`}
                              >
                                {stage.num === '👑' ? (
                                  <>
                                    <Swords className="w-4 h-4" />
                                    <span>ท้าประลองบอส</span>
                                  </>
                                ) : stage.isCompleted ? (
                                  <>
                                    <span>เล่นทบทวน</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </>
                                ) : (
                                  <>
                                    <span>เริ่มภารกิจ</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </>
                                )}
                              </button>
                              
                              {/* Stage Progress Bar (e.g. 2/3) */}
                              <span className="text-[10px] text-slate-400 font-bold">
                                {stage.progressText}
                              </span>
                            </div>
                          ) : (
                            <div className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs border border-slate-200 flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>ต้องผ่านด่านก่อนหน้า</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* SUB-TAB 2: ⭐ SPECIAL MISSIONS (ภารกิจพิเศษ) */}
          {subTab === 'special' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 p-4 rounded-3xl border border-amber-300/40 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-800 text-base flex items-center gap-1.5">
                    <span>🌟 ภารกิจพิเศษ & ถ้วยรางวัลเกียรติยศ</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    พิชิตเป้าหมายพิเศษเพื่อรับเพชร (💎) และเหรียญทองจำนวนมหาศาล!
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500">ผ่านแล้ว</span>
                  <span className="block text-base font-black text-indigo-600 font-mono">
                    {completedSpecial.length}/{specialMissionsData.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {specialMissionsData.map((spec) => {
                  const isClaimed = completedSpecial.includes(spec.id);
                  const isReady = !isClaimed && spec.progress >= spec.max;

                  return (
                    <div 
                      key={spec.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-100 to-yellow-200 text-amber-600 flex items-center justify-center shrink-0">
                          {spec.icon === 'calendar' && <span className="text-xl">📅</span>}
                          {spec.icon === 'swords' && <Swords className="w-6 h-6 text-red-500" />}
                          {spec.icon === 'award' && <Award className="w-6 h-6 text-amber-500" />}
                          {spec.icon === 'shield' && <ShieldCheck className="w-6 h-6 text-emerald-500" />}
                          {spec.icon === 'gift' && <Gift className="w-6 h-6 text-purple-500" />}
                        </div>

                        <div>
                          <h4 className="font-black text-sm text-slate-800">
                            {spec.title}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {spec.desc}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                              <div 
                                className="bg-amber-500 h-full rounded-full transition-all" 
                                style={{ width: `${(Math.min(spec.progress, spec.max) / spec.max) * 100}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 font-mono">
                              {Math.min(spec.progress, spec.max)}/{spec.max}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Rewards */}
                        <div className="bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-200 text-center">
                          <span className="block text-[10px] text-amber-700 font-bold leading-none mb-0.5">รางวัลพิเศษ</span>
                          <div className="flex items-center gap-2 text-xs font-black">
                            <span className="flex items-center gap-0.5 text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              {spec.stars}
                            </span>
                            <span className="flex items-center gap-0.5 text-amber-600">
                              <span className="text-[11px]">฿</span>
                              {spec.coins}
                            </span>
                            <span className="flex items-center gap-0.5 text-purple-600">
                              <Gem className="w-3 h-3" />
                              {spec.gems}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        {isClaimed ? (
                          <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 font-black text-xs border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>รับแล้ว</span>
                          </div>
                        ) : isReady ? (
                          <button
                            onClick={() => handleClaimSpecial(spec.id, spec.stars, spec.coins, spec.gems)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-400/40 hover:scale-105 active:scale-95 transition-transform animate-bounce flex items-center gap-1"
                          >
                            <Gift className="w-4 h-4" />
                            <span>รับรางวัล</span>
                          </button>
                        ) : (
                          <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs">
                            <span>ยังไม่ผ่าน</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* NOTIFICATION MODAL */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-2 border-indigo-100 text-slate-800 space-y-4">
            <button
              onClick={() => { playClickSound(); setIsNotificationOpen(false); }}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-black text-lg">ประกาศ & แจ้งเตือน</h3>
            </div>
            
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100">
                <span className="font-black text-indigo-900 block mb-0.5">🌟 ศึกบอสใหญ่เปิดแล้ว!</span>
                <p className="text-slate-600">จอมวายร้ายดาร์กบักปรากฏตัวขึ้นแล้ว ท้าดวลและรับเหรียญรางวัลพิเศษ 300 เหรียญและเพชร 50 ชิ้น!</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-100">
                <span className="font-black text-amber-900 block mb-0.5">🎁 ภารกิจประจำวันรีเซ็ตทุกเที่ยงคืน</span>
                <p className="text-slate-600">อย่าลืมเข้ามาทำภารกิจสืบค้นข้อมูลและสะสมดาวทุกวันนะ</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-2 border-indigo-100 text-slate-800 space-y-4">
            <button
              onClick={() => { playClickSound(); setIsSettingsOpen(false); }}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="font-black text-lg">ตั้งค่าระบบ</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-700">เสียงเอฟเฟกต์ (SFX)</span>
                </div>
                <button
                  onClick={() => {
                    playClickSound();
                    onUpdateProfile({ soundEnabled: !profile.soundEnabled });
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black ${
                    profile.soundEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {profile.soundEnabled ? 'เปิดอยู่' : 'ปิด'}
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">บทเรียนวิทยาการคำนวณ ป.5</span>
                <p className="text-slate-500">หน่วยการเรียนรู้ที่ 3: การค้นหาข้อมูลและประเมินความน่าเชื่อถือ</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
