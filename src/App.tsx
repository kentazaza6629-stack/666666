import React, { useState, useEffect } from 'react';
import { DetectiveProfile, TabType } from './types';
import { DEFAULT_DETECTIVE_PROFILE, BADGE_LIST } from './data/learningContent';
import { Header } from './components/Header';
import { DetectiveProfileModal } from './components/DetectiveProfileModal';
import { HQOverview } from './components/HQOverview';
import { AdventureJourneyMap } from './components/AdventureJourneyMap';
import { Zone1SearchBasics } from './components/Zone1SearchBasics';
import { Zone2Operators } from './components/Zone2Operators';
import { Zone3Reliability } from './components/Zone3Reliability';
import { Zone4CaseMissions } from './components/Zone4CaseMissions';
import { Zone5SearchSandbox } from './components/Zone5SearchSandbox';
import { Zone6Exam } from './components/Zone6Exam';
import { SummaryAndCertificate } from './components/SummaryAndCertificate';
import { RewardShop } from './components/RewardShop';
import { BossBattleArena } from './components/BossBattleArena';
import { MissionsView } from './components/MissionsView';
import { ShopView } from './components/ShopView';
import { CommunityView } from './components/CommunityView';
import { ProfileView } from './components/ProfileView';
import { TeacherPortal } from './components/TeacherPortal';
import { LuckyTreasureChestModal } from './components/LuckyTreasureChestModal';
import { ZoneNavigationHeader } from './components/ZoneNavigationHeader';
import { JourneyBottomBar } from './components/JourneyBottomBar';
import { AuthModal } from './components/AuthModal';
import { AuthUser } from './types';
import { dataService } from './lib/dataService';
import { 
  playClickSound,
  playLevelUpSound, 
  playBadgeUnlockSound, 
  playCorrectSound,
  playWrongSound,
  playCoinSound,
  setGlobalSoundEnabled,
  getGlobalSoundEnabled
} from './utils/sound';
import { isStageUnlocked, getStageName } from './utils/stageUnlock';
import { useAuth } from './contexts/AuthContext';
import { Sparkles, Trophy, X, Zap } from 'lucide-react';

export function App() {
  const { user, profile: onlineProfile, logout: authLogout, updateOnlineProfile, loading } = useAuth();
  const [profile, setProfile] = useState<DetectiveProfile>(DEFAULT_DETECTIVE_PROFILE);

  const [activeTab, setActiveTab] = useState<TabType>('hq_overview');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isLuckyChestOpen, setIsLuckyChestOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(getGlobalSoundEnabled());

  // Toast notification
  const [toastNotification, setToastNotification] = useState<{
    id: number;
    title: string;
    description: string;
    type: 'exp' | 'badge' | 'level' | 'info';
  } | null>(null);

  // Level up popup modal
  const [levelUpData, setLevelUpData] = useState<{
    newLevel: number;
    newRank: string;
  } | null>(null);

  // Sync with online profile and handle auto-switch to teacher portal
  useEffect(() => {
    if (onlineProfile) {
      setProfile(onlineProfile);
      
      // Auto-switch to teacher portal if logged in as teacher and currently at home
      if (onlineProfile.authUser?.role === 'teacher' && activeTab === 'hq_overview') {
        setActiveTab('teacher_portal');
      }
    } else if (!user && !loading) {
      setProfile(DEFAULT_DETECTIVE_PROFILE);
    }
  }, [onlineProfile, user, loading]);

  // Persist profile to Firestore on local changes (with debounce/gate)
  useEffect(() => {
    if (user && profile.authUser?.id === user.uid) {
      // Only sync if locally changed and different from online version to avoid loops
      const timer = setTimeout(() => {
        if (JSON.stringify(profile) !== JSON.stringify(onlineProfile)) {
          updateOnlineProfile(profile);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [profile, user, onlineProfile]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[100]">
        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl animate-pulse flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-white font-black text-xl tracking-widest animate-bounce">
          INFOQUEST <span className="text-amber-400">RPG</span>
        </h2>
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-loading-bar" />
          </div>
          <p className="text-slate-400 text-xs font-bold animate-pulse">กำลังสถาปนาการเชื่อมต่อกับศูนย์บัญชาการ...</p>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes loading-bar {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
          .animate-loading-bar {
            animation: loading-bar 2s ease-in-out infinite;
          }
        `}} />
      </div>
    );
  }

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    setGlobalSoundEnabled(newState);
    setProfile(prev => ({ ...prev, soundEnabled: newState }));
  };

  const handleLogout = async () => {
    await authLogout();
    setProfile(DEFAULT_DETECTIVE_PROFILE);
    setActiveTab('hq_overview');
    playClickSound();
    showToast('ออกจากระบบแล้ว', 'เจอกันใหม่นะนักสืบ!', 'info');
  };

  const handleResetProgress = () => {
    if (window.confirm('คุณต้องการรีเซ็ตความก้าวหน้าทั้งหมดใช่หรือไม่? ข้อมูลคะแนนและเหรียญจะหายไป')) {
      setProfile(DEFAULT_DETECTIVE_PROFILE);
      setActiveTab('hq_overview');
      playClickSound();
      showToast('รีเซ็ตข้อมูลแล้ว', 'เริ่มการสืบสวนใหม่อีกครั้ง!', 'exp');
    }
  };

  const calculateRank = (level: number) => {
    if (level >= 5) return 'สารวัตรสืบสวนใหญ่';
    if (level === 4) return 'นักสืบชำนาญการพิเศษ';
    if (level === 3) return 'นักสืบมือหนึ่ง';
    if (level === 2) return 'นักสืบฝึกหัดขั้นสูง';
    return 'นักสืบฝึกหัด';
  };

  const showToast = (title: string, description: string, type: 'exp' | 'badge' | 'level' | 'info') => {
    const id = Date.now();
    setToastNotification({ id, title, description, type });
    setTimeout(() => {
      setToastNotification(prev => (prev?.id === id ? null : prev));
    }, 3500);
  };

  const handleShowToast = (title: string, message: string, type?: 'exp' | 'badge' | 'clue' | 'case') => {
    showToast(title, message, type === 'badge' ? 'badge' : 'exp');
  };

  const handleEarnCoins = (amount: number, reason: string) => {
    playCoinSound();
    setProfile(prev => ({
      ...prev,
      coins: (prev.coins || 0) + amount,
    }));
    showToast(`+🪙 ${amount} Coins!`, reason, 'exp');
  };

  const handleEarnExp = (amount: number, reason: string) => {
    setProfile(prev => {
      let newExp = prev.exp + amount;
      let newLevel = prev.level;
      let newMaxExp = prev.maxExp;
      let didLevelUp = false;

      while (newExp >= newMaxExp && newLevel < 5) {
        newExp -= newMaxExp;
        newLevel += 1;
        newMaxExp = Math.round(newMaxExp * 1.5);
        didLevelUp = true;
      }

      const newRank = calculateRank(newLevel);

      // Bonus coins when earning exp
      const coinBonus = Math.round(amount * 0.4);
      const newCoins = (prev.coins || 0) + coinBonus;

      if (didLevelUp) {
        playLevelUpSound();
        setLevelUpData({ newLevel, newRank });
      } else {
        showToast(`+${amount} EXP & +🪙 ${coinBonus} Coins!`, reason, 'exp');
      }

      return {
        ...prev,
        exp: newExp,
        level: newLevel,
        maxExp: newMaxExp,
        rankTitle: newRank,
        coins: newCoins,
      };
    });
  };

  const handleSelectTab = (tab: TabType) => {
    if (tab === 'teacher_portal' && profile.authUser?.role !== 'teacher') {
      playWrongSound();
      showToast('เฉพาะครูผู้สอนเท่านั้น', 'เข้าสู่ระบบด้วยบัญชีคุณครูเพื่อเข้าถึงหน้านี้', 'info');
      setIsAuthModalOpen(true);
      return;
    }

    if (!isStageUnlocked(tab, profile)) {
      playWrongSound();
      showToast('🔒 ด่านนี้ยังถูกล็อกอยู่!', `คุณต้องทำด่านก่อนหน้าให้สำเร็จก่อนเพื่อปลดล็อก ${getStageName(tab)}`, 'info');
      return;
    }
    setActiveTab(tab);
  };

  const handleUnlockBadge = (badgeId: string) => {
    setProfile(prev => {
      const alreadyUnlocked = prev.badges.some(b => b.id === badgeId && b.unlocked);
      let updatedBadges = prev.badges;
      if (!alreadyUnlocked) {
        playBadgeUnlockSound();
        updatedBadges = prev.badges.map(b => {
          if (b.id === badgeId) {
            showToast('ปลดล็อกเหรียญตราใหม่! 🎖️ (+50 Coins)', b.name, 'badge');
            return { ...b, unlocked: true, unlockedAt: new Date().toLocaleDateString('th-TH') };
          }
          return b;
        });
      }

      let newUnlockedZones = [...(prev.unlockedZones || ['hq', 'hq_overview', 'zone1_basics', 'reward_shop', 'summary_cert'])];
      if ((badgeId === 'keyword_master' || badgeId === 'search_novice') && !newUnlockedZones.includes('zone2_spells')) {
        newUnlockedZones.push('zone2_spells');
        showToast('🎉 ปลดล็อกด่าน 2 แล้ว!', 'เปิดด่านแหล่งข้อมูล & คาถาสืบค้นแล้ว', 'badge');
      } else if ((badgeId === 'spell_caster' || badgeId === 'operator_wizard') && !newUnlockedZones.includes('zone3_trust')) {
        newUnlockedZones.push('zone3_trust');
        showToast('🎉 ปลดล็อกด่าน 3 แล้ว!', 'เปิดด่านประเมินความน่าเชื่อถือแล้ว', 'badge');
      } else if ((badgeId === 'fact_checker' || badgeId === 'fake_news_buster') && !newUnlockedZones.includes('zone4_cases')) {
        newUnlockedZones.push('zone4_cases');
        showToast('🎉 ปลดล็อกด่าน 4 แล้ว!', 'เปิดด่านลานประลองแฟ้มคดีปริศนาแล้ว', 'badge');
      } else if (badgeId === 'search_sandbox_master' && !newUnlockedZones.includes('zone6_exam')) {
        newUnlockedZones.push('zone6_exam');
        showToast('🎉 ปลดล็อกด่าน 6 แล้ว!', 'เปิดด่านภารกิจสุดท้ายแล้ว', 'badge');
      } else if (badgeId === 'master_detective_p5' && !newUnlockedZones.includes('boss_battle')) {
        newUnlockedZones.push('boss_battle');
        showToast('🎉 ปลดล็อกศึกบอสใหญ่แล้ว!', 'เปิดลานประลองจอมวายร้ายดาร์กบักแล้ว', 'badge');
      }

      return {
        ...prev,
        badges: updatedBadges,
        unlockedZones: newUnlockedZones,
        coins: (prev.coins || 0) + (alreadyUnlocked ? 0 : 50),
      };
    });
  };

  const handleCompleteCase = (caseId: string, expReward: number, badgeId?: string) => {
    setProfile(prev => {
      const alreadyDone = prev.completedCases.includes(caseId);
      if (alreadyDone) return prev;

      const newCompleted = [...prev.completedCases, caseId];
      let newBadges = [...prev.badges];

      if (badgeId) {
        newBadges = newBadges.map(b => b.id === badgeId ? { ...b, unlocked: true, unlockedAt: new Date().toLocaleDateString('th-TH') } : b);
      }

      if (newCompleted.length === 4) {
        // Unlock all-cases badge
        newBadges = newBadges.map(b => b.id === 'case_cracker' ? { ...b, unlocked: true } : b);
      }

      let newUnlockedZones = [...(prev.unlockedZones || ['hq', 'hq_overview', 'zone1_basics', 'reward_shop', 'summary_cert'])];
      if (newCompleted.length >= 1 && !newUnlockedZones.includes('zone5_sandbox')) {
        newUnlockedZones.push('zone5_sandbox');
        showToast('🎉 ปลดล็อกด่าน 5 แล้ว!', 'เปิดด่านจำลองสืบค้น & ผู้ช่วยสารวัตร AI แล้ว', 'badge');
      }

      return {
        ...prev,
        completedCases: newCompleted,
        solvedCluesCount: prev.solvedCluesCount + 1,
        badges: newBadges,
        unlockedZones: newUnlockedZones,
        coins: (prev.coins || 0) + 80,
      };
    });

    handleEarnExp(expReward, `คลี่คลายคดีปริศนา ${caseId}`);
  };

  const handleUpdateQuizScore = (score: number) => {
    setProfile(prev => {
      let newUnlockedZones = [...(prev.unlockedZones || ['hq', 'hq_overview', 'zone1_basics', 'reward_shop', 'summary_cert'])];
      if (score >= 50 && !newUnlockedZones.includes('boss_battle')) {
        newUnlockedZones.push('boss_battle');
        showToast('🎉 ปลดล็อกศึกบอสใหญ่แล้ว!', 'เปิดลานประลองจอมวายร้ายดาร์กบักแล้ว', 'badge');
      }
      return {
        ...prev,
        quizScore: Math.max(prev.quizScore || 0, score),
        totalQuizTaken: (prev.totalQuizTaken || 0) + 1,
        unlockedZones: newUnlockedZones,
        coins: (prev.coins || 0) + (score >= 80 ? 100 : 50),
      };
    });
  };

  const handleLoginSuccess = async (authUser: AuthUser) => {
    // Attempt to load from Firestore
    const remoteProfile = await dataService.getDoc('users', authUser.id);
    
    if (remoteProfile) {
      setProfile({
        ...remoteProfile as DetectiveProfile,
        authUser,
      });
      playCorrectSound();
      showToast('เข้าสู่ระบบสำเร็จ!', `ยินดีต้อนรับกลับ ${authUser.name}`, 'badge');
      return;
    }

    // New account: Everything starts from 0 including inventory/backpack
    const newAccountProfile: DetectiveProfile = {
      ...DEFAULT_DETECTIVE_PROFILE,
      authUser,
      name: authUser.name || 'นักสืบฝึกหัด',
      avatar: authUser.avatar || '🕵️',
      customAvatarImage: authUser.customAvatarImage || authUser.googlePhotoUrl,
      level: 1,
      exp: 0,
      maxExp: 100,
      coins: 0,
      stars: 0,
      gems: 0,
      keys: 0,
      streak: 0,
      dailyCheckInDays: 0,
      hasCheckedInToday: false,
      completedDailyQuests: [],
      inventory: [], // เริ่มจาก 0 ไอเทมในกระเป๋า
      equippedAvatar: {},
      equippedRoom: {},
      completedCases: [],
      solvedCluesCount: 0,
      quizScore: 0,
      totalQuizTaken: 0,
      badges: DEFAULT_DETECTIVE_PROFILE.badges.map(b => ({ ...b, unlocked: false })),
      myNotes: '• จำคาถา: ค้นให้ตรง ตรวจให้ชัวร์ ใช้อย่างปลอดภัย\n• นามสกุลเว็บ .ac.th (การศึกษา), .go.th (รัฐบาล)\n• ห้ามเผยแพร่ข้อมูลส่วนตัวเด็ดขาด!'
    };

    setProfile(newAccountProfile);
    await dataService.saveDoc('users', authUser.id, newAccountProfile);
    playCorrectSound();
    showToast('ยินดีต้อนรับนักสืบใหม่!', `บัญชีของ ${authUser.name} พร้อมเริ่มต้นภารกิจแล้ว`, 'badge');
  };

  const handleUpdateProfile = (
    updated: Partial<DetectiveProfile> | ((prev: DetectiveProfile) => DetectiveProfile)
  ) => {
    setProfile(prev => {
      if (typeof updated === 'function') {
        return updated(prev);
      }
      return { ...prev, ...updated };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {!profile.authUser && (
        <AuthModal
          isOpen={true}
          onClose={() => {}}
          onLoginSuccess={handleLoginSuccess}
          hideCloseButton={true}
        />
      )}

      {profile.authUser && (
        <>
          {/* Navigation Header (Shown in learning zones, shop & cert) */}
          {activeTab !== 'hq_overview' && (
            <Header
              activeTab={activeTab}
              profile={profile}
              onSelectTab={handleSelectTab}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              onOpenLuckyChest={() => setIsLuckyChestOpen(true)}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}

          {/* Main Container */}
          <main className={`flex-1 w-full mx-auto ${activeTab === 'hq_overview' ? 'p-0' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-6'}`}>
            {activeTab === 'hq_overview' && (
              <AdventureJourneyMap
                profile={profile}
                onSelectTab={handleSelectTab}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onEarnExp={handleEarnExp}
                onEarnCoins={handleEarnCoins}
                onUpdateProfile={handleUpdateProfile}
                onOpenLuckyChest={() => setIsLuckyChestOpen(true)}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            )}

            {activeTab === 'missions' && (
              <MissionsView
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onNavigateTab={handleSelectTab}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onShowToast={handleShowToast}
              />
            )}

            {activeTab === 'zone1_basics' && (
              <Zone1SearchBasics
                profile={profile}
                onEarnExp={handleEarnExp}
                onUnlockBadge={handleUnlockBadge}
                onSelectTab={handleSelectTab}
              />
            )}

            {activeTab === 'zone2_spells' && (
              <Zone2Operators
                profile={profile}
                onEarnExp={handleEarnExp}
                onUnlockBadge={handleUnlockBadge}
                onSelectTab={handleSelectTab}
              />
            )}

            {activeTab === 'zone3_trust' && (
              <Zone3Reliability
                profile={profile}
                onEarnExp={handleEarnExp}
                onUnlockBadge={handleUnlockBadge}
                onSelectTab={handleSelectTab}
              />
            )}

            {activeTab === 'zone4_cases' && (
              <Zone4CaseMissions
                completedCases={profile.completedCases}
                onCompleteCase={handleCompleteCase}
                onSelectTab={handleSelectTab}
              />
            )}

            {activeTab === 'zone5_sandbox' && (
              <Zone5SearchSandbox
                detectiveName={profile.name}
                onEarnExp={handleEarnExp}
                onUnlockBadge={handleUnlockBadge}
                onEarnCoins={(amount, reason) => {
                  handleEarnExp(20, reason);
                  setProfile(p => ({ ...p, coins: (p.coins || 0) + amount }));
                }}
                onSelectTab={handleSelectTab}
              />
            )}

            {activeTab === 'zone6_exam' && (
              <Zone6Exam
                detectiveName={profile.name}
                onUpdateQuizScore={handleUpdateQuizScore}
                onEarnExp={handleEarnExp}
                onUnlockBadge={handleUnlockBadge}
                onGoToCertificate={() => handleSelectTab('summary_cert')}
                onSelectTab={handleSelectTab}
              />
            )}

            {activeTab === 'boss_battle' && (
              <BossBattleArena
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onNavigateTab={handleSelectTab}
                onShowToast={handleShowToast}
              />
            )}

            {(activeTab === 'shop' || activeTab === 'reward_shop') && (
              <ShopView
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onNavigateTab={handleSelectTab}
                onShowToast={handleShowToast}
                onOpenLuckyChest={() => setIsLuckyChestOpen(true)}
              />
            )}

            {activeTab === 'community' && (
              <CommunityView
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onNavigateTab={handleSelectTab}
                onShowToast={handleShowToast}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onNavigateTab={handleSelectTab}
                onOpenEditProfile={() => setIsProfileModalOpen(true)}
                onShowToast={handleShowToast}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            )}

            {activeTab === 'summary_cert' && (
              <SummaryAndCertificate 
                profile={profile} 
                onSelectTab={handleSelectTab}
              />
            )}

            {activeTab === 'teacher_portal' && profile.authUser?.role === 'teacher' && (
              <TeacherPortal
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onNavigateTab={handleSelectTab}
                onShowToast={handleShowToast}
              />
            )}
          </main>

          {/* Persistent Sticky Journey Bottom Bar */}
          <JourneyBottomBar
            currentTab={activeTab}
            profile={profile}
            onSelectTab={handleSelectTab}
          />
        </>
      )}

      {/* Auth / Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={() => {
          setIsAuthModalOpen(false);
          showToast('ยินดีต้อนรับกลับ!', 'เชื่อมต่อฐานข้อมูลสำเร็จ', 'info');
        }}
        onLogout={handleLogout}
        currentUser={profile.authUser}
      />

      {/* Lucky Treasure Chest Modal */}
      <LuckyTreasureChestModal
        isOpen={isLuckyChestOpen}
        onClose={() => setIsLuckyChestOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onEarnExp={handleEarnExp}
        onEarnCoins={handleEarnCoins}
      />

      {/* Profile Modal */}
      <DetectiveProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onResetProgress={handleResetProgress}
        onOpenAuthModal={() => {
          setIsProfileModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Level Up Celebration Modal */}
      {levelUpData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-850 to-indigo-950 border-2 border-amber-400 rounded-3xl p-6 text-center space-y-4 shadow-2xl shadow-amber-950/60 cyber-glow">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 mx-auto flex items-center justify-center text-4xl shadow-lg border border-amber-300">
              🎉
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                LEVEL UP! เลื่อนยศสำเร็จ
              </span>
              <h3 className="text-2xl font-extrabold text-white">
                ระดับ Level {levelUpData.newLevel}
              </h3>
              <p className="text-sm font-bold text-cyan-300">
                "{levelUpData.newRank}"
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              ความสามารถในการสืบค้นข้อมูลทางอินเทอร์เน็ตของคุณพัฒนาขึ้นอีกระดับ! ลุยภารกิจถัดไปเพื่อสะสมเหรียญตราให้ครบกันเถอะ
            </p>

            <button
              onClick={() => {
                playCorrectSound();
                setLevelUpData(null);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg transition"
            >
              รับยศและลุยภารกิจต่อ! 🚀
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-cyan-400/80 text-white shadow-2xl shadow-cyan-950/50 backdrop-blur-md">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              {toastNotification.type === 'badge' ? <Trophy className="w-5 h-5 text-amber-400" /> : <Zap className="w-5 h-5 text-cyan-400" />}
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-300">{toastNotification.title}</div>
              <div className="text-[11px] text-slate-300">{toastNotification.description}</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-slate-950/80 py-4 text-center text-xs text-slate-400">
        <p>InfoQuest ป.5 – นักสืบข้อมูลจิ๋ว • วิชาวิทยาศาสตร์และเทคโนโลยี (วิทยาการคำนวณ) ชั้นประถมศึกษาปีที่ 5</p>
      </footer>
    </div>
  );
}
export default App;
