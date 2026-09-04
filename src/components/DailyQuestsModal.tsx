import React from 'react';
import { DetectiveProfile } from '../types';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  Star, 
  Coins, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  GraduationCap 
} from 'lucide-react';
import { playClickSound, playCorrectSound, playCoinSound } from '../utils/sound';

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DetectiveProfile;
  onClaimReward: (questId: string, starReward: number, coinReward: number) => void;
}

export interface QuestItem {
  id: string;
  title: string;
  desc: string;
  progress: number;
  maxProgress: number;
  starReward: number;
  coinReward: number;
  icon: any;
  iconColor: string;
}

export const DailyQuestsModal: React.FC<DailyQuestsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onClaimReward,
}) => {
  if (!isOpen) return null;

  const completedQuests = profile.completedDailyQuests || [];

  const quests: QuestItem[] = [
    {
      id: 'quest_search_1',
      title: 'สืบค้นข้อมูล 1 ครั้ง',
      desc: 'ทดลองพิมพ์ค้นหาคำสำคัญในระบบค้นหาจำลอง หรือในบทเรียน',
      progress: profile.solvedCluesCount > 0 ? 1 : 1, // Ready or completed
      maxProgress: 1,
      starReward: 20,
      coinReward: 50,
      icon: Search,
      iconColor: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'quest_spells_1',
      title: 'ทดสอบคาถาตัวดำเนินการ 1 ครั้ง',
      desc: 'ฝึกใช้เครื่องหมาย "" หรือ site: ค้นหาข้อมูลที่ถูกต้อง',
      progress: profile.level >= 2 ? 1 : 1,
      maxProgress: 1,
      starReward: 25,
      coinReward: 80,
      icon: Sparkles,
      iconColor: 'from-purple-500 to-pink-500',
    },
    {
      id: 'quest_trust_1',
      title: 'ประเมินความน่าเชื่อถือ 1 เว็บไซต์',
      desc: 'ตรวจสอบนามสกุลเว็บ .go.th หรือ .ac.th ในแล็บตรวจความจริง',
      progress: profile.level >= 3 ? 1 : 0,
      maxProgress: 1,
      starReward: 30,
      coinReward: 100,
      icon: ShieldCheck,
      iconColor: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'quest_exam_1',
      title: 'ทำข้อสอบวัดระดับยอดนักสืบ',
      desc: 'ทดสอบความรู้ 10 ข้อเพื่อคว้ายศทอง',
      progress: profile.totalQuizTaken > 0 ? 1 : 0,
      maxProgress: 1,
      starReward: 50,
      coinReward: 150,
      icon: GraduationCap,
      iconColor: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-sky-400/40 p-5 sm:p-6 shadow-2xl shadow-sky-500/20 text-white space-y-5">
        {/* Close Button */}
        <button
          onClick={() => { playClickSound(); onClose(); }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30 text-white">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-amber-300">
              ภารกิจประจำวัน
            </h2>
            <p className="text-xs text-slate-300">
              ทำภารกิจรายวันเพื่อสะสมดาว ⭐ และเหรียญ ฿ เพิ่มเติม
            </p>
          </div>
        </div>

        {/* Quest List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {quests.map((q) => {
            const isClaimed = completedQuests.includes(q.id);
            const isReady = q.progress >= q.maxProgress && !isClaimed;
            const Icon = q.icon;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isClaimed
                    ? 'bg-slate-900/60 border-slate-800 opacity-60'
                    : isReady
                    ? 'bg-gradient-to-r from-sky-950/70 to-blue-900/40 border-sky-400/50 shadow-md shadow-sky-500/10'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${q.iconColor} flex items-center justify-center shrink-0 shadow-md text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {q.title}
                        {isClaimed && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            รับแล้ว
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">{q.desc}</p>
                      
                      {/* Reward Pills */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>+{q.starReward}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                          <Coins className="w-3.5 h-3.5 text-yellow-400" />
                          <span>+{q.coinReward}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 pt-1">
                    {isClaimed ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : isReady ? (
                      <button
                        onClick={() => {
                          playCorrectSound();
                          playCoinSound();
                          onClaimReward(q.id, q.starReward, q.coinReward);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 animate-bounce"
                      >
                        รับรางวัล!
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                        {q.progress}/{q.maxProgress}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {!isClaimed && (
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all"
                      style={{ width: `${Math.min(100, (q.progress / q.maxProgress) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 text-center">
          <button
            onClick={() => { playClickSound(); onClose(); }}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold transition-colors"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};
