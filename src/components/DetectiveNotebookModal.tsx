import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Search,
  BookOpen,
  Edit3,
  Bookmark,
  Download,
  Star,
  MoreHorizontal,
  Play,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { playClickSound } from '../utils/sound';

import { DetectiveProfile } from '../types';
import { dataService } from '../lib/dataService';

interface DetectiveNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: 'search' | 'lessons' | 'notes' | 'bookmarks' | 'downloads';
  profile: DetectiveProfile;
}

interface LessonChapter {
  timeSec: number;
  timeLabel: string;
  title: string;
  desc: string;
  icon: string;
  badge?: string;
}

const LESSON_CHAPTERS: LessonChapter[] = [
  {
    timeSec: 0,
    timeLabel: '00:00',
    title: 'บทนำ: อินเทอร์เน็ตเครือข่ายโลก',
    desc: 'รู้จักเครือข่ายอินเทอร์เน็ต การเชื่อมต่ออุปกรณ์ และการค้นหาความรู้',
    icon: '🌐',
    badge: 'พื้นฐาน'
  },
  {
    timeSec: 51,
    timeLabel: '00:51',
    title: 'เครื่องมือค้นหา (Search Engine)',
    desc: 'รู้จัก Google, Bing, Yahoo!, DuckDuckGo ช่วยพาเราท่องเว็บ',
    icon: '🔍',
    badge: 'เครื่องมือ'
  },
  {
    timeSec: 68,
    timeLabel: '01:08',
    title: 'กำหนดเรื่อง & ดึงคำสำคัญ (Keyword)',
    desc: 'แทนที่จะพิมพ์คำถามยาวๆ ให้ดึงคำสำคัญ เช่น "อาหารของผีเสื้อ"',
    icon: '🎯',
    badge: 'เทคนิค'
  },
  {
    timeSec: 91,
    timeLabel: '01:31',
    title: 'ตัวอย่างคีย์เวิร์ดตรงเป้าหมาย',
    desc: 'วิธีปลูกมะเขือเทศ, ช้าง ลักษณะ, สถานที่ท่องเที่ยว ภูเก็ต, ประหยัดไฟฟ้า',
    icon: '🔑',
    badge: 'ตัวอย่าง'
  },
  {
    timeSec: 120,
    timeLabel: '02:00',
    title: '5 ขั้นตอนสืบค้นอย่างมีประสิทธิภาพ',
    desc: '1.กำหนดเรื่อง 2.เลือกคีย์เวิร์ด 3.พิมพ์ค้นหา 4.ตรวจสอบ 5.นำไปใช้',
    icon: '🪜',
    badge: 'สำคัญมาก'
  },
  {
    timeSec: 161,
    timeLabel: '02:41',
    title: 'อย่าเชื่อทันที! ตรวจสอบความน่าเชื่อถือ',
    desc: 'ดูชื่อผู้เผยแพร่ แหล่งที่มา วันที่ปรับปรุง และความน่าเชื่อถือ',
    icon: '⚠️',
    badge: 'ระวัง'
  },
  {
    timeSec: 181,
    timeLabel: '03:01',
    title: 'แหล่งข้อมูลที่น่าเชื่อถือ (.ac.th, .go.th)',
    desc: 'เว็บสถานศึกษา หน่วยงานราชการ สำนักข่าว และผู้เชี่ยวชาญ',
    icon: '🏛️',
    badge: 'ความรู้'
  },
  {
    timeSec: 199,
    timeLabel: '03:19',
    title: 'วิธีรับมือเมื่อแต่ละเว็บข้อมูลไม่ตรงกัน',
    desc: 'อ่านจากหลายแหล่ง วิเคราะห์ เปรียบเทียบ และเลือกที่มีหลักฐานชัดเจน',
    icon: '⚖️',
    badge: 'คิดวิเคราะห์'
  },
  {
    timeSec: 221,
    timeLabel: '03:41',
    title: 'รู้จักปกป้องข้อมูลส่วนตัว',
    desc: 'ห้ามเผยแพร่รหัสผ่าน บัตรประชาชน ที่อยู่ หรือเบอร์โทรศัพท์เด็ดขาด',
    icon: '🔒',
    badge: 'ความปลอดภัย'
  },
  {
    timeSec: 237,
    timeLabel: '03:57',
    title: 'สิ่งที่ควรทำ vs สิ่งที่ห้ามทำ',
    desc: 'ควรสรุปด้วยภาษาตนเอง & อ้างอิงแหล่งที่มา | ห้ามคัดลอกผลงานคนอื่น',
    icon: '📋',
    badge: 'มารยาท'
  },
  {
    timeSec: 255,
    timeLabel: '04:15',
    title: 'มินิเกมตอบคำถาม 3 ข้อ',
    desc: 'ทดสอบความเข้าใจเรื่องคำค้นหา ความน่าเชื่อถือ และข้อมูลส่วนตัว',
    icon: '🎮',
    badge: 'ควิซ'
  },
  {
    timeSec: 287,
    timeLabel: '04:47',
    title: 'สรุปบทเรียน: คาถายอดนักสืบ',
    desc: '"ค้นให้ตรง ตรวจให้ชัวร์ ใช้อย่างปลอดภัย" พัฒนาสมองไปด้วยกัน',
    icon: '⭐',
    badge: 'สรุปจบ'
  },
];

// IndexedDB helpers for persisting user custom video in browser permanently
const DB_NAME = 'DetectiveVideoDB';
const STORE_NAME = 'videos';

function saveVideoToIndexedDB(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(blob, 'custom_lesson_video');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      request.onerror = () => reject(request.error);
    } catch (e) {
      reject(e);
    }
  });
}

function loadVideoFromIndexedDB(): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          resolve(null);
          return;
        }
        const tx = db.transaction(STORE_NAME, 'readonly');
        const getReq = tx.objectStore(STORE_NAME).get('custom_lesson_video');
        getReq.onsuccess = () => resolve(getReq.result || null);
        getReq.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function deleteVideoFromIndexedDB(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onsuccess = () => {
        const db = request.result;
        if (db.objectStoreNames.contains(STORE_NAME)) {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).delete('custom_lesson_video');
          tx.oncomplete = () => resolve();
        } else {
          resolve();
        }
      };
      request.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export const DetectiveNotebookModal: React.FC<DetectiveNotebookModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'lessons',
  profile,
}) => {
  const [activeTopic, setActiveTopic] = useState<'search' | 'lessons' | 'notes' | 'bookmarks' | 'downloads'>(initialTopic);
  const [videoSrc, setVideoSrc] = useState<string>('/lesson.mp4');
  const [isUserCustomVideo, setIsUserCustomVideo] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [myNotes, setMyNotes] = useState<string>(profile.myNotes || '• จำคาถา: ค้นให้ตรง ตรวจให้ชัวร์ ใช้อย่างปลอดภัย\n• นามสกุลเว็บ .ac.th (การศึกษา), .go.th (รัฐบาล)\n• ห้ามเผยแพร่ข้อมูลส่วนตัวเด็ดขาด!');
  const [isSavedNotes, setIsSavedNotes] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync notes from profile
  useEffect(() => {
    if (profile.myNotes) {
      setMyNotes(profile.myNotes);
    }
  }, [profile.myNotes]);

  // Load teacher config (video source) from Firestore
  useEffect(() => {
    const unsubConfig = dataService.subscribeDoc('settings', 'teacher_config', (data) => {
      if (data && data.customVideoSrc) {
        setVideoSrc(data.customVideoSrc);
        setIsUserCustomVideo(data.isCustomVideo || false);
      }
    });
    return () => unsubConfig();
  }, []);

  // Load custom video from IndexedDB on component mount (keeping for local offline support)
  useEffect(() => {
    loadVideoFromIndexedDB().then((blob) => {
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        setVideoSrc(objectUrl);
        setIsUserCustomVideo(true);
      }
    });
  }, []);

  if (!isOpen) return null;

  const handleSeek = (seconds: number, index: number) => {
    playClickSound();
    setActiveChapterIndex(index);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  const processVideoFile = async (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.endsWith('.mp4') && !file.name.endsWith('.webm')) {
      alert('กรุณาเลือกไฟล์วิดีโอ (.mp4, .webm)');
      return;
    }

    playClickSound();
    setUploadStatus('กำลังประมวลผลวิดีโอของคุณ...');
    
    // 1. Instant local playback
    const objectUrl = URL.createObjectURL(file);
    setVideoSrc(objectUrl);
    setIsUserCustomVideo(true);
    dataService.saveDoc('settings', 'teacher_config', { isCustomVideo: true });

    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }

    // 2. Persist in IndexedDB
    try {
      await saveVideoToIndexedDB(file);
    } catch (e) {
      console.warn('IndexedDB save warning:', e);
    }

    // 3. Upload to server to make it persistent app-wide
    try {
      const formData = new FormData();
      formData.append('video', file);
      const res = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadStatus('✅ บันทึกวิดีโอของคุณเรียบร้อยแล้ว!');
        setTimeout(() => setUploadStatus(null), 3500);
      } else {
        setUploadStatus('✅ ใช้วิดีโอของคุณในเครื่องเรียบร้อย');
        setTimeout(() => setUploadStatus(null), 3000);
      }
    } catch {
      setUploadStatus('✅ ใช้วิดีโอของคุณในเครื่องเรียบร้อย');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processVideoFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processVideoFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (tempUrl.trim()) {
      playClickSound();
      setVideoSrc(tempUrl.trim());
      setIsUserCustomVideo(true);
      dataService.saveDoc('settings', 'teacher_config', { customVideoSrc: tempUrl.trim(), isCustomVideo: true });
      setShowUrlInput(false);
      setTempUrl('');
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleResetVideo = async () => {
    playClickSound();
    setVideoSrc('/lesson.mp4');
    setIsUserCustomVideo(false);
    dataService.saveDoc('settings', 'teacher_config', { customVideoSrc: '/lesson.mp4', isCustomVideo: false });
    await deleteVideoFromIndexedDB();
    if (videoRef.current) {
      videoRef.current.load();
    }
    setUploadStatus('รีเซ็ตกลับเป็นวิดีโอค่าเริ่มต้น');
    setTimeout(() => setUploadStatus(null), 2000);
  };

  const handleSaveNotes = () => {
    playClickSound();
    if (profile.authUser?.id) {
      dataService.saveDoc('users', profile.authUser.id, { myNotes });
      setIsSavedNotes(true);
      setTimeout(() => setIsSavedNotes(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-[480px] sm:max-w-[540px] rounded-[32px] bg-gradient-to-b from-[#708AF5] to-[#7B66F0] shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-5 py-4 sm:py-5 flex items-center gap-3 text-white relative">
          {/* Sparkles */}
          <div className="absolute top-2 left-6 text-white/50 text-xl animate-pulse">✨</div>
          <div className="absolute top-4 right-16 text-white/50 text-sm animate-pulse">✨</div>
          
          <button
            onClick={() => { playClickSound(); onClose(); }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white text-[#7B66F0] flex items-center justify-center font-black active:scale-95 shadow-sm hover:bg-slate-50 transition-colors z-10"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 sm:w-14 sm:h-14 relative flex items-center justify-center flex-shrink-0 z-10">
            <span className="text-[40px] sm:text-[48px] drop-shadow-md">📘</span>
          </div>
          <div className="pr-8 z-10">
            <h2 className="text-xl sm:text-2xl font-black drop-shadow-sm leading-tight">
              บันทึกของฉัน
            </h2>
            <p className="text-[11px] font-medium text-white/90 mt-0.5">
              คลังสรุปความรู้ วิดีโอบทเรียน และเทคนิคสืบค้นข้อมูล
            </p>
          </div>
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 bg-white mx-2 mb-2 rounded-[28px] overflow-hidden flex flex-col relative shadow-inner min-h-0">
          
          {/* Tab Filters */}
          <div className="px-2 pt-2 bg-white flex-shrink-0">
            <div className="flex items-center justify-between pb-1 px-1 border-b-2 border-slate-100">
              {[
                { id: 'lessons', label: 'บทเรียน', icon: BookOpen },
                { id: 'search', label: 'คำค้นหา', icon: Search },
                { id: 'notes', label: 'โน้ตของฉัน', icon: Edit3 },
                { id: 'bookmarks', label: 'คั่นหน้า', icon: Bookmark },
                { id: 'downloads', label: 'ดาวน์โหลด', icon: Download },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTopic === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { playClickSound(); setActiveTopic(tab.id as any); }}
                    className={`flex flex-col items-center justify-center gap-1.5 w-16 py-2.5 sm:py-3 transition-all relative ${
                      isActive ? 'text-[#3B82F6]' : 'text-slate-400 hover:text-[#3B82F6]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#3B82F6]' : 'text-slate-400'}`} />
                    <span className={`text-[10px] font-bold ${isActive ? 'text-[#3B82F6]' : 'text-slate-500'}`}>
                      {tab.label}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-2 right-2 h-1 bg-[#3B82F6] rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List / Content Area */}
          <div className="px-3 py-3 overflow-y-auto no-scrollbar flex-1 space-y-3">
            
            {/* 1. LESSONS (VIDEO PLAYER + CHAPTERS) */}
            {activeTopic === 'lessons' && (
              <div className="space-y-3 animate-fadeIn">
                
                {/* Video Player Card */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`bg-slate-900 rounded-[22px] p-2.5 sm:p-3 border transition-all duration-200 shadow-md relative ${
                    isDraggingOver 
                      ? 'border-cyan-400 ring-4 ring-cyan-400/30 scale-[1.01]' 
                      : 'border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[10px] font-black">
                        วิทยาการคำนวณ ป.5
                      </span>
                      <span className="text-[11px] text-slate-300 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> ~5:22 นาที
                      </span>
                      {isUserCustomVideo && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold animate-pulse">
                          🎬 วิดีโอของคุณ
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleResetVideo}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                      title="รีเซ็ตเป็นไฟล์เริ่มต้น"
                    >
                      <RotateCcw className="w-3 h-3" /> รีเซ็ต
                    </button>
                  </div>

                  {/* Status Banner if uploading/saving */}
                  {uploadStatus && (
                    <div className="mb-2 px-2.5 py-1.5 rounded-xl bg-indigo-950 border border-indigo-500/50 text-indigo-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                      <span className="animate-spin text-sm">⏳</span> {uploadStatus}
                    </div>
                  )}

                  {/* HTML5 Video Player with Drag-and-Drop overlay */}
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-inner group">
                    <video
                      ref={videoRef}
                      src={videoSrc}
                      poster="/images/lesson_cover_1788449303287.jpg"
                      preload="auto"
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    >
                      <source src={videoSrc} type="video/mp4" />
                      เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                    </video>

                    {/* Drag-over prompt overlay */}
                    {isDraggingOver && (
                      <div className="absolute inset-0 bg-indigo-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-white border-2 border-dashed border-cyan-400 rounded-2xl z-20 pointer-events-none animate-fadeIn">
                        <span className="text-4xl animate-bounce mb-2">📥</span>
                        <p className="font-black text-sm text-cyan-300">วางไฟล์วิดีโอที่นี่</p>
                        <p className="text-[11px] text-slate-300">เพื่อเล่นและบันทึกวิดีโอของคุณทันที</p>
                      </div>
                    )}
                  </div>

                  {/* Notice & Quick Action to Upload User's Video */}
                  <div className="mt-2 p-2 rounded-xl bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-indigo-200">
                      <span>📁</span>
                      <span>ลากไฟล์วิดีโอมาวาง หรือกดเลือกไฟล์:</span>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 transition shrink-0 active:scale-95"
                    >
                      <Upload className="w-3 h-3" /> เลือกไฟล์วิดีโอของคุณ
                    </button>
                  </div>

                  {/* Video Control / Source bar */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <LinkIcon className="w-3 h-3" /> ใส่ URL
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[170px]">
                      {isUserCustomVideo ? '✅ วิดีโอที่คุณเพิ่ม' : 'ไฟล์: lesson.mp4'}
                    </span>
                  </div>

                  {/* URL Input Form if toggled */}
                  {showUrlInput && (
                    <div className="mt-2 p-2 rounded-xl bg-slate-800/90 border border-slate-700 flex gap-2">
                      <input
                        type="text"
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                        placeholder="วางลิงก์วิดีโอ MP4 หรือ URL..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                      />
                      <button
                        onClick={handleApplyUrl}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition"
                      >
                        ใช้งาน
                      </button>
                    </div>
                  )}
                </div>

                {/* Golden Rule Banner from Video */}
                <div className="p-3 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-[20px] border border-amber-200/90 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-sm">
                    ✨
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-wide">
                      คาถาจำง่ายประจำบทเรียน
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-amber-950 leading-snug">
                      "ค้นให้ตรง • ตรวจให้ชัวร์ • ใช้อย่างปลอดภัย"
                    </h4>
                  </div>
                </div>

                {/* Interactive Video Chapters Heading */}
                <div className="flex items-center justify-between px-1 pt-1">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span>📑 ไทม์ไลน์บทเรียนในคลิป</span>
                    <span className="text-[10px] font-normal text-slate-400">(แตะเพื่อข้ามไปเวลาดังกล่าว)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-blue-600">12 หัวข้อ</span>
                </div>

                {/* Chapters List */}
                <div className="space-y-1.5">
                  {LESSON_CHAPTERS.map((chapter, idx) => {
                    const isCurrent = activeChapterIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSeek(chapter.timeSec, idx)}
                        className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-start gap-2.5 ${
                          isCurrent
                            ? 'bg-blue-50/90 border-blue-300 shadow-sm'
                            : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center text-base ${
                          isCurrent ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {chapter.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h5 className={`text-xs font-black truncate ${isCurrent ? 'text-blue-900' : 'text-slate-800'}`}>
                              {chapter.title}
                            </h5>
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-100/70 text-blue-700 text-[10px] font-black shrink-0 flex items-center gap-0.5">
                              <Play className="w-2.5 h-2.5 fill-current" /> {chapter.timeLabel}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                            {chapter.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            )}

            {/* 2. SEARCH SPELLS / KEYWORDS */}
            {activeTopic === 'search' && (
              <>
                {/* Item 1 */}
                <div className="p-3 bg-[#FFF9E6] border border-[#FFE082] rounded-[20px] flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#FFB300] flex items-center justify-center text-white text-3xl font-black shadow-inner">
                    “ ”
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-[#F57F17] flex items-center gap-1">
                      <span className="text-[#FFB300]">“ ”</span> (อัญประกาศ)
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium">ใช้ครอบกลุ่มคำที่ต้องเรียงติดกันเป๊ะๆ</p>
                    <p className="text-[10px] text-slate-500">เช่น "สัตว์ป่าสงวนของไทย" จะไม่แยกคำ</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0 pr-1">
                    <button className="w-8 h-8 rounded-full bg-white text-[#FFCA28] flex items-center justify-center shadow-sm border border-slate-100 hover:scale-105 active:scale-95 transition-transform">
                      <Star className="w-4 h-4 fill-[#FFCA28]" />
                    </button>
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="p-3 bg-[#FFF0F0] border border-[#FFCDD2] rounded-[20px] flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#EF5350] flex items-center justify-center text-white text-3xl font-black shadow-inner pb-1">
                    -
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-[#D32F2F] flex items-center gap-1">
                      <span className="text-[#EF5350]">-</span> (เครื่องหมายลบ)
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium">ตัดคำที่ไม่ต้องการ</p>
                    <p className="text-[10px] text-slate-500 leading-tight">พิมพ์ติดกับคำที่ต้องการตัดออก เช่น ไวรัส -คอมพิวเตอร์<br/>(ค้นหาเฉพาะเชื้อโรคชีวภาพ)</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0 pr-1">
                    <button className="w-8 h-8 rounded-full bg-white text-[#FFCA28] flex items-center justify-center shadow-sm border border-slate-100 hover:scale-105 active:scale-95 transition-transform">
                      <Star className="w-4 h-4 fill-[#FFCA28]" />
                    </button>
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="p-3 bg-[#F0F4FF] border border-[#BBDEFB] rounded-[20px] flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-[13px] font-black shadow-inner">
                    site:
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-[#1E3A8A] flex items-center gap-1">
                      <span className="text-[#3B82F6]">site:</span> เว็บไซต์/โดเมน
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium">ระบุค้นหาเฉพาะเว็บภาครัฐหรือการศึกษา</p>
                    <p className="text-[10px] text-slate-500">เช่น สรุปราคา site:.go.th</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0 pr-1">
                    <button className="w-8 h-8 rounded-full bg-white text-[#FFCA28] flex items-center justify-center shadow-sm border border-slate-100 hover:scale-105 active:scale-95 transition-transform">
                      <Star className="w-4 h-4 fill-[#FFCA28]" />
                    </button>
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="p-3 bg-[#F5F0FF] border border-[#E1BEE7] rounded-[20px] flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#AB47BC] flex items-center justify-center text-white text-[10px] font-black shadow-inner text-center leading-none">
                    file<br/>type:
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-[#7B1FA2] flex items-center gap-1">
                      <span className="text-[#AB47BC]">filetype:</span> ระบุชนิดไฟล์เอกสาร
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium">ค้นหาเอกสารสรุป/รายงาน เช่น ภาวะโลกร้อน filetype:pdf</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0 pr-1">
                    <button className="w-8 h-8 rounded-full bg-white text-[#FFCA28] flex items-center justify-center shadow-sm border border-slate-100 hover:scale-105 active:scale-95 transition-transform">
                      <Star className="w-4 h-4 fill-[#FFCA28]" />
                    </button>
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* 3. NOTES (STUDENT SCRATCHPAD) */}
            {activeTopic === 'notes' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <h4 className="text-xs font-black text-amber-900 flex items-center gap-1 mb-1">
                    <Edit3 className="w-3.5 h-3.5" /> โน้ตย่อส่วนตัวของนักสืบ
                  </h4>
                  <p className="text-[10px] text-amber-700">จดสรุปคำศัพท์ เทคนิค หรือสิ่งที่ได้เรียนรู้จากคลิปวิดีโอ</p>
                </div>

                <textarea
                  value={myNotes}
                  onChange={(e) => setMyNotes(e.target.value)}
                  rows={8}
                  placeholder="พิมพ์บันทึกย่อของคุณที่นี่..."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 leading-relaxed resize-none"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                  >
                    {isSavedNotes ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    <span>{isSavedNotes ? 'บันทึกเรียบร้อย!' : 'บันทึกโน้ต'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. BOOKMARKS */}
            {activeTopic === 'bookmarks' && (
              <div className="space-y-2.5 animate-fadeIn">
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                  <h4 className="text-xs font-black text-blue-900 flex items-center gap-1 mb-0.5">
                    <Bookmark className="w-3.5 h-3.5" /> รายการที่คั่นหน้าไว้
                  </h4>
                  <p className="text-[10px] text-blue-700">เข้าถึงเทคนิคที่บันทึกไว้ได้อย่างรวดเร็ว</p>
                </div>

                <div className="p-3 rounded-2xl border border-slate-100 bg-white flex items-center gap-3">
                  <span className="text-xl">⭐️</span>
                  <div className="flex-1">
                    <h5 className="text-xs font-black text-slate-800">5 ขั้นตอนสืบค้นข้อมูล</h5>
                    <p className="text-[10px] text-slate-500">กำหนดเรื่อง &gt; คำสำคัญ &gt; พิมพ์ค้น &gt; ตรวจสอบ &gt; ใช้งาน</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-slate-100 bg-white flex items-center gap-3">
                  <span className="text-xl">🏛️</span>
                  <div className="flex-1">
                    <h5 className="text-xs font-black text-slate-800">โดเมนที่เชื่อถือได้</h5>
                    <p className="text-[10px] text-slate-500">.ac.th (การศึกษา), .go.th (หน่วยงานราชการ)</p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. DOWNLOADS */}
            {activeTopic === 'downloads' && (
              <div className="space-y-2.5 animate-fadeIn">
                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                  <h4 className="text-xs font-black text-purple-900 flex items-center gap-1 mb-0.5">
                    <Download className="w-3.5 h-3.5" /> สื่อการเรียนรู้สำหรับดาวน์โหลด
                  </h4>
                  <p className="text-[10px] text-purple-700">แผ่นพับสรุปและใบงานวิชาวิทยาการคำนวณ ป.5</p>
                </div>

                <div className="p-3 rounded-2xl border border-slate-100 bg-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h5 className="text-xs font-black text-slate-800">แผ่นพับสรุป 5 ขั้นตอนสืบค้น</h5>
                      <p className="text-[10px] text-slate-400">PDF • 1.2 MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { playClickSound(); alert('ระบบกำลังเตรียมไฟล์สรุปบทเรียน...'); }}
                    className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs hover:bg-purple-200 transition"
                  >
                    ดาวน์โหลด
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Area (Hint & Action) */}
          <div className="p-3 sm:p-4 bg-white relative rounded-b-[28px] border-t border-slate-100 flex-shrink-0">
            {/* Robot Mascot Overlay */}
            <div className="absolute right-3 -top-10 z-20 pointer-events-none">
              <span className="text-5xl sm:text-6xl drop-shadow-lg filter animate-pulse">🤖</span>
              <span className="text-2xl sm:text-3xl absolute -left-2 top-4 drop-shadow-md filter">🔎</span>
            </div>

            {/* Dynamic Hint Box based on tab */}
            <div className="p-2.5 sm:p-3 bg-[#F0F7FF] rounded-2xl border border-[#D6E8FB] flex items-start gap-2.5 mb-2.5 pr-16 relative z-10">
              <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm text-[#F59E0B] text-base sm:text-lg">
                💡
              </div>
              <div className="pt-0.5 min-w-0">
                <h5 className="text-[11px] sm:text-xs font-black text-[#1E40AF]">
                  {activeTopic === 'lessons' ? 'เคล็ดลับการชมคลิป' : 'เคล็ดลับการค้นหา'}
                </h5>
                <p className="text-[10px] text-[#3B82F6] font-medium leading-relaxed mt-0.5 truncate sm:whitespace-normal">
                  {activeTopic === 'lessons' 
                    ? 'แตะที่หัวข้อเวลาเพื่อข้ามไปยังจุดที่ต้องการทบทวนได้ทันที!' 
                    : 'ลองผสมผสานเทคนิคต่างๆ เพื่อให้ได้ผลลัพธ์ที่ตรงใจมากขึ้น!'}
                </p>
              </div>
            </div>
            
            {/* Bottom Action Button */}
            {activeTopic === 'lessons' ? (
              <button
                onClick={() => {
                  playClickSound();
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play().catch(() => {});
                    } else {
                      videoRef.current.pause();
                    }
                  }
                }}
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#3B82F6]/30 transition-transform active:scale-95 relative z-10"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>เล่น / หยุดคลิปวิดีโอบทเรียน</span>
              </button>
            ) : (
              <button
                onClick={() => { playClickSound(); setActiveTopic('lessons'); }}
                className="w-full py-3 sm:py-3.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#3B82F6]/30 transition-transform active:scale-95 relative z-10"
              >
                <BookOpen className="w-4 h-4 fill-current" />
                <span>ไปที่วิดีโอบทเรียน</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

