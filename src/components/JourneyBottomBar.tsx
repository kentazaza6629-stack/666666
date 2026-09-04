import React from 'react';
import { TabType, DetectiveProfile } from '../types';
import { 
  Map, 
  ClipboardList, 
  ShoppingBag, 
  Users, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { playClickSound } from '../utils/sound';

interface JourneyBottomBarProps {
  currentTab: TabType;
  profile: DetectiveProfile;
  onSelectTab: (tab: TabType) => void;
  onOpenProfile?: () => void;
}

export const JOURNEY_STEPS: {
  id: TabType;
  stepNumber: number;
  shortTitle: string;
  fullTitle: string;
}[] = [
  { id: 'zone1_basics', stepNumber: 1, shortTitle: '1. ค้นหาพื้นฐาน', fullTitle: 'ด่าน 1: พื้นฐานการค้นหา & Keyword' },
  { id: 'zone2_spells', stepNumber: 2, shortTitle: '2. คาถาตัวดำเนินการ', fullTitle: 'ด่าน 2: คลังคาถาตัวดำเนินการลับ' },
  { id: 'zone3_trust', stepNumber: 3, shortTitle: '3. แล็บความน่าเชื่อถือ', fullTitle: 'ด่าน 3: แล็บความน่าเชื่อถือ & นามสกุลเว็บ' },
  { id: 'zone4_cases', stepNumber: 4, shortTitle: '4. แฟ้มคดีปริศนา', fullTitle: 'ด่าน 4: แฟ้มคดีปริศนา (4 คดี)' },
  { id: 'zone5_sandbox', stepNumber: 5, shortTitle: '5. จำลองสืบค้น & AI', fullTitle: 'ด่าน 5: จำลองค้นหาจริง & สารวัตร AI' },
  { id: 'zone6_exam', stepNumber: 6, shortTitle: '6. สอบยอดนักสืบ', fullTitle: 'ด่าน 6: สอบวัดระดับยอดนักสืบ ป.5' },
];

export const JourneyBottomBar: React.FC<JourneyBottomBarProps> = ({
  currentTab,
  profile,
  onSelectTab,
  onOpenProfile,
}) => {
  const currentIndex = JOURNEY_STEPS.findIndex(s => s.id === currentTab);
  const isInLearningZone = currentIndex !== -1;
  const currentStep = isInLearningZone ? JOURNEY_STEPS[currentIndex] : null;
  const prevStep = currentIndex > 0 ? JOURNEY_STEPS[currentIndex - 1] : null;
  const nextStep = currentIndex >= 0 && currentIndex < JOURNEY_STEPS.length - 1 
    ? JOURNEY_STEPS[currentIndex + 1] 
    : (currentIndex === JOURNEY_STEPS.length - 1 ? { id: 'reward_shop' as TabType, shortTitle: 'ร้านค้า & ห้องนอน' } : null);

  const handleNavigate = (targetTab: TabType) => {
    playClickSound();
    onSelectTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine active main tab
  const getActiveNav = () => {
    if (currentTab === 'teacher_portal') return 'teacher';
    if (currentTab === 'hq' || currentTab === 'hq_overview') return 'map';
    if (currentTab === 'missions' || ['zone1_basics', 'zone2_spells', 'zone3_trust', 'zone4_cases', 'zone5_sandbox', 'zone6_exam', 'boss_battle'].includes(currentTab)) return 'missions';
    if (currentTab === 'shop' || currentTab === 'reward_shop') return 'shop';
    if (currentTab === 'community' || currentTab === 'summary_cert') return 'community';
    if (currentTab === 'profile') return 'profile';
    return 'map';
  };

  const activeNav = getActiveNav();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-sky-200/90 shadow-xl px-2 sm:px-4 py-1.5">
      <div className="max-w-md mx-auto">
        {/* 5 Main Tabs */}
        <div className="flex items-center justify-between">
          {/* 1. เส้นทาง (Journey Map) */}
          <button
            onClick={() => handleNavigate('hq_overview')}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
              activeNav === 'map'
                ? 'text-indigo-600 font-black'
                : 'text-slate-500 hover:text-slate-800 font-bold'
            }`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              activeNav === 'map' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : ''
            }`}>
              <Map className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">เส้นทาง</span>
          </button>

          {/* 2. ภารกิจ (Missions & Quests) */}
          <button
            onClick={() => handleNavigate('missions')}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
              activeNav === 'missions'
                ? 'text-indigo-600 font-black'
                : 'text-slate-500 hover:text-slate-800 font-bold'
            }`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              activeNav === 'missions' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : ''
            }`}>
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">ภารกิจ</span>
          </button>

          {/* 3. ร้านค้า (Shop & Room) */}
          <button
            onClick={() => handleNavigate('shop')}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
              activeNav === 'shop'
                ? 'text-indigo-600 font-black'
                : 'text-slate-500 hover:text-slate-800 font-bold'
            }`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              activeNav === 'shop' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : ''
            }`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">ร้านค้า</span>
          </button>

          {/* 4. ชุมชน & ฟีดกิจกรรม (Community) */}
          <button
            onClick={() => handleNavigate('community')}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
              activeNav === 'community'
                ? 'text-indigo-600 font-black'
                : 'text-slate-500 hover:text-slate-800 font-bold'
            }`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              activeNav === 'community' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : ''
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">ชุมชน</span>
          </button>

          {/* 5. โปรไฟล์ (Profile) */}
          <button
            onClick={() => handleNavigate('profile')}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
              activeNav === 'profile'
                ? 'text-indigo-600 font-black'
                : 'text-slate-500 hover:text-slate-800 font-bold'
            }`}
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              activeNav === 'profile' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : ''
            }`}>
              <User className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">โปรไฟล์</span>
          </button>

          {/* 6. แดชบอร์ดครูผู้สอน (Visible ONLY to Teachers) */}
          {profile.authUser?.role === 'teacher' && (
            <button
              onClick={() => handleNavigate('teacher_portal')}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
                activeNav === 'teacher'
                  ? 'text-emerald-700 font-black'
                  : 'text-slate-500 hover:text-emerald-800 font-bold'
              }`}
            >
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                activeNav === 'teacher' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : ''
              }`}>
                <GraduationCap className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] mt-0.5 text-emerald-700 font-bold">แดชบอร์ดครู</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
