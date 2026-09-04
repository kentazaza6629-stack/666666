import React, { useState } from 'react';
import { DetectiveProfile, TabType } from '../types';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  FolderLock, 
  Terminal, 
  GraduationCap, 
  Award, 
  Trophy, 
  Briefcase, 
  BookOpen, 
  Calendar, 
  Gift, 
  Star, 
  Coins, 
  Flame, 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  Bell, 
  Settings, 
  Edit3, 
  Play,
  ShoppingBag,
  Users,
  Compass,
  FileText,
  MapPin,
  Check,
  ArrowRight,
  Swords,
  Heart,
  X,
  Volume2,
  Music,
  User
} from 'lucide-react';
import { 
  playClickSound, 
  playCorrectSound, 
  playWrongSound,
  playCoinSound, 
  playClueFoundSound,
  playBadgeUnlockSound,
  playChestOpenSound,
  isBgmPlaying,
  toggleBgm 
} from '../utils/sound';
import { isStageUnlocked } from '../utils/stageUnlock';
import { DailyQuestsModal } from './DailyQuestsModal';
import { DailyCheckInModal } from './DailyCheckInModal';
import { LeaderboardModal } from './LeaderboardModal';
import { BackpackModal } from './BackpackModal';
import { DetectiveNotebookModal } from './DetectiveNotebookModal';
import { InspectorByteChatModal } from './InspectorByteChatModal';
import { StageMissionModal, StageInfo } from './StageMissionModal';

interface AdventureJourneyMapProps {
  profile: DetectiveProfile;
  onSelectTab: (tab: TabType) => void;
  onOpenProfile: () => void;
  onEarnExp: (amount: number, reason: string) => void;
  onEarnCoins: (amount: number, reason: string) => void;
  onEarnStars?: (amount: number) => void;
  onEarnGems?: (amount: number) => void;
  onUpdateProfile?: (updated: Partial<DetectiveProfile>) => void;
  onOpenLuckyChest?: () => void;
  onOpenAuthModal?: () => void;
}

export const AdventureJourneyMap: React.FC<AdventureJourneyMapProps> = ({
  profile,
  onSelectTab,
  onOpenProfile,
  onEarnExp,
  onEarnCoins,
  onEarnStars,
  onEarnGems,
  onUpdateProfile,
  onOpenLuckyChest,
  onOpenAuthModal,
}) => {
  // Modals state
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isBackpackOpen, setIsBackpackOpen] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<StageInfo | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Completed items calculations
  const completedCasesCount = profile.completedCases?.length || 0;
  const badgesUnlockedCount = profile.badges?.filter(b => b.unlocked)?.length || 0;

  // Stages Definition (Matching the 6 steps on the map)
  const stages: StageInfo[] = [
    {
      stepNumber: 1,
      tab: 'zone1_basics',
      title: 'ทำความรู้จักการสืบค้นข้อมูล',
      subtitle: 'ความสำคัญของการค้นหา & คำสำคัญ (Keyword)',
      description: 'เรียนรู้ว่า Search Engine คืออะไร วิธีระบุคำสำคัญที่กระชับ ตรงประเด็น และไม่พิมพ์ประโยคยาวเหมือนคำพูด',
      objectives: [
        'เข้าใจหลักการทำงานของ Search Engine',
        'ฝึกเลือกคำสำคัญ (Keyword) ที่ถูกต้องและแม่นยำ',
        'ผ่านแบบทดสอบย่อย 4 ข้อประจำด่าน',
      ],
      starsEarned: profile.level >= 1 ? 3 : 0,
      maxStars: 3,
      starReward: 30,
      coinReward: 80,
      gemReward: 5,
      badgeRewardTitle: 'ตราเซียนคีย์เวิร์ด',
      themeColor: 'from-emerald-400 to-teal-500',
      accentColor: 'emerald',
      icon: Search,
    },
    {
      stepNumber: 2,
      tab: 'zone2_spells',
      title: 'คาถาสืบค้นลับ & ตัวดำเนินการ',
      subtitle: 'เครื่องหมาย "", -, site: และ filetype:',
      description: 'ฝึกใช้เครื่องหมายอัญประกาศ " ", เครื่องหมายลบ -, site: และ filetype:pdf เพื่อเจาะจงผลลัพธ์ให้แม่นยำ 100%',
      objectives: [
        'ใช้เครื่องหมาย " " เพื่อค้นหาคำเฉพาะที่ติดกัน',
        'ใช้เครื่องหมาย - เพื่อตัดคำที่ไม่เกี่ยวข้องออก',
        'ใช้ site: และ filetype: เพื่อกรองเอกสารและหน่วยงาน',
      ],
      starsEarned: profile.level >= 2 ? 3 : 0,
      maxStars: 3,
      starReward: 35,
      coinReward: 100,
      gemReward: 5,
      badgeRewardTitle: 'ตราจอมเวทย์คาถาสืบค้น',
      themeColor: 'from-cyan-400 to-blue-500',
      accentColor: 'cyan',
      icon: Sparkles,
    },
    {
      stepNumber: 3,
      tab: 'zone3_trust',
      title: 'ประเมินความน่าเชื่อถือของข้อมูล',
      subtitle: 'แล็บจับผิด Fake News & นามสกุลโดเมน',
      description: 'เรียนรู้ว่าข้อมูลดีๆ อยู่ที่ไหนบนโลกออนไลน์ รู้จักเว็บไซต์ทางการ .go.th, .ac.th และใช้หลัก 5W1H ประเมินความน่าเชื่อถือ',
      objectives: [
        'จำแนกประเภทเว็บไซต์และแหล่งข้อมูลที่เชื่อถือได้ (.go.th, .ac.th)',
        'ใช้หลัก 5W1H (Who, What, When, Where, Why) ตรวจสอบข้อมูล',
        'จับผิดเว็บไซต์ปลอมและข่าวลือในแล็บจำลอง',
      ],
      starsEarned: profile.level >= 3 ? 3 : 0,
      maxStars: 3,
      starReward: 40,
      coinReward: 120,
      gemReward: 10,
      badgeRewardTitle: 'ตราผู้พิทักษ์ความจริง',
      themeColor: 'from-blue-500 to-indigo-600',
      accentColor: 'blue',
      icon: ShieldCheck,
    },
    {
      stepNumber: 4,
      tab: 'zone4_cases',
      title: 'ลานประลองแฟ้มคดีปริศนา',
      subtitle: 'สวมบทนักสืบดิจิทัล คลี่คลาย 4 คดีเสมือนจริง',
      description: 'นำวิชาสืบค้นไปประยุกต์ไข 4 คดีจริง: สัตว์ป่าสงวน, ภาวะโลกร้อน, สุริยุปราคา และประวัติศาสตร์อยุธยา',
      objectives: [
        'คลี่คลายแฟ้มคดีปริศนาทั้ง 4 คดีให้สมบูรณ์',
        'รวบรวมหลักฐานและแยกแยะข้อเท็จจริง',
        'สะสม EXP และเหรียญตรานักสืบ',
      ],
      starsEarned: completedCasesCount >= 2 ? 3 : completedCasesCount === 1 ? 2 : 0,
      maxStars: 3,
      starReward: 45,
      coinReward: 150,
      gemReward: 10,
      badgeRewardTitle: 'ตรายอดนักสืบระดับพระกาฬ',
      themeColor: 'from-purple-500 to-pink-500',
      accentColor: 'purple',
      icon: FolderLock,
    },
    {
      stepNumber: 5,
      tab: 'zone5_sandbox',
      title: 'จำลองสืบค้น & ผู้ช่วยสารวัตร AI',
      subtitle: 'ทดลองค้นหาในระบบ Sandbox เสมือนจริง',
      description: 'ทดลองค้นหาในระบบ Sandbox เสมือนจริง พร้อมขอคำแนะนำจาก AI สารวัตรไบต์ช่วยกรองคำค้นหา',
      objectives: [
        'ทดลองค้นหาคำในระบบ Sandbox',
        'ใช้คำสั่งขั้นสูงและเรียนรู้กับผู้ช่วย AI',
        'เก็บเกี่ยวประสบการณ์ก่อนสอบด่านสุดท้าย',
      ],
      starsEarned: profile.level >= 5 ? 3 : 0,
      maxStars: 3,
      starReward: 50,
      coinReward: 200,
      gemReward: 15,
      badgeRewardTitle: 'ตราปรมาจารย์สืบค้น',
      themeColor: 'from-rose-400 to-pink-600',
      accentColor: 'rose',
      icon: Terminal,
    },
    {
      stepNumber: 6,
      tab: 'zone6_exam',
      title: 'ภารกิจสุดท้าย นักสืบค้นข้อมูลมือโปร',
      subtitle: 'สอบวัดระดับยอดนักสืบ & รับเกียรติบัตร',
      description: 'แบบทดสอบประมวลความรู้ 10 ข้อ พิสูจน์ความเป็นยอดนักสืบสารสนเทศระดับชั้น ป.5 และพิมพ์เกียรติบัตรทางการ',
      objectives: [
        'ทำแบบทดสอบวัดระดับ 10 ข้อ ให้ได้ 80% ขึ้นไป',
        'รับเหรียญทองสารวัตรข้อมูล ป.5',
        'ปลดล็อกและดาวน์โหลดใบประกาศนียบัตรยอดนักสืบ',
      ],
      starsEarned: profile.quizScore >= 8 ? 3 : profile.quizScore >= 5 ? 2 : 0,
      maxStars: 3,
      starReward: 60,
      coinReward: 300,
      gemReward: 20,
      badgeRewardTitle: 'เหรียญทองสารวัตรข้อมูล ป.5',
      themeColor: 'from-amber-400 via-orange-500 to-yellow-500',
      accentColor: 'amber',
      icon: GraduationCap,
    },
  ];

  const handleClaimQuest = (questId: string, starReward: number, coinReward: number) => {
    playBadgeUnlockSound();
    if (onUpdateProfile) {
      onUpdateProfile(prev => ({
        ...prev,
        completedDailyQuests: [...(prev.completedDailyQuests || []), questId],
        stars: (prev.stars ?? 0) + starReward,
        coins: (prev.coins ?? 0) + coinReward,
      }));
    }
    onEarnExp(50, 'สำเร็จภารกิจประจำวัน');
  };

  const handleCheckIn = (day: number, coins: number, gems: number) => {
    playBadgeUnlockSound();
    if (onUpdateProfile) {
      onUpdateProfile(prev => ({
        ...prev,
        dailyCheckInDays: day,
        hasCheckedInToday: true,
        coins: (prev.coins ?? 0) + coins,
        gems: (prev.gems ?? 0) + gems,
      }));
    }
    setIsCheckInOpen(false);
  };

  return (
    <div className="relative min-h-screen pb-24 overflow-x-hidden font-sans select-none bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-100">
      
      {/* Top Mobile/Desktop Floating Status Bar */}
      <div className="sticky top-0 z-30 px-3 sm:px-6 py-2.5 bg-white/90 backdrop-blur-md border-b border-sky-200/80 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Profile Card Pill */}
          <div 
            onClick={() => { playClickSound(); onOpenProfile(); }}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-200/90 shadow-sm cursor-pointer transition-all hover:scale-[1.02]"
          >
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-amber-200 to-rose-200 p-0.5 shadow-sm shrink-0 overflow-hidden">
              <img
                src="/images/cute_girl_avatar_1788247477569.jpg"
                alt="Detective Avatar"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 font-medium leading-none">สวัสดีค่ะ</span>
                <Edit3 className="w-3 h-3 text-slate-400" />
              </div>
              <span className="text-xs sm:text-sm font-black text-slate-800 leading-tight block truncate max-w-[90px] sm:max-w-[120px]">
                {profile.name || 'น้องมินนี่'}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-md">
                  Level {profile.level || 5}
                </span>
                <div className="w-10 sm:w-14 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round(((profile.exp || 65) / (profile.maxExp || 100)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Currencies Pill Group */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Stars */}
            <div 
              onClick={() => { playClickSound(); onSelectTab('missions'); }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-xs cursor-pointer hover:scale-105 transition-transform"
              title="ดูหน้าภารกิจ & รางวัล"
            >
              <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-xs">
                <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
              </div>
              <div className="text-left">
                <span className="text-xs sm:text-sm font-black text-amber-700 leading-none block">
                  {profile.stars ?? 250}
                </span>
                <span className="text-[9px] text-amber-600 font-medium block leading-none">ดาว</span>
              </div>
            </div>

            {/* Coins */}
            <div 
              onClick={() => { playClickSound(); onSelectTab('reward_shop'); }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-2xl bg-yellow-50 border border-yellow-200/80 shadow-xs cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="w-5 h-5 rounded-full bg-yellow-400 text-slate-900 flex items-center justify-center font-bold text-[11px] shadow-xs">
                ฿
              </div>
              <div className="text-left">
                <span className="text-xs sm:text-sm font-black text-yellow-800 leading-none block">
                  {(profile.coins ?? 0).toLocaleString()}
                </span>
                <span className="text-[9px] text-yellow-600 font-medium block leading-none">เหรียญ</span>
              </div>
            </div>

            {/* Diamonds/Gems */}
            <div 
              onClick={() => { playClickSound(); setIsCheckInOpen(true); }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-2xl bg-purple-50 border border-purple-200/80 shadow-xs cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xs text-[10px]">
                💎
              </div>
              <div className="text-left">
                <span className="text-xs sm:text-sm font-black text-purple-800 leading-none block">
                  {profile.gems ?? 45}
                </span>
                <span className="text-[9px] text-purple-600 font-medium block leading-none">เพชร</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Auth, Bell & Settings */}
          <div className="flex items-center gap-1 sm:gap-2">
            {onOpenAuthModal && (
              <button
                onClick={() => {
                  playClickSound();
                  onOpenAuthModal();
                }}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                title={profile.authUser ? `เข้าสู่ระบบด้วย ${profile.authUser.name}` : 'เข้าสู่ระบบ'}
              >
                <span className="text-sm">🔑</span>
                <span className="hidden sm:inline text-xs font-bold text-slate-700">
                  {profile.authUser ? (profile.authUser.role === 'teacher' ? 'ครูผู้สอน' : 'บัญชี') : 'ล็อกอิน'}
                </span>
              </button>
            )}

            {/* Teacher Dashboard Button - ONLY visible to Teachers */}
            {profile.authUser?.role === 'teacher' && (
              <button
                onClick={() => {
                  playClickSound();
                  onSelectTab('teacher_portal');
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 border border-emerald-400/40"
                title="ระบบจัดการการสอนสำหรับครู"
              >
                <GraduationCap className="w-4 h-4 text-emerald-100" />
                <span className="hidden sm:inline">ระบบคุณครู</span>
              </button>
            )}

            <button
              onClick={() => {
                playClickSound();
                setIsNotificationOpen(!isNotificationOpen);
              }}
              className="relative p-2 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
              title="การแจ้งเตือน"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            <button
              onClick={() => { playClickSound(); setIsSettingsOpen(true); }}
              className="p-2 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
              title="ตั้งค่าระบบ"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Adventure Map Container */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 relative">
        
        {/* Title Header */}
        <div className="text-center sm:text-left mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-sky-950 tracking-tight flex items-center gap-2 drop-shadow-xs">
              <span>เส้นทางนักค้นหา</span>
              <span className="text-2xl">🚩</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-sky-800 font-bold mt-0.5">
            เรียนรู้ไปทีละขั้น กลายเป็นนักสืบค้นข้อมูลมือโปร!
          </p>
        </div>

        {/* Map Canvas Frame */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 bg-cover bg-center min-h-[920px] sm:min-h-[1050px]"
             style={{
               backgroundImage: `url('/images/adventure_map_bg_1788247432855.jpg')`,
               backgroundSize: 'cover',
               backgroundPosition: 'center',
             }}
        >
          {/* Subtle Sun Flare & Ambient Lighting Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400/10 via-transparent to-emerald-950/20 pointer-events-none" />

            {/* Left Floating Badges: Daily Quest & Check-in */}
            <div className="absolute top-4 left-3 sm:left-4 z-20 space-y-2.5 max-w-[150px] sm:max-w-[200px]">
              {/* Daily Quest Widget */}
              <div
                onClick={() => { playClickSound(); onSelectTab('missions'); }}
                className="p-2.5 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-sky-200/90 shadow-lg shadow-sky-950/10 cursor-pointer hover:scale-105 transition-all text-left group"
                title="ดูหน้าภารกิจทั้งหมด"
              >
                <div className="flex items-center gap-1.5 mb-1 text-slate-800">
                  <span className="text-sm">📅</span>
                  <span className="text-xs font-black text-slate-800">ภารกิจประจำวัน</span>
                </div>
                <span className="text-[10px] text-slate-600 block leading-tight font-medium">
                  สืบค้นข้อมูล 1 ครั้ง
                </span>
                {/* Progress */}
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 mt-1 mb-0.5">
                  <div className="w-16 sm:w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full w-full" />
                  </div>
                  <span>1/1</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 mt-1">
                  <span className="text-slate-500">รางวัล:</span>
                  <span className="text-amber-600 flex items-center gap-0.5">⭐ 20</span>
                  <span className="text-yellow-600 flex items-center gap-0.5">฿ 50</span>
                </div>
              </div>

              {/* Daily Check-in Widget */}
              <div
                onClick={() => { playClickSound(); setIsCheckInOpen(true); }}
                className="p-2.5 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-amber-200/90 shadow-lg shadow-amber-950/10 cursor-pointer hover:scale-105 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <span className="text-sm">🎁</span>
                    <span className="text-xs font-black text-slate-800">เช็คอินวันนี้</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-black text-[9px] flex items-center justify-center">
                    2/3
                  </span>
                </div>
                <span className="text-[10px] text-slate-600 block font-medium">
                  เช็คอินต่อเนื่อง 3 วัน
                </span>
                <span className="text-[10px] font-bold text-amber-600 block mt-0.5">
                  รับ 100 เหรียญ!
                </span>
              </div>
            </div>

            {/* Right Floating Quick Action Buttons: Leaderboard, Backpack, Notebook */}
            <div className="absolute top-4 right-3 sm:right-4 z-20 flex flex-col gap-2.5">
              {/* Leaderboard Button */}
              <button
                onClick={() => { playClickSound(); setIsLeaderboardOpen(true); }}
                className="w-11 sm:w-14 h-11 sm:h-14 rounded-2xl bg-white/95 hover:bg-amber-50 backdrop-blur-md border-2 border-amber-200/90 shadow-lg shadow-amber-950/10 flex flex-col items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all text-slate-800 group"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black text-slate-700 mt-0.5">อันดับ</span>
              </button>

              {/* Backpack Button */}
              <button
                onClick={() => { playClickSound(); setIsBackpackOpen(true); }}
                className="w-11 sm:w-14 h-11 sm:h-14 rounded-2xl bg-white/95 hover:bg-orange-50 backdrop-blur-md border-2 border-orange-200/90 shadow-lg shadow-orange-950/10 flex flex-col items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all text-slate-800 group"
              >
                <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black text-slate-700 mt-0.5">กระเป๋า</span>
              </button>

              {/* Notebook Button */}
              <button
                onClick={() => { playClickSound(); setIsNotebookOpen(true); }}
                className="w-11 sm:w-14 h-11 sm:h-14 rounded-2xl bg-white/95 hover:bg-indigo-50 backdrop-blur-md border-2 border-indigo-200/90 shadow-lg shadow-indigo-950/10 flex flex-col items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all text-slate-800 group"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black text-slate-700 mt-0.5">บันทึก</span>
              </button>
            </div>

          {/* Goal Flag on Castle (Top Right) */}
          <div className="absolute top-[10%] right-[10%] sm:right-[15%] z-10 flex flex-col items-center animate-bounce duration-1000">
            <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs shadow-lg shadow-orange-500/30 flex items-center gap-1 border-2 border-white">
              <span>เป้าหมาย</span>
            </div>
            <div className="w-1 h-4 bg-amber-700 rounded-full" />
          </div>

          {/* Starter Cottage Tag (Bottom Left) -> Click to start Stage 1 */}
          <div className="absolute bottom-[3%] left-[5%] sm:left-[8%] z-20">
            <button
              onClick={() => {
                playClickSound();
                onSelectTab('zone1_basics');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              id="btn-start-cottage-stage1"
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/40 border-2 border-white flex items-center gap-1.5 hover:scale-110 active:scale-95 transition-all cursor-pointer animate-bounce"
            >
              <span>🏡 เริ่มต้น (ด่าน 1)</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* ======================================================== */}
          {/* THE 6 STAGE NODES ALONG THE WINDING PATH */}
          {/* ======================================================== */}

          {/* STEP 1: Bottom Left-Center */}
          {(() => {
            const isUnlocked = isStageUnlocked(stages[0].tab, profile);
            return (
              <div className="absolute bottom-[13%] left-[30%] sm:left-[32%] z-20 -translate-x-1/2">
                <div
                  onClick={() => {
                    if (isUnlocked) {
                      playClickSound();
                    } else {
                      playWrongSound();
                    }
                    setSelectedStage(stages[0]);
                  }}
                  className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl backdrop-blur-md border-2 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all text-left max-w-[210px] sm:max-w-[240px] group ${
                    isUnlocked 
                      ? 'bg-white/95 hover:bg-emerald-50 border-emerald-300 shadow-emerald-950/20' 
                      : 'bg-slate-900/90 border-slate-700 opacity-75 shadow-slate-950/40'
                  }`}
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl text-white flex items-center justify-center font-black text-lg shadow-md shrink-0 group-hover:scale-110 transition-transform ${
                    isUnlocked ? 'bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-emerald-500/30' : 'bg-slate-700 shadow-slate-900/50'
                  }`}>
                    {isUnlocked ? '1' : <Lock className="w-4 h-4 text-slate-300" />}
                  </div>
                  <div className="overflow-hidden">
                    <span className={`text-xs font-black block leading-tight truncate ${isUnlocked ? 'text-slate-800' : 'text-slate-300'}`}>
                      ทำความรู้จัก
                    </span>
                    <span className={`text-[10px] block leading-tight truncate ${isUnlocked ? 'text-slate-500' : 'text-slate-400'}`}>
                      การสืบค้นข้อมูล
                    </span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${isUnlocked ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* STEP 2: Middle-Low Right-Center */}
          {(() => {
            const isUnlocked = isStageUnlocked(stages[1].tab, profile);
            return (
              <div className="absolute bottom-[28%] right-[22%] sm:right-[26%] z-20 translate-x-1/2">
                <div
                  onClick={() => {
                    if (isUnlocked) {
                      playClickSound();
                    } else {
                      playWrongSound();
                    }
                    setSelectedStage(stages[1]);
                  }}
                  className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl backdrop-blur-md border-2 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all text-left max-w-[210px] sm:max-w-[240px] group ${
                    isUnlocked 
                      ? 'bg-white/95 hover:bg-cyan-50 border-cyan-300 shadow-cyan-950/20' 
                      : 'bg-slate-900/90 border-slate-700 opacity-75 shadow-slate-950/40'
                  }`}
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl text-white flex items-center justify-center font-black text-lg shadow-md shrink-0 group-hover:scale-110 transition-transform ${
                    isUnlocked ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-cyan-500/30' : 'bg-slate-700 shadow-slate-900/50'
                  }`}>
                    {isUnlocked ? '2' : <Lock className="w-4 h-4 text-slate-300" />}
                  </div>
                  <div className="overflow-hidden">
                    <span className={`text-xs font-black block leading-tight truncate ${isUnlocked ? 'text-slate-800' : 'text-slate-300'}`}>
                      แหล่งข้อมูล
                    </span>
                    <span className={`text-[10px] block leading-tight truncate ${isUnlocked ? 'text-slate-500' : 'text-slate-400'}`}>
                      ในอินเทอร์เน็ต
                    </span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${isUnlocked ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ml-auto ${
                    isUnlocked ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isUnlocked ? <Globe className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* STEP 3: Middle Center-Right */}
          {(() => {
            const isUnlocked = isStageUnlocked(stages[2].tab, profile);
            return (
              <div className="absolute bottom-[44%] right-[20%] sm:right-[24%] z-20 translate-x-1/2">
                <div
                  onClick={() => {
                    if (isUnlocked) {
                      playClickSound();
                    } else {
                      playWrongSound();
                    }
                    setSelectedStage(stages[2]);
                  }}
                  className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl backdrop-blur-md border-2 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all text-left max-w-[210px] sm:max-w-[250px] group ${
                    isUnlocked 
                      ? 'bg-white/95 hover:bg-blue-50 border-blue-300 shadow-blue-950/20' 
                      : 'bg-slate-900/90 border-slate-700 opacity-75 shadow-slate-950/40'
                  }`}
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl text-white flex items-center justify-center font-black text-lg shadow-md shrink-0 group-hover:scale-110 transition-transform ${
                    isUnlocked ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-blue-500/30' : 'bg-slate-700 shadow-slate-900/50'
                  }`}>
                    {isUnlocked ? '3' : <Lock className="w-4 h-4 text-slate-300" />}
                  </div>
                  <div className="overflow-hidden">
                    <span className={`text-xs font-black block leading-tight truncate ${isUnlocked ? 'text-slate-800' : 'text-slate-300'}`}>
                      เทคนิคการค้นหา
                    </span>
                    <span className={`text-[10px] block leading-tight truncate ${isUnlocked ? 'text-slate-500' : 'text-slate-400'}`}>
                      ให้ได้ผลลัพธ์ที่ตรงใจ
                    </span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Star className={`w-3 h-3 ${isUnlocked ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-600'}`} />
                      <Star className={`w-3 h-3 ${isUnlocked ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-600'}`} />
                      <Star className="w-3 h-3 fill-slate-200 text-slate-300" />
                    </div>
                  </div>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ml-auto ${
                    isUnlocked ? 'bg-blue-100 text-blue-700' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isUnlocked ? <Search className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* STEP 4: Center-Left */}
          {(() => {
            const isUnlocked = isStageUnlocked(stages[3].tab, profile);
            return (
              <div className="absolute bottom-[58%] left-[28%] sm:left-[30%] z-20 -translate-x-1/2">
                <div
                  onClick={() => {
                    if (isUnlocked) {
                      playClickSound();
                    } else {
                      playWrongSound();
                    }
                    setSelectedStage(stages[3]);
                  }}
                  className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl backdrop-blur-md border-2 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all text-left max-w-[210px] sm:max-w-[240px] group ${
                    isUnlocked 
                      ? 'bg-white/95 hover:bg-purple-50 border-purple-300 shadow-purple-950/20' 
                      : 'bg-slate-900/90 border-slate-700 opacity-75 shadow-slate-950/40'
                  }`}
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl text-white flex items-center justify-center font-black text-lg shadow-md shrink-0 group-hover:scale-110 transition-transform ${
                    isUnlocked ? 'bg-gradient-to-tr from-purple-500 to-pink-500 shadow-purple-500/30' : 'bg-slate-700 shadow-slate-900/50'
                  }`}>
                    {isUnlocked ? '4' : <Lock className="w-4 h-4 text-slate-300" />}
                  </div>
                  <div className="overflow-hidden">
                    <span className={`text-xs font-black block leading-tight truncate ${isUnlocked ? 'text-slate-800' : 'text-slate-300'}`}>
                      ประเมินความน่าเชื่อถือ
                    </span>
                    <span className={`text-[10px] block leading-tight truncate ${isUnlocked ? 'text-slate-500' : 'text-slate-400'}`}>
                      ของข้อมูล
                    </span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Star className={`w-3 h-3 ${isUnlocked ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-600'}`} />
                      <Star className={`w-3 h-3 ${isUnlocked ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-600'}`} />
                      <Star className="w-3 h-3 fill-slate-200 text-slate-300" />
                    </div>
                  </div>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ml-auto ${
                    isUnlocked ? 'bg-purple-100 text-purple-700' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isUnlocked ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* STEP 5: Upper Center-Right */}
          {(() => {
            const isUnlocked = isStageUnlocked(stages[4].tab, profile);
            return (
              <div className="absolute top-[28%] right-[24%] sm:right-[28%] z-20 translate-x-1/2">
                <div
                  onClick={() => {
                    if (isUnlocked) {
                      playClickSound();
                    } else {
                      playWrongSound();
                    }
                    setSelectedStage(stages[4]);
                  }}
                  className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl backdrop-blur-md border-2 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all text-left max-w-[210px] sm:max-w-[240px] group ${
                    isUnlocked 
                      ? 'bg-white/95 hover:bg-pink-50 border-pink-300 shadow-pink-950/20' 
                      : 'bg-slate-900/90 border-slate-700 opacity-75 shadow-slate-950/40'
                  }`}
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl text-white flex items-center justify-center font-black text-lg shadow-md shrink-0 group-hover:scale-110 transition-transform ${
                    isUnlocked ? 'bg-gradient-to-tr from-pink-500 to-rose-500 shadow-pink-500/30' : 'bg-slate-700 shadow-slate-900/50'
                  }`}>
                    {isUnlocked ? '5' : <Lock className="w-4 h-4 text-slate-300" />}
                  </div>
                  <div className="overflow-hidden">
                    <span className={`text-xs font-black block leading-tight truncate ${isUnlocked ? 'text-slate-800' : 'text-slate-300'}`}>
                      สรุปและจัดการ
                    </span>
                    <span className={`text-[10px] block leading-tight truncate ${isUnlocked ? 'text-slate-500' : 'text-slate-400'}`}>
                      ข้อมูลที่ได้
                    </span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${isUnlocked ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ml-auto ${
                    isUnlocked ? 'bg-pink-100 text-pink-700' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isUnlocked ? <FileText className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* STEP 6: Top Center (Near Castle) */}
          {(() => {
            const isUnlocked = isStageUnlocked(stages[5].tab, profile);
            return (
              <div className="absolute top-[13%] left-[45%] sm:left-[48%] z-20 -translate-x-1/2">
                <div
                  onClick={() => {
                    if (isUnlocked) {
                      playClickSound();
                    } else {
                      playWrongSound();
                    }
                    setSelectedStage(stages[5]);
                  }}
                  className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl backdrop-blur-md border-2 text-white shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all text-left max-w-[220px] sm:max-w-[260px] group ${
                    isUnlocked 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 border-white shadow-orange-950/30 ring-4 ring-amber-400/30 animate-pulse' 
                      : 'bg-slate-900/90 border-slate-700 opacity-75 shadow-slate-950/40'
                  }`}
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-lg shadow-md shrink-0 group-hover:scale-110 transition-transform ${
                    isUnlocked ? 'bg-white text-orange-600' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {isUnlocked ? '6' : <Lock className="w-4 h-4 text-slate-300" />}
                  </div>
                  <div className="overflow-hidden">
                    <span className={`text-xs font-black block leading-tight truncate ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                      ภารกิจสุดท้าย
                    </span>
                    <span className={`text-[10px] block leading-tight truncate ${isUnlocked ? 'text-orange-100' : 'text-slate-400'}`}>
                      นักสืบค้นข้อมูลมือโปร
                    </span>
                  </div>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ml-auto border ${
                    isUnlocked ? 'bg-orange-600/30 text-white border-orange-200/50' : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* BOSS DUNGEON NODE: Top Center-Right (Near the volcanic dungeon & castle peak) */}
          {(() => {
            const isUnlocked = isStageUnlocked('boss_battle', profile);
            return (
              <div className="absolute top-[5%] left-[62%] sm:left-[65%] z-25 -translate-x-1/2">
                <div
                  onClick={() => {
                    if (isUnlocked) {
                      playClickSound(); 
                      onSelectTab('boss_battle'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      playWrongSound();
                      onSelectTab('boss_battle');
                    }
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-2xl border-2 text-white shadow-2xl cursor-pointer transition-all text-left max-w-[220px] sm:max-w-[250px] group ${
                    isUnlocked 
                      ? 'bg-gradient-to-r from-red-950/95 to-slate-900/95 border-red-500 shadow-red-950/70 hover:scale-110 active:scale-95 animate-bounce' 
                      : 'bg-slate-950/90 border-slate-800 opacity-70 shadow-slate-950/50 hover:scale-105'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl text-white flex items-center justify-center font-black text-base shadow-md shrink-0 group-hover:rotate-12 transition-transform ${
                    isUnlocked ? 'bg-gradient-to-tr from-red-600 to-rose-500 shadow-red-500/50' : 'bg-slate-800 text-slate-400 shadow-slate-900'
                  }`}>
                    {isUnlocked ? '⚔️' : <Lock className="w-4 h-4 text-slate-300" />}
                  </div>
                  <div className="overflow-hidden">
                    <span className={`text-xs font-black block leading-tight truncate flex items-center gap-1 ${isUnlocked ? 'text-red-300' : 'text-slate-400'}`}>
                      <span>ศึกบอสใหญ่</span>
                      <span className={`text-[9px] px-1 rounded font-mono ${isUnlocked ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>BOSS</span>
                    </span>
                    <span className={`text-[10px] block leading-tight truncate ${isUnlocked ? 'text-amber-200' : 'text-slate-400'}`}>
                      {profile.bossDefeated ? '🎉 ปราบบอสแล้ว!' : (isUnlocked ? 'จอมวายร้ายดาร์กบัก' : '🔒 ล็อก (ผ่านด่าน 6 ก่อน)')}
                    </span>
                  </div>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ml-auto border ${
                    isUnlocked ? 'bg-red-900/60 text-red-300 border-red-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    {isUnlocked ? <Swords className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* LUCKY TREASURE CHEST NODE (Map Landmark) */}
          {onOpenLuckyChest && (
            <div className="absolute bottom-[35%] left-[28%] z-20">
              <button
                onClick={() => {
                  playChestOpenSound();
                  onOpenLuckyChest();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/80 to-yellow-500/80 backdrop-blur-md border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.5)] text-white font-black text-xs hover:scale-110 active:scale-95 transition-all animate-pulse"
              >
                <span className="text-base">🎁</span>
                <span>หีบสมบัติลักกี้</span>
              </button>
            </div>
          )}

          {/* Bottom-Right Floating AI Robot Mascot (สารวัตรไบต์ AI) */}
          <div 
            onClick={() => { playClickSound(); setIsAiChatOpen(true); }}
            className="absolute bottom-4 right-3 sm:right-6 z-20 flex flex-col items-end cursor-pointer group"
          >
            {/* Speech Bubble */}
            <div className="mb-2 p-2.5 sm:p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-left max-w-[160px] sm:max-w-[200px] relative group-hover:scale-105 transition-transform">
              <p className="text-xs font-bold text-white leading-snug">
                สวัสดีครับ!
              </p>
              <p className="text-[11px] text-cyan-300 font-medium leading-snug">
                มีอะไรให้ผมช่วยไหมครับ?
              </p>
              {/* Triangle Tail */}
              <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-cyan-400/50" />
            </div>

            {/* Robot Image Avatar */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 p-1 shadow-2xl shadow-sky-500/40 group-hover:scale-110 transition-transform">
              <img
                src="/images/cute_robot_mascot_1788247457628.jpg"
                alt="AI Assistant Robot"
                className="w-full h-full object-cover rounded-full bg-slate-900"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Popover Modal */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 p-5 border border-slate-700 shadow-[0_0_25px_rgba(6,182,212,0.2)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-white text-base">กล่องแจ้งเตือน</h3>
              </div>
              <button
                onClick={() => setIsNotificationOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-white"
              >
                ปิด
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="font-bold text-amber-400 block">🎁 ยินดีต้อนรับสู่นักสืบสารสนเทศ ป.5!</span>
                <span>เรียนรู้ผ่านด่านเพื่อสะสมดาว ⭐ เหรียญ ฿ และเพชร 💎 ไปแต่งห้องนอน</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="font-bold text-cyan-400 block">🤖 มีคำถามถามสารวัตรไบต์ AI ได้เลย</span>
                <span>กดที่หุ่นยนต์มุมขวาล่างเพื่อขอคำใบ้หรือให้ AI ช่วยแต่งคำค้นหาได้ตลอดเวลา</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      <DailyQuestsModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        profile={profile}
        onClaimReward={handleClaimQuest}
      />

      <DailyCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        profile={profile}
        onCheckIn={handleCheckIn}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        profile={profile}
      />

      <BackpackModal
        isOpen={isBackpackOpen}
        onClose={() => setIsBackpackOpen(false)}
        profile={profile}
        onSelectTab={onSelectTab}
        onUpdateProfile={onUpdateProfile}
      />

      <DetectiveNotebookModal
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        profile={profile}
      />

      <InspectorByteChatModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        studentName={profile.name || 'น้องมินนี่'}
      />

      <StageMissionModal
        isOpen={!!selectedStage}
        stage={selectedStage}
        profile={profile}
        onClose={() => setSelectedStage(null)}
        onStartStage={(tab) => {
          setSelectedStage(null);
          onSelectTab(tab);
        }}
      />

      {/* SYSTEM SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-2 border-sky-100 text-slate-800 space-y-5">
            <button
              onClick={() => { playClickSound(); setIsSettingsOpen(false); }}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">ตั้งค่าระบบ & เสียง</h3>
                <p className="text-xs text-slate-500">ปรับแต่งการทำงานและตัวเลือกของแอป</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {/* Sound FX Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">เสียงเอฟเฟกต์ (SFX)</span>
                    <span className="text-[10px] text-slate-500">เสียงกดปุ่ม ตอบคำถาม และเปิดหีบ</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playClickSound();
                    onUpdateProfile({ soundEnabled: !(profile.soundEnabled !== false) });
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                    profile.soundEnabled !== false
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {profile.soundEnabled !== false ? 'เปิดอยู่' : 'ปิดอยู่'}
                </button>
              </div>

              {/* BGM 8-bit Music Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">เพลงประกอบ (BGM 8-bit)</span>
                    <span className="text-[10px] text-slate-500">ดนตรีสร้างบรรยากาศการสำรวจ</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playClickSound();
                    toggleBgm();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                    isBgmPlaying()
                      ? 'bg-purple-600 text-white shadow-purple-500/20'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isBgmPlaying() ? 'เปิดอยู่' : 'ปิดอยู่'}
                </button>
              </div>

              {/* Shortcut to Profile / Edit Profile */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">โปรไฟล์นักสืบ</span>
                    <span className="text-[10px] text-slate-500">ดูสถิติ บัตรประจำตัว และแต่งตัว</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playClickSound();
                    setIsSettingsOpen(false);
                    onOpenProfile();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition shadow-xs"
                >
                  เปิดโปรไฟล์
                </button>
              </div>

              {/* App Info Box */}
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs space-y-1">
                <span className="font-black text-sky-950 block">InfoQuest RPG ป.5</span>
                <p className="text-sky-800 text-[11px] leading-relaxed">
                  เกมการเรียนรู้การสืบค้นข้อมูลสารสนเทศตามหลักสูตรวิทยาการคำนวณ ป.5 (ฉบับสมบูรณ์)
                </p>
              </div>
            </div>

            <button
              onClick={() => { playClickSound(); setIsSettingsOpen(false); }}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition shadow-md"
            >
              ปิดหน้าต่างตั้งค่า
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
