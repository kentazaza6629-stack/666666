import React, { useState, useEffect, useRef } from 'react';
import { DetectiveProfile } from '../../types';
import {
  Send,
  Camera,
  CheckCircle2,
  Clock,
  GraduationCap,
  RotateCcw,
  X,
  HelpCircle,
  Info,
  FileText,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  CornerDownRight,
  Trash2
} from 'lucide-react';
import {
  playClickSound,
  playCorrectSound
} from '../../utils/sound';
import { dataService } from '../../lib/dataService';
import { orderBy, limit } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  sender: 'student' | 'teacher';
  senderName: string;
  senderAvatar: string;
  senderClassroom?: string;
  text: string;
  timestamp: number;
  timeString: string;
  imageUrl?: string;
  status?: 'waiting_teacher' | 'answered';
  replyToId?: string;
  replyToText?: string;
  teacherVerified?: boolean;
}

interface CommunityTeacherChatProps {
  profile: DetectiveProfile;
  onUpdateProfile: (updated: Partial<DetectiveProfile>) => void;
  onShowToast: (title: string, message: string, type?: 'exp' | 'badge') => void;
  initialQuery?: string;
  onOpenHomework?: () => void;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome_1',
    sender: 'teacher',
    senderName: 'คุณครูแสนดี (ครูผู้สอน)',
    senderAvatar: '👩‍🏫',
    text: 'สวัสดีจ้ะนักเรียนทุกคน! 🕵️‍♂️ นี่คือช่องทางพูดคุยและปรึกษาบทเรียนกับคุณครูโดยตรง\n\n📌 ข้อความในห้องนี้คุณครูจะเข้ามาอ่านและพิมพ์ตอบด้วยตนเองทุกข้อความ (ไม่มีบอทอัตโนมัติ)\nหากมีข้อสงสัยเรื่องการค้นหาข้อมูล การทำด่าน 1-6 หรือใบงานการบ้าน สามารถพิมพ์คำถามทิ้งไว้ได้เลยนะจ๊ะ!',
    timestamp: Date.now() - 7200000,
    timeString: '08:30 น.',
    teacherVerified: true
  }
];

export const CommunityTeacherChat: React.FC<CommunityTeacherChatProps> = ({
  profile,
  onShowToast,
  initialQuery,
  onOpenHomework
}) => {
  const isAuthTeacher = profile.authUser?.role === 'teacher';

  // Role toggle: allows teacher (or tester) to switch between student inquiry view and teacher answering view
  const [currentRole, setCurrentRole] = useState<'student' | 'teacher'>(
    isAuthTeacher ? 'teacher' : 'student'
  );

  useEffect(() => {
    if (!isAuthTeacher) {
      setCurrentRole('student');
    }
  }, [isAuthTeacher]);

  // Load chat messages from Firestore
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);

  const [inputMessage, setInputMessage] = useState(initialQuery || '');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'waiting'>('all');

  useEffect(() => {
    if (initialQuery) {
      setInputMessage(initialQuery);
    }
  }, [initialQuery]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time chat from Firestore
  useEffect(() => {
    const unsubscribe = dataService.subscribeCollection(
      'teacher_chat',
      [orderBy('timestamp', 'asc'), limit(100)],
      (data) => {
        if (data.length > 0) {
          const mappedMessages = data.map(m => ({
            ...m,
            timeString: new Date(m.timestamp?.seconds * 1000 || m.timestamp || Date.now()).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
          })) as ChatMessage[];
          setMessages(mappedMessages);
        } else {
          setMessages(DEFAULT_MESSAGES);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playClickSound();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImage(event.target.result as string);
          onShowToast('📷 แนบรูปภาพแล้ว', 'พร้อมส่งในข้อความแชท');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Send Message (STRICT: NO BOT SIMULATION - REAL USERS / TEACHERS ONLY)
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text && !attachedImage) return;

    playCorrectSound();

    const now = new Date();
    const timeString = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

    if (currentRole === 'teacher') {
      // Teacher real response
      const teacherName = profile.authUser?.name || 'คุณครูแสนดี (ครูผู้สอน)';
      const newMsg: any = {
        sender: 'teacher',
        senderName: teacherName,
        senderAvatar: '👩‍🏫',
        text: text,
        timestamp: Date.now(),
        imageUrl: attachedImage || undefined,
        teacherVerified: true,
        replyToId: replyingTo ? replyingTo.id : undefined,
        replyToText: replyingTo ? replyingTo.text.slice(0, 60) + (replyingTo.text.length > 60 ? '...' : '') : undefined
      };

      // If replying to a specific student message, update that message status to 'answered'
      if (replyingTo) {
        dataService.saveDoc('teacher_chat', replyingTo.id, { status: 'answered' });
      }

      dataService.addDoc('teacher_chat', newMsg);
      onShowToast('👩‍🏫 คุณครูส่งข้อความแล้ว', `ตอบกลับข้อความสำเร็จในฐานะคุณครูตัวจริง`, 'badge');
    } else {
      // Student inquiry - strictly waiting for real teacher
      const studentName = profile.name || profile.authUser?.name || 'นักเรียน ป.5';
      const studentClassroom = profile.authUser?.classroom || 'ป.5/1';
      const newMsg: any = {
        sender: 'student',
        senderName: studentName,
        senderAvatar: profile.avatar || '👦',
        senderClassroom: studentClassroom,
        text: text,
        timestamp: Date.now(),
        imageUrl: attachedImage || undefined,
        status: 'waiting_teacher'
      };

      dataService.addDoc('teacher_chat', newMsg);
      onShowToast('ส่งคำถามถึงคุณครูแล้ว 📨', 'ข้อความถูกบันทึกแล้ว กรุณารอคุณครูตัวจริงเข้ามาตอบกลับนะจ๊ะ');
    }

    setInputMessage('');
    setAttachedImage(null);
    setReplyingTo(null);
  };

  // Delete single message (for teacher)
  const handleDeleteMessage = (msgId: string) => {
    if (confirm('คุณครูต้องการลบข้อความนี้ใช่หรือไม่?')) {
      playClickSound();
      setMessages(prev => prev.filter(m => m.id !== msgId));
      onShowToast('ลบข้อความแล้ว', 'ลบข้อความออกจากห้องสนทนาเรียบร้อย');
    }
  };

  // Reset chat history
  const handleResetChat = () => {
    if (confirm('ต้องการล้างประวัติการสนทนาทั้งหมด และเริ่มบทสนทนาใหม่หรือไม่?')) {
      playClickSound();
      setMessages(DEFAULT_MESSAGES);
      onShowToast('ล้างบทสนทนาแล้ว', 'เริ่มการสนทนาใหม่เรียบร้อย');
    }
  };

  // Filter messages
  const displayedMessages = filterMode === 'waiting'
    ? messages.filter(m => m.sender === 'student' && m.status === 'waiting_teacher')
    : messages;

  const waitingCount = messages.filter(m => m.sender === 'student' && m.status === 'waiting_teacher').length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-[700px] animate-fadeIn">
      
      {/* CHAT HEADER */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30">
              👩‍🏫
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-emerald-800 ring-2 ring-emerald-300/40" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-white">ห้องสนทนาคุณครูผู้สอน</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3 h-3" />
                <span>ครูจริงตอบเท่านั้น</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-100 mt-0.5">
              <span>ไม่มีบอทอัตโนมัติ • คุณครูจะเข้ามาอ่านและพิมพ์ตอบด้วยตนเอง</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* ROLE SWITCHER TOGGLE (Visible ONLY to verified Teacher) */}
          {isAuthTeacher ? (
            <div className="flex items-center bg-black/25 p-1 rounded-2xl border border-white/20 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setCurrentRole('student');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentRole === 'student'
                    ? 'bg-white text-emerald-900 font-black shadow-sm'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                <span>👦 โหมดนักเรียน (ถาม)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setCurrentRole('teacher');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentRole === 'teacher'
                    ? 'bg-amber-300 text-slate-950 font-black shadow-sm'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>👩‍🏫 โหมดคุณครู (ตอบ)</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/20 border border-white/20 text-emerald-100 text-xs font-bold shadow-xs">
              <span>👦 ช่องสอบถามคุณครูผู้สอน</span>
            </div>
          )}

          {onOpenHomework && (
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onOpenHomework();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black transition flex items-center gap-1.5 border border-white/20 shadow-sm"
              title="สลับไปยังหน้าส่งงาน"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ไปที่</span><span>ส่งงาน</span>
            </button>
          )}

          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 transition"
            title="ล้างบทสนทนา"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STATUS & FILTER STRIP */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
            currentRole === 'teacher' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
          }`}>
            {currentRole === 'teacher' ? '👩‍🏫 คุณกำลังใช้งานในโหมด: คุณครูผู้สอน' : '👦 คุณกำลังใช้งานในโหมด: นักเรียนส่งคำถาม'}
          </span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-500 text-[11px] hidden sm:inline">
            {currentRole === 'teacher' ? 'คลิก "ตอบกลับ" ที่คำถามของนักเรียน หรือพิมพ์ตอบข้อความด้านล่าง' : 'พิมพ์คำถามทิ้งไว้ แล้วรอคุณครูตัวจริงเข้ามาตอบ'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              filterMode === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
            }`}
          >
            ทั้งหมด ({(messages || []).length})
          </button>
          <button
            onClick={() => setFilterMode('waiting')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filterMode === 'waiting' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>รอครูตอบ ({(messages || []).filter(m => m.sender === 'student' && m.status === 'waiting_teacher').length})</span>
          </button>
        </div>
      </div>

      {/* CHAT MESSAGES CONTAINER */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-slate-50/60 to-white">
        
        {/* Notice Card */}
        <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5 max-w-2xl mx-auto shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-black block">นโยบายความโปร่งใส (ห้องแชทครูจริงเท่านั้น):</span>
            <span className="text-emerald-800">
              ทุกข้อความจากคุณครูเกิดจากการพิมพ์ตอบโดยครูผู้สอนจริงเท่านั้น ไม่มีการสร้างข้อความอัตโนมัติหรือสวมรอยตอบ
            </span>
          </div>
        </div>

        {displayedMessages && displayedMessages.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl">
              💬
            </div>
            <p className="text-sm font-bold text-slate-500">ยังไม่มีข้อความในหมวดนี้</p>
            <p className="text-xs text-slate-400">พิมพ์ส่งคำถามหรือข้อสงสัยถึงคุณครูได้เลย</p>
          </div>
        )}

        {(displayedMessages || []).map((msg) => {
          const isMsgTeacher = msg.sender === 'teacher';
          const isWaiting = msg.sender === 'student' && msg.status === 'waiting_teacher';

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isMsgTeacher ? 'justify-start' : 'justify-end'}`}
            >
              {/* Teacher Avatar on Left */}
              {isMsgTeacher && (
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                  {msg.senderAvatar}
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5 ${isMsgTeacher ? 'text-left' : 'text-right'}`}>
                
                {/* Meta Header */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold px-1 justify-inherit">
                  {isMsgTeacher ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-[10px] flex items-center gap-1 shadow-xs">
                      <GraduationCap className="w-3 h-3 text-amber-700" />
                      <span>คุณครูผู้สอนตัวจริง</span>
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-md bg-teal-100 text-teal-800 font-black text-[10px]">
                      {msg.senderClassroom || 'นักเรียน ป.5'}
                    </span>
                  )}
                  <span className="text-slate-700">{msg.senderName}</span>
                  <span>•</span>
                  <span>{msg.timeString}</span>
                </div>

                {/* Reply To Reference Preview */}
                {msg.replyToText && (
                  <div className="p-2 rounded-xl bg-slate-100/90 border-l-4 border-emerald-500 text-[11px] text-slate-600 flex items-center gap-1.5 text-left mb-1">
                    <CornerDownRight className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="line-clamp-1 italic">ตอบกลับ: "{msg.replyToText}"</span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm relative group ${
                    isMsgTeacher
                      ? 'bg-white text-slate-800 border-2 border-emerald-200 rounded-bl-xs'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs font-medium'
                  }`}
                >
                  {msg.text}

                  {msg.imageUrl && (
                    <div className="mt-2.5 rounded-xl overflow-hidden border border-black/10 max-h-56 bg-slate-900 flex items-center justify-center">
                      <img src={msg.imageUrl} alt="แนบในแชท" className="max-h-56 object-contain" />
                    </div>
                  )}

                  {/* Teacher Verification Badge */}
                  {msg.teacherVerified && (
                    <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ยืนยัน: พิมพ์ตอบโดยคุณครูผู้สอนตัวจริง</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Student Status Badge & Teacher Reply Action */}
                <div className={`flex items-center gap-2 text-[11px] px-1 ${isMsgTeacher ? 'justify-start' : 'justify-end'}`}>
                  {!isMsgTeacher && isWaiting && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black flex items-center gap-1 border border-amber-300">
                      <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                      <span>รอคุณครูตอบกลับ</span>
                    </span>
                  )}

                  {!isMsgTeacher && msg.status === 'answered' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center gap-1 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>คุณครูตอบกลับแล้ว</span>
                    </span>
                  )}

                  {/* Action for Teachers to Reply or Delete */}
                  {currentRole === 'teacher' && (
                    <div className="flex items-center gap-1.5">
                      {!isMsgTeacher && (
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setReplyingTo(msg);
                            setInputMessage(`ถึง ${msg.senderName}: `);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black transition flex items-center gap-1 border border-emerald-300 shadow-2xs"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          <span>พิมพ์ตอบกลับนักเรียนคนนี้</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="px-2 py-0.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold transition flex items-center gap-1 border border-rose-300 text-[10px]"
                        title="ลบข้อความนี้"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>ลบข้อความ</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Student Avatar on Right */}
              {!isMsgTeacher && (
                <div className="w-10 h-10 rounded-2xl bg-teal-100 border border-teal-300 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                  {msg.senderAvatar}
                </div>
              )}
            </div>
          );
        })}

        <div ref={chatBottomRef} />
      </div>

      {/* REPLYING-TO BANNER */}
      {replyingTo && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2 overflow-hidden">
            <CornerDownRight className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-bold shrink-0">กำลังพิมพ์ตอบ: {replyingTo.senderName}</span>
            <span className="text-amber-700 truncate text-[11px]">"{replyingTo.text}"</span>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="p-1 rounded-full hover:bg-amber-200 text-amber-800 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ATTACHED IMAGE PREVIEW */}
      {attachedImage && (
        <div className="p-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src={attachedImage} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-300 shadow-xs" />
            <span className="text-xs text-slate-700 font-bold">แนบรูปภาพพร้อมส่ง</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="p-1.5 rounded-full bg-slate-200 hover:bg-rose-600 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* INPUT FORM AREA */}
      <div className="p-3.5 bg-white border-t border-slate-200 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition"
            title="แนบรูปภาพ"
          >
            <Camera className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={
              currentRole === 'teacher'
                ? 'พิมพ์ข้อความที่คุณครูต้องการตอบกลับนักเรียน (ส่งในฐานะครูจริง)...'
                : 'พิมพ์คำถามหรือข้อสงสัยถึงคุณครู (ส่งแล้วรอครูตอบ)...'
            }
            className={`flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 transition ${
              currentRole === 'teacher'
                ? 'bg-amber-50/70 border border-amber-200 text-amber-950 focus:ring-amber-500 placeholder:text-amber-700/60'
                : 'bg-slate-100 text-slate-800 focus:ring-emerald-500'
            }`}
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() && !attachedImage}
            className={`px-4 py-2.5 rounded-2xl text-white font-black text-xs sm:text-sm disabled:opacity-40 transition shadow-md active:scale-95 flex items-center gap-1.5 shrink-0 ${
              currentRole === 'teacher'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-600/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
            }`}
          >
            <span>{currentRole === 'teacher' ? 'ส่งคำตอบคุณครู' : 'ส่งคำถาม'}</span>
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>{currentRole === 'teacher' ? '👩‍🏫 คุณกำลังพิมพ์ในฐานะครูผู้สอนจริง ข้อความจะขึ้นตราสัญลักษณ์ยืนยัน' : '👦 ข้อความของนักเรียนจะถูกส่งเข้าระบบเพื่อให้คุณครูผู้สอนเข้ามาตอบ'}</span>
          <span className="hidden sm:inline">กด Enter เพื่อส่ง</span>
        </div>
      </div>

    </div>
  );
};
