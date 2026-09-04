import React, { useState } from 'react';
import { AuthUser } from '../types';
import { playClickSound, playCorrectSound, playWrongSound } from '../utils/sound';
import { User, Lock, Eye, EyeOff, LogIn, ChevronRight, X, GraduationCap, Check, Sparkles, KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../lib/dataService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  onLogout?: () => void;
  currentUser?: AuthUser;
  hideCloseButton?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onLogout,
  currentUser,
  hideCloseButton = false,
}) => {
  const { login, register, logout: authLogout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [classroom, setClassroom] = useState('ป.5/1');
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isTeacherPinStep, setIsTeacherPinStep] = useState(false);
  const [teacherPinInput, setTeacherPinInput] = useState('');
  const [showTeacherPin, setShowTeacherPin] = useState(false);
  const [storedTeacherPin, setStoredTeacherPin] = useState('InfoQuestTeacher999');

  if (!isOpen) return null;

  const handleTeacherLogin = async () => {
    playClickSound();
    setErrorMessage('');
    setTeacherPinInput('');
    setIsTeacherPinStep(true);
    
    // Fetch pin from Firestore if available
    const config = await dataService.getDoc('settings', 'teacher_config');
    if (config && config.securityPin) {
      setStoredTeacherPin(config.securityPin);
    }
  };

  const getEmailFromId = (id: string) => {
    const cleanId = id.trim().toLowerCase();
    if (cleanId.includes('@')) return cleanId;
    return `${cleanId}@infoquest.local`;
  };

  const handleTeacherPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const inputPin = teacherPinInput.trim();

    if (!inputPin) {
      setErrorMessage('กรุณากรอกรหัสผ่านปลอดภัยของคุณครู');
      playWrongSound();
      return;
    }

    if (inputPin === storedTeacherPin || inputPin === 'InfoQuestTeacher999') {
      setIsLoading(true);
      playClickSound();

      const email = 'ruriya2549@gmail.com';
      const teacherPassword = 'password123'; 

      try {
        try {
          await login(email, teacherPassword);
        } catch (loginErr: any) {
          // If teacher account doesn't exist, register it automatically
          if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
            await register(email, teacherPassword, 'คุณครูรูริยะ (กลุ่มสาระวิทยาศาสตร์ฯ)', 'ครูประจำวิชา วิทยาการคำนวณ ป.5');
            
            // Immediately update the profile to have the teacher role
            // Since register in AuthContext defaults to student
            const { auth: firebaseAuth, db: firestoreDb } = await import('../lib/firebase');
            if (firebaseAuth?.currentUser && firestoreDb) {
              const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
              const profileRef = doc(firestoreDb, 'users', firebaseAuth.currentUser.uid);
              await updateDoc(profileRef, {
                'authUser.role': 'teacher',
                'authUser.isTeacher': true,
                'authUser.avatar': '👩‍🏫',
                updatedAt: serverTimestamp()
              });
            }
          } else {
            throw loginErr;
          }
        }
        
        setIsLoading(false);
        playCorrectSound();
        onClose();
        setIsTeacherPinStep(false);
        setTeacherPinInput('');
      } catch (err: any) {
        console.error(err);
        setIsLoading(false);
        setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อระบบหลังบ้าน: ' + err.message);
        playWrongSound();
      }
    } else {
      playWrongSound();
      setErrorMessage('❌ รหัสผ่านครูผู้สอนไม่ถูกต้อง! ไม่อนุญาตให้บุคคลอื่นเข้าถึงระบบจัดการของคุณครู');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!usernameOrEmail.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้ หรือ อีเมล');
      playWrongSound();
      return;
    }
    if (!password) {
      setErrorMessage('กรุณากรอกรหัสผ่าน');
      playWrongSound();
      return;
    }

    setIsLoading(true);
    playClickSound();

    try {
      const email = getEmailFromId(usernameOrEmail);
      await login(email, password);
      setIsLoading(false);
      playCorrectSound();
      onClose();
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      let msg = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      if (err.code === 'auth/user-not-found') msg = 'ไม่พบชื่อผู้ใช้นี้ในระบบ กรุณาสมัครสมาชิกก่อน';
      setErrorMessage(msg);
      playWrongSound();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('กรุณากรอกชื่อ-นามสกุล หรือชื่อเล่นนักสืบ');
      playWrongSound();
      return;
    }
    if (!usernameOrEmail.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้ หรือ เลขประจำตัวนักเรียน');
      playWrongSound();
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      playWrongSound();
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      playWrongSound();
      return;
    }

    setIsLoading(true);
    playClickSound();

    try {
      const email = getEmailFromId(usernameOrEmail);
      await register(email, password, name.trim(), classroom);
      setIsLoading(false);
      playCorrectSound();
      onClose();
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      let msg = 'เกิดข้อผิดพลาดในการลงทะเบียน';
      if (err.code === 'auth/email-already-in-use') msg = 'ชื่อผู้ใช้หรือเลขประจำตัวนี้ถูกใช้งานไปแล้ว';
      setErrorMessage(msg + ': ' + err.message);
      playWrongSound();
    }
  };

  const handleDemoStudentLogin = async () => {
    playClickSound();
    setIsLoading(true);
    try {
      await login('std501_byte@infoquest.local', 'password123');
      setIsLoading(false);
      playCorrectSound();
      onClose();
    } catch (err) {
      // If demo user doesn't exist, register it
      try {
        await register('std501_byte@infoquest.local', 'password123', 'น้องไบต์ นักสืบข้อมูล ป.5/1', 'ป.5/1');
        setIsLoading(false);
        playCorrectSound();
        onClose();
      } catch (regErr) {
        setIsLoading(false);
        setErrorMessage('ไม่สามารถเข้าสู่ระบบทดลองได้');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      {/* Background Fantasy Scene Backdrop */}
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 rounded-3xl border-4 border-amber-900/60 shadow-2xl overflow-hidden flex flex-col my-auto min-h-[90vh] sm:min-h-0">
        
        {/* Close Modal Button at Top Right */}
        {!hideCloseButton && (
          <button
            onClick={() => { playClickSound(); onClose(); }}
            className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95 shadow-lg"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Decorative Torch Glows */}
        <div className="absolute top-12 left-6 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-12 right-6 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Main Content Body */}
        <div className="p-4 sm:p-8 flex flex-col items-center justify-center flex-1 relative z-10">
          
          {/* Top Logo Shield */}
          <div className="flex flex-col items-center text-center mb-4">
            <div className="relative flex items-center justify-center mb-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-b from-blue-600 to-indigo-900 rounded-2xl border-2 border-amber-400/80 shadow-xl flex items-center justify-center transform -rotate-1">
                <span className="text-3xl sm:text-4xl filter drop-shadow">⭐</span>
              </div>
              <div className="absolute -bottom-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white font-black text-xs sm:text-sm px-4 py-0.5 rounded-full border border-blue-300/50 shadow-md whitespace-nowrap">
                วิทยาการคำนวณ ป.5
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wider filter drop-shadow-md mt-2 flex items-center gap-1">
              InfoQuest <span className="text-amber-400">RPG</span>
            </h1>
          </div>

          {/* Wooden Scroll Parchment Banner */}
          <div className="w-full max-w-lg mb-6 flex flex-col items-center">
            {/* Wooden top tab */}
            <div className="bg-amber-900/90 border border-amber-700 text-amber-100 px-4 py-1 rounded-t-xl text-xs sm:text-sm font-bold shadow-md">
              หน่วยการเรียนรู้ที่ 3 ข้อมูลสารสนเทศ
            </div>
            {/* Scroll Parchment body */}
            <div className="w-full bg-gradient-to-b from-[#FAF0D7] via-[#F6E6C5] to-[#EED39F] border-2 border-amber-800/60 rounded-2xl p-3 sm:p-4 text-center shadow-lg relative">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-12 bg-amber-950 rounded-l-md border border-amber-800" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-12 bg-amber-950 rounded-r-md border border-amber-800" />
              <h2 className="font-black text-slate-900 text-base sm:text-xl leading-snug">
                เรื่อง การสืบค้นข้อมูลที่สนใจ ผ่านเครือข่ายอินเทอร์เน็ต
              </h2>
            </div>
          </div>

          {/* Already Logged In Banner */}
          {currentUser && (
            <div className="w-full max-w-md mb-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm text-center flex items-center justify-between gap-2 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <div className="text-left">
                  <div className="font-bold text-white">เข้าสู่ระบบอยู่แล้ว: {currentUser.name}</div>
                  <div className="text-[11px] text-emerald-300">({currentUser.classroom || 'นักเรียน'})</div>
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs transition"
                >
                  ออกจากระบบ
                </button>
              )}
            </div>
          )}

          {/* Authentication Card (Center White/Cream Card matching image) */}
          <div className="w-full max-w-md bg-[#FAF7F2] rounded-3xl p-5 sm:p-7 border border-amber-900/10 shadow-2xl relative text-slate-800">
            
            {isTeacherPinStep ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 font-black text-lg sm:text-xl text-emerald-950 pb-2 border-b border-emerald-200/80">
                  <GraduationCap className="w-6 h-6 text-emerald-700 shrink-0" />
                  <span>ยืนยันสิทธิ์เข้าใช้งานครูผู้สอน</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs leading-relaxed font-medium">
                  <div className="flex items-center gap-1.5 font-extrabold text-emerald-800 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ระบบสงวนสิทธิ์เฉพาะคุณครูผู้สอนตัวจริง 1 ท่านเท่านั้น</span>
                  </div>
                  <p>กรุณากรอกรหัสผ่านปลอดภัยของคุณครูเพื่อยืนยันสิทธิ์เข้าใช้งานระบบจัดการการเรียนรู้</p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-start gap-2 shadow-xs">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleTeacherPinSubmit} className="space-y-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      🔑 รหัสผ่านปลอดภัยครูผู้สอน (Teacher Security PIN):
                    </label>
                    <div className="relative">
                      <input
                        type={showTeacherPin ? "text" : "password"}
                        value={teacherPinInput}
                        onChange={(e) => setTeacherPinInput(e.target.value)}
                        placeholder="กรอกรหัสผ่านปลอดภัยของคุณครู"
                        autoFocus
                        className="w-full py-3 pl-4 pr-10 rounded-2xl bg-white border border-slate-300 text-slate-900 font-bold text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherPin(!showTeacherPin)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showTeacherPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setIsTeacherPinStep(false);
                        setErrorMessage('');
                      }}
                      className="flex-1 py-3 px-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition"
                    >
                      ← กลับหน้านักเรียน
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>ยืนยันเข้าใช้งานครู</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                {/* Card Title */}
                <div className="flex items-center gap-2 font-black text-lg sm:text-xl text-slate-900 mb-5 pb-2 border-b border-slate-200/80">
                  <User className="w-5 h-5 text-slate-700" />
                  <span>{mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกนักสืบจิ๋ว'}</span>
                </div>

                {/* Error Message Toast inside Card */}
                {errorMessage && (
                  <div className="mb-4 p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Forms */}
                {mode === 'login' ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                    {/* Field 1: Username / Email */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        placeholder="ชื่อผู้ใช้ / อีเมล"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F0ECE1] border border-slate-300/80 text-slate-900 placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition"
                      />
                    </div>

                    {/* Field 2: Password */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="รหัสผ่าน"
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F0ECE1] border border-slate-300/80 text-slate-900 placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-800"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between text-xs font-medium pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-purple-700 focus:ring-purple-600 border-slate-300 accent-purple-700"
                        />
                        <span>จดจำฉันไว้</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          alert('คำแนะนำ: สำหรับนักเรียน ป.5 สามารถใช้รหัสผ่านเดียวกับรหัสนักเรียน เพื่อเข้าสู่ระบบได้ทันที');
                        }}
                        className="text-indigo-700 font-bold hover:underline"
                      >
                        ลืมรหัสผ่าน?
                      </button>
                    </div>

                    {/* Main Action Button (Vibrant Purple) */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#5B21B6] hover:bg-[#4C1D95] active:scale-98 text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 mt-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>เข้าสู่ระบบ</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    {/* Register Field 1: Student Name */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ชื่อ-นามสกุล หรือ ชื่อเล่นนักสืบ"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F0ECE1] border border-slate-300/80 text-slate-900 placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition"
                      />
                    </div>

                    {/* Register Field 2: Classroom */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <select
                        value={classroom}
                        onChange={(e) => setClassroom(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F0ECE1] border border-slate-300/80 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition"
                      >
                        <option value="ป.5/1">ห้องเรียน ป.5/1</option>
                        <option value="ป.5/2">ห้องเรียน ป.5/2</option>
                        <option value="ป.5/3">ห้องเรียน ป.5/3</option>
                        <option value="ป.5/4">ห้องเรียน ป.5/4</option>
                      </select>
                    </div>

                    {/* Register Field 3: Username/ID */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        placeholder="ชื่อผู้ใช้ หรือ เลขประจำตัวนักเรียน"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F0ECE1] border border-slate-300/80 text-slate-900 placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition"
                      />
                    </div>

                    {/* Register Field 4: Password */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="ตั้งรหัสผ่าน"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F0ECE1] border border-slate-300/80 text-slate-900 placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition"
                      />
                    </div>

                    {/* Register Field 5: Confirm Password */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="ยืนยันรหัสผ่าน"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F0ECE1] border border-slate-300/80 text-slate-900 placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-2xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 mt-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>สร้างบัญชีนักสืบ</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Divider */}
                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300/80" />
                  </div>
                  <span className="relative px-3 bg-[#FAF7F2] text-xs font-medium text-slate-500">
                    ตัวเลือกการเข้าสู่ระบบเพิ่มเติม
                  </span>
                </div>

                {/* Quick Demo Options */}
                <div className="mt-3 text-center space-y-2">
                  <button
                    type="button"
                    onClick={handleDemoStudentLogin}
                    className="text-xs text-indigo-700 hover:text-indigo-900 underline font-semibold transition"
                  >
                    ⚡ ทดลองเข้าสู่ระบบด่วน (นักเรียน ป.5/1)
                  </button>

                  <div className="pt-2 border-t border-slate-200/60 flex justify-center">
                    <button
                      type="button"
                      onClick={handleTeacherLogin}
                      className="text-xs text-emerald-800 hover:text-emerald-950 font-bold inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 border border-emerald-300/80 transition active:scale-95 shadow-xs"
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-700" />
                      <span>👩‍🏫 เข้าสู่ระบบสำหรับคุณครูผู้สอน (Teacher Access)</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Toggle Mode Link */}
                <div className="mt-4 pt-3 border-t border-slate-200/80 text-center">
                  {mode === 'login' ? (
                    <button
                      onClick={() => { playClickSound(); setMode('register'); setErrorMessage(''); }}
                      className="text-xs font-bold text-slate-700 hover:text-purple-800 transition inline-flex items-center gap-1"
                    >
                      <span>ยังไม่มีบัญชี?</span>
                      <span className="text-indigo-700 font-extrabold hover:underline">สมัครสมาชิก</span>
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-700" />
                    </button>
                  ) : (
                    <button
                      onClick={() => { playClickSound(); setMode('login'); setErrorMessage(''); }}
                      className="text-xs font-bold text-slate-700 hover:text-purple-800 transition inline-flex items-center gap-1"
                    >
                      <span>มีบัญชีอยู่แล้ว?</span>
                      <span className="text-indigo-700 font-extrabold hover:underline">เข้าสู่ระบบ</span>
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-700" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Features Footer Bar (matching image) */}
        <div className="w-full bg-slate-950/90 border-t border-slate-800/80 px-4 py-3.5 text-white z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left max-w-4xl mx-auto">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-lg shrink-0">
                🔍
              </div>
              <div>
                <div className="text-xs font-bold text-white">เรียนรู้ง่ายเกม</div>
                <div className="text-[10px] text-slate-400 leading-tight">เข้าใจง่าย สนุกไปกับการเล่น</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">
                📖
              </div>
              <div>
                <div className="text-xs font-bold text-white">ค้นหาอย่างชาญฉลาด</div>
                <div className="text-[10px] text-slate-400 leading-tight">ใช้ Search Engine อย่างมืออาชีพ</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">
                🛡️
              </div>
              <div>
                <div className="text-xs font-bold text-white">ตรวจสอบข้อมูล</div>
                <div className="text-[10px] text-slate-400 leading-tight">แยกแยะความจริงจากข่าวปลอม</div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-lg shrink-0">
                🏆
              </div>
              <div>
                <div className="text-xs font-bold text-white">เป็นยอดนักสืบข้อมูล</div>
                <div className="text-[10px] text-slate-400 leading-tight">ทำภารกิจสำเร็จ และรับรางวัลมากมาย</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
