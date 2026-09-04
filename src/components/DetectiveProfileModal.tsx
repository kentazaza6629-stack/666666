import React, { useState, useRef } from 'react';
import { DetectiveProfile } from '../types';
import { 
  X, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  User, 
  Key, 
  Medal, 
  Search, 
  FolderLock, 
  Check, 
  Zap,
  RotateCcw,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import { playClickSound, playCorrectSound } from '../utils/sound';

interface DetectiveProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DetectiveProfile;
  onUpdateProfile: (updated: Partial<DetectiveProfile>) => void;
  onResetProgress: () => void;
  onOpenAuthModal?: () => void;
}

const AVATAR_OPTIONS = [
  { emoji: '🕵️‍♂️', name: 'นักสืบหนุ่ม' },
  { emoji: '🕵️‍♀️', name: 'นักสืบสาว' },
  { emoji: '🤖', name: 'หุ่นยนต์ไซเบอร์' },
  { emoji: '🐱', name: 'สายสืบเหมียว' },
  { emoji: '🦉', name: 'นกฮูกปัญญา' },
  { emoji: '🦊', name: 'จิ้งจอกนักค้น' },
  { emoji: '🐶', name: 'ด็อกกี้ดมกลิ่น' },
  { emoji: '🚀', name: 'นักสำรวจดารา' },
];

export const DetectiveProfileModal: React.FC<DetectiveProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetProgress,
  onOpenAuthModal,
}) => {
  const [name, setName] = useState(profile.name || 'นักสืบจิ๋วไบต์');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
      };
      reader.readAsDataURL(file);
    }
  };

  const badges = profile.badges || [];
  const unlockedBadges = badges.filter(b => b && b.unlocked);

  const handleSaveName = () => {
    if (name.trim()) {
      onUpdateProfile({ name: name.trim() });
      setIsEditingName(false);
      playCorrectSound();
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search': return <Search className="w-5 h-5" />;
      case 'Key': return <Key className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      case 'Medal': return <Medal className="w-5 h-5" />;
      default: return <Medal className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-950/50 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                บัตรประจำตัวนักสืบดิจิทัล
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-normal">
                  ID: IQ5-{Math.abs((profile.name || 'นักสืบ').split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000))}
                </span>
              </h2>
              <p className="text-xs text-slate-400">สถาบันฝึกอบรมนักสืบสารสนเทศ ป.5</p>
            </div>
          </div>
          <button
            onClick={() => { playClickSound(); onClose(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Identity Card Block */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-850 via-slate-800 to-slate-850 border border-cyan-500/30 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-4xl shadow-lg shadow-cyan-500/30 border-2 border-cyan-400/50 overflow-hidden relative cursor-pointer ${
                  profile.equippedAvatar?.frame ? 'ring-4 ring-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : ''
                }`}>
                  {profile.customAvatarImage ? (
                    <img
                      src={profile.customAvatarImage}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    profile.avatar
                  )}

                  {/* Hover Camera Overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity backdrop-blur-[1px]"
                    title="คลิกเพื่อเลือกรูปถ่ายตัวเอง"
                  >
                    <Camera className="w-5 h-5 mb-0.5 text-cyan-300" />
                    <span>เปลี่ยนรูป</span>
                  </button>
                </div>

                {/* Equipped Hat Badge */}
                {profile.equippedAvatar?.hat && (
                  <div className="absolute -top-2 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-sm shadow-md border-2 border-slate-900 animate-bounce">
                    {profile.equippedAvatar.hat.includes('explorer') ? '🤠' : profile.equippedAvatar.hat.includes('thinker') ? '👓' : '🕵️‍♂️'}
                  </div>
                )}

                {/* Equipped Pet Badge */}
                {profile.equippedAvatar?.pet && (
                  <div className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-cyan-400 text-slate-900 flex items-center justify-center text-sm shadow-md border-2 border-slate-900 animate-pulse">
                    {profile.equippedAvatar.pet.includes('cat') ? '🐱' : '🤖'}
                  </div>
                )}

                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-amber-500 text-slate-900 rounded-md text-[10px] font-bold z-10">
                  Lv.{profile.level}
                </div>
              </div>

              {/* Info & Edit */}
              <div className="flex-1 text-center sm:text-left space-y-1.5 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="px-3 py-1 bg-slate-900 border border-cyan-400 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        maxLength={20}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-xs rounded-lg transition"
                      >
                        บันทึก
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-lg font-bold text-white">{profile.name}</h3>
                      <button
                        onClick={() => { playClickSound(); setIsEditingName(true); }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                      >
                        เปลี่ยนชื่อ
                      </button>
                    </div>
                  )}

                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40">
                    ยศ: {profile.rankTitle}
                  </span>
                </div>

                {/* EXP Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>ค่าประสบการณ์สืบสวน (EXP)</span>
                    <span className="text-cyan-300 font-mono font-bold">{profile.exp} / {profile.maxExp} XP</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 via-blue-400 to-amber-400 h-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (profile.exp / profile.maxExp) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="mt-4 pt-4 border-t border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-xs text-slate-300 font-medium">เลือกสัญลักษณ์ประจำตัวหรือรูปถ่าย:</label>
                
                {/* Upload Photo Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>📷 อัปโหลดรูปถ่ายตัวเอง</span>
                </button>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              {/* Display Custom Uploaded Photo Badge if present */}
              {profile.customAvatarImage && 
               profile.customAvatarImage !== '/images/cute_girl_avatar_1788247477569.jpg' && 
               profile.customAvatarImage !== '/images/cute_robot_mascot_1788247457628.jpg' && (
                <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/50 flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={profile.customAvatarImage}
                      alt="Custom Photo"
                      className="w-9 h-9 rounded-lg object-cover border border-cyan-400 shrink-0 shadow"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                        <span>✨ รูปถ่ายส่วนตัวของคุณ</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-200">เปิดใช้อยู่</span>
                      </p>
                      <p className="text-[10px] text-slate-400">ภาพที่อัปโหลดจากเครื่องอุปกรณ์ของคุณ</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      onUpdateProfile({ customAvatarImage: undefined, avatar: '🕵️‍♂️' });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1 transition shrink-0"
                    title="ลบรูปถ่ายส่วนตัว"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>ลบรูปถ่าย</span>
                  </button>
                </div>
              )}

              {/* Illustrated Avatars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    playClickSound();
                    onUpdateProfile({ customAvatarImage: '/images/cute_girl_avatar_1788247477569.jpg', avatar: '👧' });
                  }}
                  className={`p-2 rounded-xl flex items-center gap-2 border transition-all ${
                    profile.customAvatarImage === '/images/cute_girl_avatar_1788247477569.jpg'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md ring-1 ring-cyan-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <img
                    src="/images/cute_girl_avatar_1788247477569.jpg"
                    alt="Cute Girl"
                    className="w-8 h-8 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-bold">น้องมินนี่ (3D)</span>
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    onUpdateProfile({ customAvatarImage: '/images/cute_robot_mascot_1788247457628.jpg', avatar: '🤖' });
                  }}
                  className={`p-2 rounded-xl flex items-center gap-2 border transition-all ${
                    profile.customAvatarImage === '/images/cute_robot_mascot_1788247457628.jpg'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md ring-1 ring-cyan-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <img
                    src="/images/cute_robot_mascot_1788247457628.jpg"
                    alt="Robot AI"
                    className="w-8 h-8 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-bold">สารวัตรไบต์ (3D)</span>
                </button>
              </div>

              {/* Emoji Avatars */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVATAR_OPTIONS.map((item) => (
                  <button
                    key={item.emoji}
                    onClick={() => {
                      playClickSound();
                      onUpdateProfile({ avatar: item.emoji, customAvatarImage: undefined });
                    }}
                    title={item.name}
                    className={`p-2 rounded-xl text-xl flex items-center justify-center transition-all ${
                      !profile.customAvatarImage && profile.avatar === item.emoji
                        ? 'bg-cyan-500/30 border-2 border-cyan-400 shadow-md scale-105'
                        : 'bg-slate-800/80 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detective Account Integration Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0">
                <span className="text-xl">🎒</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">
                    {profile.authUser?.name || profile.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold">
                    {profile.authUser?.classroom || 'นักเรียน ป.5'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {profile.authUser?.schoolName || 'เข้าสู่ระบบเพื่อบันทึกข้อมูลและเล่นบนอุปกรณ์อื่น'}
                </p>
              </div>
            </div>

            {onOpenAuthModal && (
              <button
                onClick={() => {
                  playClickSound();
                  onOpenAuthModal();
                }}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
              >
                <span>🔑</span>
                <span>{profile.authUser ? 'จัดการบัญชี / สลับผู้ใช้' : 'เข้าสู่ระบบ'}</span>
              </button>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
              <div className="text-lg font-extrabold text-amber-300 font-mono flex items-center justify-center gap-1">
                <span>🪙</span> {(profile.coins || 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-amber-200/80">เหรียญสะสม (Coins)</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 text-center space-y-0.5">
              <div className="text-lg font-extrabold text-cyan-400 font-mono">
                {(profile.completedCases || []).length}/4
              </div>
              <div className="text-[10px] text-slate-400">คดีที่คลี่คลาย</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 text-center space-y-0.5">
              <div className="text-lg font-extrabold text-amber-400 font-mono">
                {(unlockedBadges || []).length}/{(badges || []).length}
              </div>
              <div className="text-[10px] text-slate-400">ตราสัญลักษณ์</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 text-center space-y-0.5">
              <div className="text-lg font-extrabold text-emerald-400 font-mono">
                {profile.quizScore}%
              </div>
              <div className="text-[10px] text-slate-400">คะแนนสอบยอดนักสืบ</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 text-center space-y-0.5">
              <div className="text-lg font-extrabold text-purple-400 font-mono">
                {(profile.inventory || []).length}
              </div>
              <div className="text-[10px] text-slate-400">ไอเทมครอบครอง</div>
            </div>
          </div>

          {/* Badges Collection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                คลังเหรียญตราเกียรติยศ ({(unlockedBadges || []).length}/{(badges || []).length})
              </h4>
              <span className="text-xs text-slate-400">ทำภารกิจเพื่อปลดล็อกตราใหม่</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                    badge.unlocked
                      ? 'bg-slate-800/90 border-cyan-500/40 shadow-sm shadow-cyan-950/40'
                      : 'bg-slate-900/60 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      badge.unlocked
                        ? `bg-gradient-to-tr ${badge.color} text-slate-950 shadow-md font-bold`
                        : 'bg-slate-800 text-slate-600 border border-slate-700'
                    }`}
                  >
                    {getBadgeIcon(badge.icon)}
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${badge.unlocked ? 'text-white' : 'text-slate-500'}`}>
                        {badge.title}
                      </span>
                      {badge.unlocked && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> ได้รับแล้ว
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reset progress option */}
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-400">ยืนยันเริ่มใหม่ทั้งหมด?</span>
                <button
                  onClick={() => {
                    playClickSound();
                    onResetProgress();
                    setShowResetConfirm(false);
                    onClose();
                  }}
                  className="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition"
                >
                  ใช่, ล้างข้อมูล
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-1 text-xs bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  ยกเลิก
                </button>
              </div>
            ) : (
              <button
                onClick={() => { playClickSound(); setShowResetConfirm(true); }}
                className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" /> เริ่มต้นภารกิจใหม่ทั้งหมด
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
