import React, { useState } from 'react';
import { DetectiveProfile } from '../types';
import { 
  Trophy, 
  X, 
  Star, 
  Crown, 
  Users, 
  Shield
} from 'lucide-react';
import { playClickSound } from '../utils/sound';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: DetectiveProfile;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  isUser?: boolean;
  title: string;
  stars: number;
  coins: number;
  avatar: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [activeTab, setActiveTab] = useState<'room' | 'grade' | 'school'>('room');
  const [showRewardsDialog, setShowRewardsDialog] = useState(false);

  if (!isOpen) return null;

  const userStars = profile?.stars ?? 521;
  const userCoins = profile?.coins ?? 853;
  const userName = profile?.name || 'นักสืบจ่าไมค์';
  const userTitle = profile?.title || 'สารวัตรจิ๋วแสนใหญ่';

  // Room P.5/1 Leaderboard
  const ROOM_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, name: 'นักสืบจ่าไมค์', title: 'สารวัตรจิ๋วเหรียญทอง', stars: 320, coins: 1850, avatar: '👦' },
    { rank: 2, name: userName, isUser: true, title: userTitle, stars: userStars, coins: userCoins, avatar: profile?.avatar || '👧' },
    { rank: 3, name: 'อาร์ตี้ แฮกเกอร์ป่า', title: 'ผู้พิทักษ์ความจริง', stars: 230, coins: 1100, avatar: '👦' },
    { rank: 4, name: 'โฟกัส เซียนคีย์เวิร์ด', title: 'จอมเวทย์คาถาสืบค้น', stars: 190, coins: 950, avatar: '🦉' },
    { rank: 5, name: 'ต้นข้าว คำจำแม่น', title: 'นักล่าเบาะแส', stars: 175, coins: 820, avatar: '🚀' },
    { rank: 6, name: 'น้ำใส ไขปริศนา', title: 'นักสืบฝึกหัด', stars: 140, coins: 650, avatar: '🐱' },
  ].sort((a, b) => b.stars - a.stars).map((entry, index) => ({ ...entry, rank: index + 1 }));

  const GRADE_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, name: 'กัปตันเหนือ เมฆา (ป.5/3)', title: 'ปรมาจารย์สืบค้น', stars: 580, coins: 2400, avatar: '🦅' },
    { rank: 2, name: userName + ' (ป.5/1)', isUser: true, title: userTitle, stars: userStars, coins: userCoins, avatar: profile?.avatar || '👧' },
    { rank: 3, name: 'แพรวา ดาต้า (ป.5/2)', title: 'นักสืบสารสนเทศระดับสูง', stars: 490, coins: 1950, avatar: '🦊' },
    { rank: 4, name: 'นักสืบจ่าไมค์ (ป.5/1)', title: 'สารวัตรจิ๋วเหรียญทอง', stars: 320, coins: 1850, avatar: '👦' },
    { rank: 5, name: 'มังกร วิจัย (ป.5/4)', title: 'ผู้เชี่ยวชาญ 5W1H', stars: 310, coins: 1600, avatar: '🐉' },
    { rank: 6, name: 'อาร์ตี้ แฮกเกอร์ป่า (ป.5/1)', title: 'ผู้พิทักษ์ความจริง', stars: 230, coins: 1100, avatar: '👦' },
  ].sort((a, b) => b.stars - a.stars).map((entry, index) => ({ ...entry, rank: index + 1 }));

  const SCHOOL_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, name: 'พี่สิงห์ ป.6/1', title: 'ตำนานนักสืบไซเบอร์', stars: 920, coins: 4500, avatar: '🦁' },
    { rank: 2, name: 'พี่พิม ป.6/2', title: 'แชมป์สืบค้นระดับจังหวัด', stars: 850, coins: 3900, avatar: '🦄' },
    { rank: 3, name: 'กัปตันเหนือ ป.5/3', title: 'ปรมาจารย์สืบค้น', stars: 580, coins: 2400, avatar: '🦅' },
    { rank: 4, name: userName + ' (ป.5/1)', isUser: true, title: userTitle, stars: userStars, coins: userCoins, avatar: profile?.avatar || '👧' },
    { rank: 5, name: 'แพรวา ดาต้า ป.5/2', title: 'นักสืบสารสนเทศระดับสูง', stars: 490, coins: 1950, avatar: '🦊' },
    { rank: 6, name: 'อเล็กซ์ ป.4/1', title: 'ดาวรุ่งนักไขปริศนา', stars: 410, coins: 1800, avatar: '⚡' },
  ].sort((a, b) => b.stars - a.stars).map((entry, index) => ({ ...entry, rank: index + 1 }));


  const currentList = 
    activeTab === 'room' ? ROOM_LEADERBOARD :
    activeTab === 'grade' ? GRADE_LEADERBOARD : SCHOOL_LEADERBOARD;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-[420px] rounded-[32px] bg-gradient-to-b from-[#8C6DFD] to-[#714AE5] shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-5 flex items-center gap-4 text-white relative">
          {/* Sparkles */}
          <div className="absolute top-2 left-6 text-white/50 text-xl animate-pulse">✨</div>
          <div className="absolute top-4 right-16 text-white/50 text-sm animate-pulse">✨</div>
          
          {/* Close Button */}
          <button
            onClick={() => { playClickSound(); onClose(); }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white text-[#714AE5] flex items-center justify-center font-black active:scale-95 shadow-sm hover:bg-slate-50 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Icon */}
          <div className="w-14 h-14 relative flex items-center justify-center flex-shrink-0 z-10">
            <span className="text-[44px] absolute -left-1 drop-shadow-md">🏆</span>
            <span className="text-2xl absolute -left-3 top-1 text-amber-300">🌿</span>
            <span className="text-2xl absolute -right-0 top-1 text-amber-300 transform -scale-x-100">🌿</span>
          </div>
          <div className="pr-6 z-10">
            <h2 className="text-2xl font-black drop-shadow-sm leading-tight">
              ลำดับยอดนักสืบ
            </h2>
            <p className="text-[11px] font-medium text-white/90 mt-1">
              ตารางคะแนนสะสมดาว ประจำห้องเรียน ป.5
            </p>
          </div>
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 bg-white mx-2 mb-2 rounded-[28px] overflow-hidden flex flex-col relative shadow-inner">
          
          {/* Tabs */}
          <div className="px-3 pt-3 pb-2 z-10 relative bg-white">
            <div className="bg-slate-100 rounded-full p-1 flex">
              <button
                onClick={() => { playClickSound(); setActiveTab('room'); }}
                className={`flex-1 py-2 rounded-full text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'room'
                    ? 'bg-[#8C6DFD] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>ห้อง ป.5/1</span>
              </button>
              <button
                onClick={() => { playClickSound(); setActiveTab('grade'); }}
                className={`flex-1 py-2 rounded-full text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'grade'
                    ? 'bg-[#8C6DFD] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>ชั้นป.5 ทั้งหมด</span>
              </button>
              <button
                onClick={() => { playClickSound(); setActiveTab('school'); }}
                className={`flex-1 py-2 rounded-full text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'school'
                    ? 'bg-[#8C6DFD] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>ระดับโรงเรียน</span>
              </button>
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-2 z-10 relative pb-32">
            {currentList.map((entry) => {
              const isRank1 = entry.rank === 1;
              const isRank2 = entry.rank === 2;
              const isRank3 = entry.rank === 3;
              
              let bgClass = 'bg-white border-b border-slate-100';
              let badgeElement = <span className="text-slate-400 font-bold text-lg">{entry.rank}</span>;

              if (isRank1) {
                bgClass = 'bg-[#FFF9E6] border border-[#FFE082] rounded-2xl shadow-sm mb-1';
                badgeElement = (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#FFCA28] to-[#FF8F00] flex items-center justify-center text-white font-black shadow-sm relative">
                    <Crown className="w-3.5 h-3.5 text-white absolute -top-1.5" />
                    1
                  </div>
                );
              } else if (entry.isUser) {
                bgClass = 'bg-white border-2 border-[#8C6DFD] rounded-2xl shadow-sm mb-1 scale-[1.02]';
              } else if (isRank2) {
                bgClass = 'bg-white border border-slate-200 rounded-2xl mb-1';
                badgeElement = (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#E0E0E0] to-[#9E9E9E] flex items-center justify-center text-white font-black shadow-sm">
                    2
                  </div>
                );
              } else if (isRank3) {
                bgClass = 'bg-white border border-slate-200 rounded-2xl mb-1';
                badgeElement = (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#FFB74D] to-[#F57C00] flex items-center justify-center text-white font-black shadow-sm">
                    3
                  </div>
                );
              }

              if (entry.isUser && entry.rank !== 1 && entry.rank !== 2 && entry.rank !== 3) {
                 badgeElement = (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#E0E0E0] to-[#9E9E9E] flex items-center justify-center text-white font-black shadow-sm">
                    {entry.rank}
                  </div>
                 );
              } else if (entry.isUser && isRank2) {
                badgeElement = (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#E0E0E0] to-[#9E9E9E] flex items-center justify-center text-white font-black shadow-sm relative">
                    <Crown className="w-3 h-3 text-white absolute -top-1 opacity-70" />
                    2
                  </div>
                );
              }

              return (
                <div key={entry.rank + entry.name} className={`p-3 flex items-center justify-between gap-3 ${bgClass}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 flex items-center justify-center shrink-0">
                      {badgeElement}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                      {entry.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-black truncate ${entry.isUser ? 'text-[#8C6DFD]' : 'text-slate-800'}`}>
                          {entry.name}
                        </span>
                        {entry.isUser && (
                          <span className="px-2 py-0.5 rounded-full bg-[#8C6DFD] text-white text-[10px] font-black shrink-0">
                            คุณ
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block truncate">
                        {entry.title}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1 w-12 justify-end">
                      <Star className="w-4 h-4 fill-[#FFCA28] text-[#FFCA28]" />
                      <span className="text-sm font-black text-slate-800">{entry.stars}</span>
                    </div>
                    <div className="flex items-center gap-1 w-14 justify-end">
                      <div className="w-4 h-4 rounded-full bg-[#FFCA28] text-yellow-900 flex items-center justify-center text-[10px] font-black shrink-0 border border-[#FFB300]">
                        ฿
                      </div>
                      <span className="text-sm font-black text-slate-700">{entry.coins.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Area with Grass, Robot and Button */}
          <div className="absolute bottom-0 left-0 right-0 h-36 z-0 overflow-hidden rounded-b-[28px] pointer-events-none">
             {/* Grass / Hills Background */}
             <div className="absolute -bottom-16 -left-12 w-64 h-64 bg-[#E2F5C8] rounded-full" />
             <div className="absolute -bottom-20 -right-16 w-80 h-80 bg-[#D4EDB3] rounded-full" />
             <div className="absolute bottom-2 left-6 text-xl">🌸</div>
             <div className="absolute bottom-8 right-12 text-lg">🌼</div>
             <div className="absolute bottom-3 right-28 text-sm">🌸</div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col gap-2">
            <div className="flex items-end gap-2 px-2 -mb-2">
              <div className="text-[52px] filter drop-shadow-md origin-bottom animate-bounce">🤖</div>
              <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 text-xs font-bold text-slate-700 mb-3 relative">
                 <div className="absolute -left-2 bottom-0 w-4 h-4 bg-white border-l border-b border-slate-100 transform rotate-45 -z-10" />
                 เก่งมากเลย! ทำต่อไปให้ถึงอันดับ 1 นะ! 🌟
              </div>
            </div>
            
            <button
              onClick={() => { playClickSound(); setShowRewardsDialog(true); }}
              className="w-full py-3.5 rounded-2xl bg-[#8C6DFD] hover:bg-[#7957E6] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>ดูรางวัลอันดับ</span>
            </button>
          </div>
        </div>

      </div>

      {/* Rewards Dialog */}
      {showRewardsDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 border-2 border-purple-200 text-center space-y-4 shadow-2xl animate-scaleUp">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-3xl shadow-inner">
              🎁
            </div>
            <h3 className="text-lg font-black text-slate-800">
              รางวัลยอดนักสืบประจำสัปดาห์
            </h3>
            <div className="space-y-2 text-xs text-slate-600 text-left">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <span className="font-bold">🥇 อันดับที่ 1</span>
                <span className="font-black text-amber-700">+500 เหรียญ & กรอบทอง</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-bold">🥈 อันดับที่ 2</span>
                <span className="font-black text-slate-700">+300 เหรียญ & กรอบเงิน</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/40 border border-amber-100 flex items-center justify-between">
                <span className="font-bold">🥉 อันดับที่ 3</span>
                <span className="font-black text-amber-800">+150 เหรียญ</span>
              </div>
            </div>
            <button
              onClick={() => { playClickSound(); setShowRewardsDialog(false); }}
              className="w-full py-2.5 rounded-xl bg-[#8C6DFD] text-white font-black text-xs hover:bg-[#7957E6] active:scale-95 transition-all"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
