import React, { useState, useEffect } from 'react';
import { DetectiveProfile, TabType } from '../types';
import { 
  Shield, 
  Zap, 
  Sparkles, 
  Award, 
  Flame, 
  RefreshCw, 
  ArrowLeft, 
  Swords, 
  Heart, 
  HelpCircle,
  Skull,
  Trophy,
  Bot,
  Star
} from 'lucide-react';
import { 
  playAttackSlashSound, 
  playBossDamageSound, 
  playCorrectSound, 
  playWrongSound, 
  playBadgeUnlockSound, 
  playPowerupSound, 
  playClickSound 
} from '../utils/sound';

interface BossBattleArenaProps {
  profile: DetectiveProfile;
  onUpdateProfile: (updater: (prev: DetectiveProfile) => DetectiveProfile) => void;
  onNavigateTab: (tab: TabType) => void;
}

interface AttackAction {
  id: string;
  name: string;
  category: 'keyword' | 'operator' | 'trust' | 'ultimate';
  icon: string;
  damage: number;
  energyCost: number;
  description: string;
  dialogue: string;
  counterType: string;
}

const ATTACK_SKILLS: AttackAction[] = [
  {
    id: 'keyword_slash',
    name: 'สกัดคำค้นแม่นยำ (Keyword Slash)',
    category: 'keyword',
    icon: '🗡️',
    damage: 180,
    energyCost: 1,
    description: 'เลือกคำสำคัญเจาะจง ตัดคำฟุ่มเฟือย ฟันทะลุหมอกควันข้อมูลเท็จ',
    dialogue: 'ใช้คีย์เวิร์ดตรงจุด สลายหมอกข้อมูลคลุมเครือ!',
    counterType: 'vague_news'
  },
  {
    id: 'pdf_thunder',
    name: 'คาถาสายฟ้า filetype:pdf',
    category: 'operator',
    icon: '⚡',
    damage: 240,
    energyCost: 1,
    description: 'ดึงเอกสารวิจัยทางการและคู่มือมาตรฐาน ฟาดสายฟ้าเอกสารยืนยัน',
    dialogue: 'ร่าย filetype:pdf เรียกสายฟ้าข้อมูลทางการ!',
    counterType: 'fake_report'
  },
  {
    id: 'gov_shield',
    name: 'เกราะสะท้อน .go.th Fact-Check',
    category: 'trust',
    icon: '🛡️',
    damage: 160,
    energyCost: 1,
    description: 'ตรวจสอบโดเมนหน่วยงานรัฐ ป้องกันการล่อลวงและสะท้อนความจริงกลับไป',
    dialogue: 'เปิดเกราะหน่วยงานรัฐ .go.th สะท้อนข่าวปลอมกลับไป!',
    counterType: 'phishing_link'
  },
  {
    id: 'inspector_ultimate',
    name: 'ท่าไม้ตาย: ลำแสงสารวัตรไบต์ (Byte Laser)',
    category: 'ultimate',
    icon: '🤖',
    damage: 380,
    energyCost: 2,
    description: 'ประสานพลัง 5W1H + สารวัตรไบต์ ยิงลำแสงตรวจสอบความจริงรอบทิศทาง',
    dialogue: 'สารวัตรไบต์ยิงลำแสง Fact-Check ขั้นสูงสุด กวาดล้างข้อมูลเท็จ!',
    counterType: 'all'
  }
];

const BOSS_ATTACKS = [
  {
    name: 'พายุพาดหัวหลอก Clickbait Storm!',
    dialogue: 'ฮ่าๆๆ! คลิกดูด่วน ตกใจทั้งประเทศ ถ้าไม่แชร์จะโชคร้าย!',
    damage: 1,
    weakness: 'keyword'
  },
  {
    name: 'ปล่อยไวรัสฟิชชิ่ง .xyz Scam Torrent!',
    dialogue: 'ยินดีด้วย คุณคือผู้โชคดีคนที่ 1 ล้าน กรอกรหัสผ่านเพื่อรับทองคำ!',
    damage: 1,
    weakness: 'trust'
  },
  {
    name: 'ระเบิดข่าวลือไร้ที่มา Deepfake Mist!',
    dialogue: 'เรื่องนี้วงในเขารู้กัน ดื่มน้ำต้มสมุนไพรนี้หายทุกโรคใน 3 นาที!',
    damage: 1,
    weakness: 'operator'
  }
];

export const BossBattleArena: React.FC<BossBattleArenaProps> = ({
  profile,
  onUpdateProfile,
  onNavigateTab,
}) => {
  const MAX_BOSS_HP = 1000;
  const [bossHp, setBossHp] = useState<number>(MAX_BOSS_HP);
  const [playerHp, setPlayerHp] = useState<number>(profile.health || 5);
  const [bossTurnState, setBossTurnState] = useState<'idle' | 'player_attacking' | 'boss_attacking' | 'victory' | 'defeat'>('idle');
  const [combatLogs, setCombatLogs] = useState<Array<{ id: number; text: string; type: 'player' | 'boss' | 'system' | 'crit' }>>([
    { id: 1, text: '⚠️ คำเตือน! บอสใหญ่ "ดาร์กบัก ไททันข้อมูลลวง" ปรากฏตัวแล้ว!', type: 'system' },
    { id: 2, text: '💡 ใช้ทักษะการสืบค้นข้อมูล 5W1H, ตัวดำเนินการ และการตรวจโดเมนเพื่อเอาชนะ!', type: 'system' }
  ]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [floatingDamage, setFloatingDamage] = useState<{ amount: string; isCrit: boolean; key: number } | null>(null);
  const [bossExpression, setBossExpression] = useState<'normal' | 'hit' | 'attack' | 'dead'>('normal');
  const [energy, setEnergy] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [currentQuizChallenge, setCurrentQuizChallenge] = useState<{
    question: string;
    options: { text: string; isCorrect: boolean; skill: AttackAction }[];
  } | null>(null);

  // Trigger boss quiz / special counter
  const generateQuizCounter = (bossMove: typeof BOSS_ATTACKS[0]) => {
    let question = '';
    let correctSkill = ATTACK_SKILLS[0];

    if (bossMove.weakness === 'keyword') {
      question = 'บอสปล่อยพาดหัว Clickbait หลอกลวง! เจ้าจะใช้เทคนิคใดสลายมัน?';
      correctSkill = ATTACK_SKILLS[0]; // keyword
    } else if (bossMove.weakness === 'trust') {
      question = 'บอสส่งลิงก์ชวนเชื่อ .xyz มาหลอกล่อ! ใช้ทักษะใดป้องกัน?';
      correctSkill = ATTACK_SKILLS[2]; // gov_shield
    } else {
      question = 'บอสอ้างงานวิจัยลอยๆ ไม่มีหลักฐาน! ร่ายคาถาใดพิสูจน์ความจริง?';
      correctSkill = ATTACK_SKILLS[1]; // pdf_thunder
    }

    const shuffled = [...ATTACK_SKILLS].sort(() => 0.5 - Math.random());
    setCurrentQuizChallenge({
      question,
      options: shuffled.map(s => ({
        text: `${s.icon} ${s.name}`,
        isCorrect: s.id === correctSkill.id || s.id === 'inspector_ultimate',
        skill: s
      }))
    });
  };

  const handlePlayerAttack = (skill: AttackAction) => {
    if (bossTurnState !== 'idle' || energy < skill.energyCost) return;

    playAttackSlashSound();
    setBossTurnState('player_attacking');
    setBossExpression('hit');
    setEnergy(prev => Math.max(0, prev - skill.energyCost));

    // Calculate Damage & Crit
    const isCrit = Math.random() > 0.6 || skill.category === 'ultimate';
    const finalDamage = isCrit ? Math.round(skill.damage * 1.5) : skill.damage;

    // Screen Shake & Floating Damage
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 400);

    setFloatingDamage({
      amount: `-${finalDamage} HP ${isCrit ? '🔥 CRITICAL!' : ''}`,
      isCrit,
      key: Date.now()
    });

    const newBossHp = Math.max(0, bossHp - finalDamage);
    setBossHp(newBossHp);

    setCombatLogs(prev => [
      {
        id: Date.now(),
        text: `⚔️ คุณใช้ [${skill.name}] ${skill.dialogue} สร้างความเสียหาย ${finalDamage} ดาเมจ!`,
        type: isCrit ? 'crit' : 'player'
      },
      ...prev.slice(0, 8)
    ]);

    playBossDamageSound();

    // Check Victory
    if (newBossHp <= 0) {
      setTimeout(() => {
        setBossTurnState('victory');
        setBossExpression('dead');
        playBadgeUnlockSound();
        onUpdateProfile(prev => ({
          ...prev,
          coins: (prev.coins || 0) + 500,
          exp: (prev.exp || 0) + 350,
          gems: (prev.gems || 0) + 50,
          stars: (prev.stars || 0) + 100,
          keys: (prev.keys || 0) + 3,
          bossDefeated: true,
          health: 5
        }));
      }, 700);
      return;
    }

    // Boss Counter Attack Phase
    setTimeout(() => {
      setBossExpression('attack');
      setBossTurnState('boss_attacking');
      const randomBossMove = BOSS_ATTACKS[Math.floor(Math.random() * BOSS_ATTACKS.length)];
      
      setCombatLogs(prev => [
        {
          id: Date.now() + 1,
          text: `👾 ดาร์กบัก ร่าย [${randomBossMove.name}]: "${randomBossMove.dialogue}"`,
          type: 'boss'
        },
        ...prev.slice(0, 8)
      ]);

      // Present quick-time counter
      generateQuizCounter(randomBossMove);
    }, 1200);
  };

  const handleAnswerCounter = (option: { text: string; isCorrect: boolean; skill: AttackAction }) => {
    if (!currentQuizChallenge) return;

    setCurrentQuizChallenge(null);

    if (option.isCorrect) {
      playCorrectSound();
      playPowerupSound();
      const bonusDamage = 150;
      const nextBossHp = Math.max(0, bossHp - bonusDamage);
      setBossHp(nextBossHp);
      setCombo(c => c + 1);
      setEnergy(prev => Math.min(4, prev + 2));

      setCombatLogs(prev => [
        {
          id: Date.now(),
          text: `✨ ยอดเยี่ยม! คุณตอบโต้อย่างชาญฉลาดด้วย ${option.skill.name}! บอสโดนสวนกลับ -${bonusDamage} HP!`,
          type: 'crit'
        },
        ...prev.slice(0, 8)
      ]);

      if (nextBossHp <= 0) {
        setBossTurnState('victory');
        setBossExpression('dead');
        playBadgeUnlockSound();
        return;
      }
    } else {
      playWrongSound();
      setPlayerHp(prev => {
        const next = Math.max(0, prev - 1);
        if (next <= 0) {
          setBossTurnState('defeat');
        }
        return next;
      });
      setCombo(0);

      setCombatLogs(prev => [
        {
          id: Date.now(),
          text: `💥 โดนข้อมูลลวงโจมตี! เสียพลังใจ 1 หัวใจ! แนะนำให้ทบทวนแหล่งที่มาข้อมูล!`,
          type: 'boss'
        },
        ...prev.slice(0, 8)
      ]);
    }

    setTimeout(() => {
      setBossTurnState('idle');
      setBossExpression('normal');
      setEnergy(prev => Math.min(4, prev + 1));
    }, 800);
  };

  const handleRestartBattle = () => {
    playClickSound();
    setBossHp(MAX_BOSS_HP);
    setPlayerHp(5);
    setEnergy(3);
    setCombo(0);
    setBossTurnState('idle');
    setBossExpression('normal');
    setCurrentQuizChallenge(null);
    setCombatLogs([
      { id: Date.now(), text: '🔄 เริ่มการต่อสู้ใหม่! ตั้งสติแล้วใช้ทักษะสืบค้นให้ครบถ้วน!', type: 'system' }
    ]);
  };

  const bossHpPercent = Math.round((bossHp / MAX_BOSS_HP) * 100);

  return (
    <div className={`min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 p-4 sm:p-6 transition-all duration-300 ${isScreenShaking ? 'animate-bounce' : ''}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Battle HUD */}
        <div className="flex items-center justify-between bg-[#384A9A]/90 p-3 sm:p-4 rounded-[24px] backdrop-blur-md shadow-lg border border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { playClickSound(); onNavigateTab('hq_overview'); }}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 text-sm font-bold transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>หน้าเดินทาง</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-2xl text-slate-300 drop-shadow-md">⚔️</div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-white drop-shadow-sm flex items-center gap-2">
                  ดันเจี้ยนบอส: ไททันข้อมูลลวง <span className="text-purple-400">👿</span>
                </h1>
                <p className="text-[11px] text-[#A5B4FC] font-medium">
                  ศึกตัดสินแห่งการลบความจริง ปกป้องความปลอดภัยจากความล้มเหลว!
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {combo > 1 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-300 text-xs font-black animate-pulse">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>COMBO x{combo}!</span>
              </div>
            )}
            
            {/* Player Health */}
            <div className="flex items-center gap-2 bg-[#2D3174]/80 px-4 py-1.5 rounded-full border border-white/10">
              <span className="text-xs text-white font-bold hidden sm:inline">พลังใจ:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(heartIdx => (
                  <Heart
                    key={heartIdx}
                    className={`w-4 h-4 ${
                      heartIdx <= playerHp
                        ? 'text-[#FF4D4F] fill-[#FF4D4F] drop-shadow-[0_0_4px_rgba(255,77,79,0.8)]'
                        : 'text-slate-600 fill-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Boss Stage Arena */}
        <div className="relative rounded-[32px] bg-gradient-to-b from-[#211144] via-[#1D0C3C] to-[#150A2E] border-[3px] border-[#4A3288] p-6 sm:p-8 shadow-2xl overflow-hidden min-h-[360px] flex flex-col justify-between">
          
          {/* Background Particles (Approximation of space background) */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
             <div className="absolute top-10 left-1/4 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_purple]" />
             <div className="absolute top-20 right-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full shadow-[0_0_8px_pink]" />
             <div className="absolute bottom-1/3 left-10 text-[#4C2889] text-3xl opacity-50">👾</div>
             <div className="absolute top-1/4 right-10 text-[#4C2889] text-2xl opacity-50 rotate-12">👾</div>
             <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]" />
          </div>

          {/* Boss HP Bar Section */}
          <div className="w-full max-w-2xl mx-auto space-y-3 z-10">
            <div className="flex items-center justify-between text-xs font-bold px-1">
              <div className="flex items-center gap-2 bg-[#311148] px-4 py-1.5 rounded-full border border-purple-500/30">
                <Skull className="w-4 h-4 text-purple-400" />
                <span className="text-white font-black text-sm">ดาร์กบั๊ก (Dark Bug Glitch Titan)</span>
              </div>
              <span className="text-pink-300 font-bold text-sm bg-[#311148] px-4 py-1.5 rounded-full border border-purple-500/30">
                {bossHp} / {MAX_BOSS_HP} HP ({bossHpPercent}%)
              </span>
            </div>
            
            <div className="h-5 w-full bg-[#311148] rounded-full p-1 border border-pink-500/30 relative overflow-hidden shadow-inner">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#FF0055] to-[#FFC107] transition-all duration-300 shadow-[0_0_10px_rgba(255,0,85,0.6)]"
                style={{ width: `${bossHpPercent}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white drop-shadow-md">
                {bossHpPercent}%
              </div>
            </div>
          </div>

          {/* Boss Sprite & Combat Arena Center */}
          <div className="relative my-8 flex items-center justify-center flex-1">
            {/* Floating Combat Damage Text */}
            {floatingDamage && (
              <div 
                key={floatingDamage.key}
                className={`absolute -top-10 text-2xl sm:text-3xl font-black ${
                  floatingDamage.isCrit ? 'text-amber-300 scale-125' : 'text-red-400'
                } animate-bounce drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] z-30`}
              >
                {floatingDamage.amount}
              </div>
            )}

            {/* Boss Character Visual (Glowing sphere with bug) */}
            <div className={`relative transition-all duration-300 ${
              bossExpression === 'hit' ? 'scale-90 brightness-150 rotate-3' : 
              bossExpression === 'attack' ? 'scale-110 -translate-y-2' : 
              bossExpression === 'dead' ? 'opacity-30 grayscale blur-sm' : 'animate-pulse'
            }`}>
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-[#1A0B2E] flex items-center justify-center border-2 border-purple-500/30 relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.4)]">
                {/* Glitch overlays */}
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-transparent to-purple-500/20" />
                <div className="absolute inset-0 border-4 border-dashed border-purple-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute -inset-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgo8L3N2Zz4=')] opacity-50 mix-blend-overlay" />
                
                {/* The Bug */}
                <div className="text-white z-10 font-mono text-5xl">
                   {bossExpression === 'dead' ? '💥' :
                   bossExpression === 'hit' ? '😵' :
                   bossExpression === 'attack' ? '😈' : 
                   (
                     <svg width="80" height="80" viewBox="0 0 24 24" fill="white">
                       <path d="M12 2C9.5 2 7 4 7 7V9H5C4.5 9 4 9.5 4 10V12C4 12.5 4.5 13 5 13H6V15C6 17.5 8 19.5 10 19.9V21.5C10 21.8 10.2 22 10.5 22H11.5C11.8 22 12 21.8 12 21.5V19.9C14 19.5 16 17.5 16 15V13H17C17.5 13 18 12.5 18 12V10C18 9.5 17.5 9 17 9H15V7C15 4 12.5 2 12 2ZM8.5 6C9.3 6 10 6.7 10 7.5C10 8.3 9.3 9 8.5 9C7.7 9 7 8.3 7 7.5C7 6.7 7.7 6 8.5 6ZM13.5 6C14.3 6 15 6.7 15 7.5C15 8.3 14.3 9 13.5 9C12.7 9 12 8.3 12 7.5C12 6.7 12.7 6 13.5 6Z" />
                     </svg>
                   )}
                </div>
              </div>

              {/* Boss aura */}
              <div className="absolute -inset-4 bg-purple-600/30 rounded-full blur-2xl -z-10 animate-ping" />
            </div>
          </div>

          {/* Bottom HUD inside Arena: Energy & Status */}
          <div className="flex items-center justify-between z-10 w-full mt-auto">
            <div className="flex items-center gap-2 bg-[#2E1854] px-4 py-2.5 rounded-full border border-purple-500/40 shadow-lg">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cyan-400" />
                สถานะเข้าถึงระบบ:
              </span>
              <div className="flex gap-1.5 ml-1">
                {[1, 2, 3, 4].map(idx => (
                  <div
                    key={idx}
                    className={`w-4 h-6 rounded-md transition-all ${
                      idx <= energy
                        ? 'bg-gradient-to-t from-cyan-400 to-[#7AF0FF] shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                        : 'bg-[#1D0C3C] border border-[#4A3288]'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#2E1854] px-4 py-2.5 rounded-full border border-purple-500/40 shadow-lg text-xs font-bold text-white">
              สถานะ: 
              <div className="flex items-center gap-1.5 text-[#A3E635]">
                <div className={`w-2.5 h-2.5 rounded-full bg-[#A3E635] shadow-[0_0_8px_#A3E635] ${bossTurnState === 'idle' ? 'animate-pulse' : ''}`} />
                {bossTurnState === 'idle' ? 'ตรวจพบจุดอ่อน (เลือกท่าที่โจมตี)' :
                 bossTurnState === 'player_attacking' ? 'กำลังใช้ทักษะสืบค้น...' :
                 bossTurnState === 'boss_attacking' ? 'ระวัง! บอสกำลังโจมตี!' :
                 bossTurnState === 'victory' ? '🏆 ชัยชนะ!' : '💀 พ่ายแพ้'}
              </div>
            </div>
          </div>
        </div>

        {/* Counter Quiz Challenge Dialog (During Boss Attack) */}
        {currentQuizChallenge && (
          <div className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/80 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
              <HelpCircle className="w-5 h-5 animate-spin" />
              <span>⚡ กิจกรรมตั้งรับฉับไว (Quick Fact-Check Counter):</span>
            </div>
            
            <p className="text-base font-bold text-white leading-relaxed">
              {currentQuizChallenge.question}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuizChallenge.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerCounter(opt)}
                  className="p-4 rounded-2xl bg-slate-800 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-400 text-left text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md active:scale-95"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Player Action Skill Deck (When Idle) */}
        {bossTurnState === 'idle' && !currentQuizChallenge && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-white/90 px-2 font-bold">
              <span className="flex items-center gap-2 text-cyan-300">
                <Swords className="w-4 h-4 text-cyan-400" /> สำรับเคล็ดลับค้นหาข้อมูล (Tactical Search Deck)
              </span>
              <span>เลือกเคล็ดลับที่ใช้โจมตีบอส</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ATTACK_SKILLS.map((skill) => {
                const canUse = energy >= skill.energyCost;
                
                // Card styling logic based on category
                let bgClass = "bg-white";
                let borderClass = "border-[#384A9A]/30";
                let shadowClass = "shadow-[0_0_15px_rgba(56,128,255,0.15)]";
                let titleColor = "text-[#384A9A]";
                let iconBg = "bg-amber-400";
                
                if (skill.category === 'ultimate') {
                   bgClass = "bg-[#F4F6FF]";
                   borderClass = "border-[#3B82F6]/50";
                   shadowClass = "shadow-[0_0_15px_rgba(59,130,246,0.3)]";
                   titleColor = "text-[#1E3A8A]";
                   iconBg = "bg-[#3B82F6]";
                } else if (skill.category === 'trust') {
                   bgClass = "bg-white";
                   borderClass = "border-[#3B82F6]/30";
                   shadowClass = "shadow-[0_0_15px_rgba(56,128,255,0.15)]";
                   titleColor = "text-[#1E3A8A]";
                   iconBg = "bg-[#3B82F6]";
                }

                return (
                  <button
                    key={skill.id}
                    disabled={!canUse}
                    onClick={() => handlePlayerAttack(skill)}
                    className={`p-4 rounded-3xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between h-[160px] ${
                      canUse
                        ? `${bgClass} hover:scale-[1.02] ${borderClass} ${shadowClass} cursor-pointer`
                        : 'bg-slate-200 border-slate-300 opacity-60 cursor-not-allowed grayscale'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md ${iconBg}`}>
                          {skill.icon}
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] flex items-center gap-1">
                          ใช้ {skill.energyCost} <Shield className="w-3 h-3 fill-current" />
                        </span>
                      </div>
                      
                      <div>
                        <h4 className={`text-[13px] font-black leading-tight ${titleColor}`}>
                          {skill.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">
                          {skill.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-red-500 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-red-500" /> {skill.damage} ดาเมจ
                      </span>
                      <span className="text-[#384A9A] bg-[#F1F5F9] px-2 py-0.5 rounded-full">รายละเอียด →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Area: Battle Logs & Rewards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Combat Log Box */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#1E293B] border border-[#334155] flex flex-col justify-center space-y-3">
            <span className="text-xs font-black text-white flex items-center gap-2">
              <span className="text-yellow-400">📜</span> บันทึกการต่อสู้ (BATTLE LOGS)
            </span>
            <div className="space-y-2.5 text-xs text-slate-300 font-medium">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-sm mt-0.5">🏆</span>
                <p>คุณเอาชนะบอสใหญ่ <span className="font-bold text-white">"ดาร์กบั๊ก ไททันข้อมูลลวง"</span> ได้สำเร็จ!</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-sm mt-0.5">⚠️</span>
                <p>ใช้ท่าทางการสืบค้นข้อมูล 5W1H, คำค้นเฉพาะ และการตรวจสอบแหล่งข้อมูลเพื่อเอาชนะ!</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-sm mt-0.5">💡</span>
                <p>ยินดีด้วย! คุณได้รับเหรียญ, เพชร และความคืบหน้าในการสะสมดาว</p>
              </div>
            </div>
          </div>

          {/* Rewards Section */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#2D1B69] to-[#1F104D] border border-purple-500/30 flex justify-between relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-2 left-10 w-2 h-2 bg-pink-400 rotate-45" />
            <div className="absolute top-4 left-1/3 w-3 h-1 bg-yellow-400 -rotate-12" />
            <div className="absolute bottom-4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full" />
            
            <div className="flex flex-col justify-between z-10">
               <span className="text-xs font-black text-white/90">รางวัลเมื่อเอาชนะ</span>
               
               <div className="flex items-center gap-6 mt-4">
                 <div className="flex flex-col items-center gap-1">
                   <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)] text-2xl">
                     🥇
                   </div>
                   <span className="text-sm font-black text-white">500</span>
                   <span className="text-[10px] text-white/70">เหรียญ</span>
                 </div>
                 <div className="flex flex-col items-center gap-1">
                   <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl drop-shadow-md">
                     💎
                   </div>
                   <span className="text-sm font-black text-white">20</span>
                   <span className="text-[10px] text-white/70">เพชร</span>
                 </div>
                 <div className="flex flex-col items-center gap-1">
                   <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl drop-shadow-md">
                     ⭐
                   </div>
                   <span className="text-sm font-black text-white">+ 1 ดาว</span>
                   <span className="text-[10px] text-white/70">ความคืบหน้า</span>
                 </div>
               </div>
            </div>

            <div className="relative z-10 flex items-end">
               <div className="text-[80px] drop-shadow-xl translate-y-2 -translate-x-4">🤖</div>
            </div>
          </div>
        </div>

        {/* Victory Modal */}
        {bossTurnState === 'victory' && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-500 text-center space-y-6 shadow-2xl animate-fadeIn">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/40 text-4xl">
                🏆
              </div>
              
              <div>
                <h2 className="text-2xl font-black text-white">ยอดเยี่ยม! ปราบดาร์กบักสำเร็จ!</h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  คุณได้ใช้ทักษะการค้นหาขั้นสูงและหลักการตรวจสอบความน่าเชื่อถืออย่างช่ำชอง ปกป้องดินแดนสารสนเทศให้ปลอดภัย!
                </p>
              </div>

              {/* Rewards */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-amber-400 font-black text-sm">+500</div>
                  <div className="text-[10px] text-slate-400">🪙 เหรียญทอง</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-cyan-400 font-black text-sm">+350</div>
                  <div className="text-[10px] text-slate-400">⚡ EXP</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-purple-400 font-black text-sm">+50</div>
                  <div className="text-[10px] text-slate-400">💎 เพชร</div>
                </div>
              </div>

              {/* Single Central Return Button */}
              <button
                onClick={() => { playClickSound(); onNavigateTab('hq_overview'); }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>🗺️ กลับสู่หน้าเดินทาง</span>
              </button>
            </div>
          </div>
        )}

        {/* Defeat Modal */}
        {bossTurnState === 'defeat' && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-rose-500 text-center space-y-6 shadow-2xl animate-fadeIn">
              <div className="text-5xl">💀</div>
              
              <div>
                <h2 className="text-xl font-black text-white">พลังใจหมดลงแล้ว!</h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  อย่าเพิ่งท้อถอย! การสืบค้นข้อมูลต้องอาศัยการคิดวิเคราะห์ ทบทวนการเลือกใช้คำสำคัญและตัวดำเนินการ แล้วลองใหม่อีกครั้ง!
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRestartBattle}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>ลองสู้ใหม่อีกครั้ง</span>
                </button>
                
                <button
                  onClick={() => { playClickSound(); onNavigateTab('hq_overview'); }}
                  className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
                >
                  🗺️ กลับสู่หน้าเดินทาง
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
