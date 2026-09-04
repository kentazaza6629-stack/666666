import React, { useState, useEffect, useRef } from 'react';
import { DetectiveProfile, TabType } from '../../types';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send,
  GraduationCap,
  Calendar,
  Check,
  Star,
  Layers,
  BookOpen,
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  ShieldCheck,
  UserCheck,
  Paperclip,
  Tag
} from 'lucide-react';
import {
  playClickSound,
  playCorrectSound,
  playCoinSound,
  playBadgeUnlockSound
} from '../../utils/sound';
import { dataService } from '../../lib/dataService';
import { orderBy } from 'firebase/firestore';

export interface HomeworkAssignment {
  id: string;
  code: string;
  title: string;
  unit: string;
  zoneRef?: TabType;
  deadline: string;
  maxScore: number;
  rewardExp: number;
  rewardCoins: number;
  description: string;
  instructions: string[];
  sampleKeywords?: string[];
  rubric?: { criteria: string; score: number }[];
  tag: string;
  assignedByTeacher: boolean;
  teacherName: string;
  createdAt: string;
}

export interface HomeworkSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  classroom: string;
  studentNo?: string;
  submittedAt: string;
  timestamp: number;
  answerText: string;
  attachedImageUrl?: string;
  externalLink?: string;
  status: 'pending' | 'graded';
  score?: number;
  maxScore: number;
  teacherFeedback?: string;
  gradedAt?: string;
}

const DEFAULT_TEACHER_ASSIGNMENTS: HomeworkAssignment[] = [
  {
    id: 'hw_1',
    code: 'HW-01',
    title: 'ใบงานที่ 1: ตะลุยคาถาโอเปอเรเตอร์ ค้นหาไวทันใจ',
    unit: 'หน่วยที่ 2: แหล่งข้อมูล & ตัวดำเนินการค้นหา',
    deadline: 'วันศุกร์นี้ (ก่อนสอบเก็บคะแนน)',
    maxScore: 10,
    rewardExp: 50,
    rewardCoins: 15,
    description: 'ให้นักเรียนออกแบบคำค้นหาและทดลองใช้ตัวดำเนินการ (Operators) เพื่อสืบค้นข้อมูลตามสถานการณ์ที่กำหนด',
    instructions: [
      '1. ยกตัวอย่างการใช้เครื่องหมายคำพูด "" เพื่อหาคำที่แน่นอนอย่างน้อย 1 ตัวอย่าง',
      '2. ยกตัวอย่างการใช้ site: เจาะจงหน่วยงานการศึกษา (.ac.th) หรือหน่วยงานรัฐ (.go.th)',
      '3. สรุปผลลัพธ์ที่ได้จากการสืบค้นว่าแตกต่างจากการพิมพ์คำค้นหาธรรมดาอย่างไร'
    ],
    sampleKeywords: ['"ระบบสุริยะ" site:ac.th', '"วัฏจักรน้ำ" filetype:pdf'],
    tag: 'จำเป็น',
    assignedByTeacher: true,
    teacherName: 'คุณครูแสนดี (ครูผู้สอน)',
    createdAt: '1 ก.ย. 2569'
  },
  {
    id: 'hw_2',
    code: 'HW-02',
    title: 'ใบงานที่ 2: นักสืบจับพิรุธ ตรวจสอบความน่าเชื่อถือ 5W1H',
    unit: 'หน่วยที่ 3: เทคนิคสืบค้น & ประเมินความน่าเชื่อถือ',
    deadline: 'วันศุกร์หน้า',
    maxScore: 10,
    rewardExp: 50,
    rewardCoins: 15,
    description: 'เลือกข่าวสารหรือบทความออนไลน์ 1 เรื่อง แล้วประเมินความน่าเชื่อถือตามหลักการ 5W1H และ STOP',
    instructions: [
      '1. ระบุชื่อข่าวสารหรือหัวข้อที่เลือกศึกษา พร้อมแหล่งที่มา (URL / เพจ)',
      '2. วิเคราะห์ตามหลัก 5W1H (ใครเขียน, เกิดอะไรขึ้น, เมื่อไหร่, ที่ไหน, ทำไม, อย่างไร)',
      '3. สรุปว่าข้อมูลนี้น่าเชื่อถือหรือต้องระวัง'
    ],
    sampleKeywords: ['5W1H', 'โดเมนเนม', 'ผู้เขียน'],
    tag: 'แนะนำ',
    assignedByTeacher: true,
    teacherName: 'คุณครูแสนดี (ครูผู้สอน)',
    createdAt: '1 ก.ย. 2569'
  },
  {
    id: 'hw_3',
    code: 'HW-03',
    title: 'ใบงานที่ 3: ถอดรหัสคดีปริศนา & รายงานข่าวปลอม',
    unit: 'หน่วยที่ 4-5: คดีปริศนาและการรู้เท่าทันสื่อ',
    deadline: 'สัปดาห์หน้า',
    maxScore: 10,
    rewardExp: 60,
    rewardCoins: 20,
    description: 'สวมบทบาทเป็นยอดนักสืบดิจิทัล วิเคราะห์ข่าวปลอมหรือข่าวลวง (Fake News) 1 กรณีตัวอย่าง พร้อมแนวทางป้องกัน',
    instructions: [
      '1. สรุปเนื้อหาข่าวลวงที่พบ และจุดสังเกตที่ทำให้รู้ว่าเป็นข่าวปลอม',
      '2. ผลกระทบหากมีคนหลงเชื่อและส่งต่อข่าวปลอมนี้',
      '3. คาถา 3 ข้อในการรับมือกับข่าวลวงบนโลกออนไลน์'
    ],
    tag: 'ภารกิจสืบสวน',
    assignedByTeacher: true,
    teacherName: 'คุณครูแสนดี (ครูผู้สอน)',
    createdAt: '2 ก.ย. 2569'
  }
];

const INITIAL_SUBMISSIONS: HomeworkSubmission[] = [
  {
    id: 'sub_demo_1',
    assignmentId: 'hw_1',
    assignmentTitle: 'ใบงานที่ 1: ตะลุยคาถาโอเปอเรเตอร์ ค้นหาไวทันใจ',
    studentId: 'std_demo_1',
    studentName: 'ด.ช. ต้นกล้า รักเรียน',
    studentAvatar: '👦',
    classroom: 'ป.5/1',
    studentNo: '04',
    submittedAt: 'เมื่อวานนี้ 15:30 น.',
    timestamp: Date.now() - 86400000,
    answerText: 'ผมค้นหาคำว่า "วัฏจักรของน้ำ" site:ac.th filetype:pdf พบเอกสารการสอนของมหาวิทยาลัยและโรงเรียนโดยตรงเลยครับ ข้อมูลไม่มีโฆษณาแทรก ตรงประเด็นมากครับ',
    status: 'graded',
    score: 10,
    maxScore: 10,
    teacherFeedback: 'เก่งมากครับต้นกล้า! เลือกใช้ทั้ง site: และ filetype: ได้อย่างเชี่ยวชาญ ได้ข้อมูลทางการศึกษาที่เชื่อถือได้แท้จริง',
    gradedAt: 'เมื่อวานนี้ 16:10 น.'
  }
];

interface CommunityHomeworkProps {
  profile: DetectiveProfile;
  onUpdateProfile: (updated: Partial<DetectiveProfile>) => void;
  onShowToast: (title: string, message: string, type?: 'exp' | 'badge') => void;
  onNavigateTab: (tab: TabType) => void;
  onAskTeacherAboutHomework?: (assignmentTitle: string) => void;
}

export const CommunityHomework: React.FC<CommunityHomeworkProps> = ({
  profile,
  onUpdateProfile,
  onShowToast,
  onAskTeacherAboutHomework
}) => {
  const isAuthTeacher = profile.authUser?.role === 'teacher';

  // Role toggle for managing assignments and viewing submissions
  const [currentRole, setCurrentRole] = useState<'student' | 'teacher'>(
    isAuthTeacher ? 'teacher' : 'student'
  );

  useEffect(() => {
    if (!isAuthTeacher) {
      setCurrentRole('student');
      if (subView === 'teacher_review') {
        setSubView('assignments');
      }
    }
  }, [isAuthTeacher]);

  // Assignments state
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>(DEFAULT_TEACHER_ASSIGNMENTS);

  // Tab inside Homework view ('assignments' | 'my_submissions' | 'teacher_review')
  const [subView, setSubView] = useState<'assignments' | 'my_submissions' | 'teacher_review'>('assignments');

  // Selected assignment for submission
  const [selectedAssignment, setSelectedAssignment] = useState<HomeworkAssignment | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Modal for Teacher to ADD / EDIT assignment
  const [isTeacherAssignmentModalOpen, setIsTeacherAssignmentModalOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [formCode, setFormCode] = useState('HW-04');
  const [formTitle, setFormTitle] = useState('');
  const [formUnit, setFormUnit] = useState('หน่วยที่ 3: เทคนิคสืบค้น & ประเมินความน่าเชื่อถือ');
  const [formDeadline, setFormDeadline] = useState('วันศุกร์นี้');
  const [formMaxScore, setFormMaxScore] = useState<number>(10);
  const [formExp, setFormExp] = useState<number>(50);
  const [formCoins, setFormCoins] = useState<number>(15);
  const [formDesc, setFormDesc] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formTag, setFormTag] = useState('จำเป็น');

  // Submissions state
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>(INITIAL_SUBMISSIONS);

  // Student Submission Form State
  const [studentNameInput, setStudentNameInput] = useState(profile.name || '');
  const [classroomInput, setClassroomInput] = useState(profile.authUser?.classroom || 'ป.5/1');
  const [studentNoInput, setStudentNoInput] = useState('');
  const [answerTextInput, setAnswerTextInput] = useState('');
  const [externalLinkInput, setExternalLinkInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  // Teacher Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState<HomeworkSubmission | null>(null);
  const [gradeScoreInput, setGradeScoreInput] = useState<number>(10);
  const [teacherFeedbackInput, setTeacherFeedbackInput] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to real-time assignments from Firestore
  useEffect(() => {
    const unsubscribe = dataService.subscribeCollection(
      'assignments',
      [orderBy('createdAt', 'desc')],
      (data) => {
        if (data.length > 0) {
          setAssignments(data as HomeworkAssignment[]);
        } else {
          setAssignments(DEFAULT_TEACHER_ASSIGNMENTS);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time submissions from Firestore
  useEffect(() => {
    const unsubscribe = dataService.subscribeCollection(
      'submissions',
      [orderBy('timestamp', 'desc')],
      (data) => {
        if (data.length > 0) {
          setSubmissions(data as HomeworkSubmission[]);
        } else {
          setSubmissions(INITIAL_SUBMISSIONS);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync student name
  useEffect(() => {
    if (profile.name && !studentNameInput) {
      setStudentNameInput(profile.name);
    }
    if (profile.authUser?.classroom && !classroomInput) {
      setClassroomInput(profile.authUser.classroom);
    }
  }, [profile]);

  // Delete Submission (for Teacher)
  const handleDeleteSubmission = (subId: string, studentName: string) => {
    if (confirm(`ต้องการลบรายการส่งงานของ "${studentName}" หรือไม่?`)) {
      playClickSound();
      setSubmissions(prev => prev.filter(s => s.id !== subId));
      onShowToast('ลบรายการส่งงานแล้ว', `นำงานของ ${studentName} ออกจากรายการตรวจแล้ว`);
    }
  };

  // Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playClickSound();
      setAttachedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImage(event.target.result as string);
          onShowToast('📷 แนบไฟล์ภาพการบ้านสำเร็จ', file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Teacher Assignment Modal to Create New
  const handleOpenCreateAssignment = () => {
    playClickSound();
    setEditingAssignmentId(null);
    setFormCode(`HW-0${(assignments || []).length + 1}`);
    setFormTitle('');
    setFormUnit('หน่วยที่ 2: แหล่งข้อมูล & ตัวดำเนินการค้นหา');
    setFormDeadline('วันศุกร์หน้า (16:30 น.)');
    setFormMaxScore(10);
    setFormExp(50);
    setFormCoins(15);
    setFormDesc('');
    setFormInstructions('1. ค้นหาข้อมูลตามหัวข้อที่กำหนด\n2. สรุปใจความสำคัญและแหล่งที่มา\n3. แนบรูปถ่ายสมุดหรือพิมพ์คำตอบส่ง');
    setFormTag('งานที่ครูมอบหมาย');
    setIsTeacherAssignmentModalOpen(true);
  };

  // Open Teacher Assignment Modal to Edit
  const handleOpenEditAssignment = (hw: HomeworkAssignment) => {
    playClickSound();
    setEditingAssignmentId(hw.id);
    setFormCode(hw.code);
    setFormTitle(hw.title);
    setFormUnit(hw.unit);
    setFormDeadline(hw.deadline);
    setFormMaxScore(hw.maxScore);
    setFormExp(hw.rewardExp);
    setFormCoins(hw.rewardCoins);
    setFormDesc(hw.description);
    setFormInstructions(hw.instructions.join('\n'));
    setFormTag(hw.tag);
    setIsTeacherAssignmentModalOpen(true);
  };

  // Save Teacher Assignment (Create or Edit)
  const handleSaveTeacherAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('กรุณากรอกชื่อใบงาน');
      return;
    }

    playBadgeUnlockSound();

    const instructionsArray = formInstructions
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const teacherDisplayName = profile.authUser?.name || 'คุณครูแสนดี (ครูผู้สอน)';

    if (editingAssignmentId) {
      // Edit
      const updatedData = {
        code: formCode.trim(),
        title: formTitle.trim(),
        unit: formUnit.trim(),
        deadline: formDeadline.trim(),
        maxScore: Number(formMaxScore) || 10,
        rewardExp: Number(formExp) || 50,
        rewardCoins: Number(formCoins) || 15,
        description: formDesc.trim(),
        instructions: instructionsArray,
        tag: formTag.trim() || 'งานมอบหมาย',
        teacherName: teacherDisplayName
      };
      dataService.saveDoc('assignments', editingAssignmentId, updatedData);
      onShowToast('✏️ แก้ไขใบงานสำเร็จ', `บันทึกการเปลี่ยนแปลงของ "${formTitle}" เรียบร้อย`, 'badge');
    } else {
      // Create new
      const newAssignment: any = {
        code: formCode.trim() || `HW-0${(assignments || []).length + 1}`,
        title: formTitle.trim(),
        unit: formUnit.trim(),
        deadline: formDeadline.trim() || 'สัปดาห์นี้',
        maxScore: Number(formMaxScore) || 10,
        rewardExp: Number(formExp) || 50,
        rewardCoins: Number(formCoins) || 15,
        description: formDesc.trim() || 'คำสั่งใบงานจากคุณครูผู้สอนสำหรับนักเรียน ป.5',
        instructions: instructionsArray.length > 0 ? instructionsArray : ['ปฏิบัติตามคำสั่งของคุณครูและส่งงานในระบบ'],
        tag: formTag.trim() || 'งานที่ครูมอบหมาย',
        assignedByTeacher: true,
        teacherName: teacherDisplayName,
        createdAt: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      dataService.addDoc('assignments', newAssignment);
      onShowToast('👩‍🏫 มอบหมายใบงานสำเร็จ!', `เพิ่มใบงาน "${newAssignment.title}" เข้าสู่ช่องส่งงานของนักเรียนแล้ว`, 'badge');
    }

    setIsTeacherAssignmentModalOpen(false);
  };

  // Delete Assignment
  const handleDeleteAssignment = (id: string, title: string) => {
    if (confirm(`ต้องการลบใบงาน "${title}" หรือไม่? (งานนี้จะถูกนำออกจากช่องส่งงานของนักเรียน)`)) {
      playClickSound();
      setAssignments(prev => prev.filter(a => a.id !== id));
      onShowToast('ลบใบงานเรียบร้อย', `นำใบงาน "${title}" ออกจากระบบแล้ว`);
    }
  };

  // Handle Submit Homework (Student)
  const handleSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    if (!answerTextInput.trim() && !attachedImage && !externalLinkInput.trim()) {
      alert('กรุณาพิมพ์คำตอบ หรือแนบรูปภาพผลงาน หรือใส่ลิงก์ชิ้นงานก่อนส่งครับ');
      return;
    }

    playCorrectSound();
    playCoinSound();

    const newSub: any = {
      assignmentId: selectedAssignment.id,
      assignmentTitle: selectedAssignment.title,
      studentId: profile.authUser?.id || 'std_' + Date.now(),
      studentName: studentNameInput.trim() || profile.name || 'นักเรียน ป.5',
      studentAvatar: profile.avatar || '👦',
      classroom: classroomInput,
      studentNo: studentNoInput.trim() || undefined,
      submittedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น. วันนี้',
      timestamp: Date.now(),
      answerText: answerTextInput.trim(),
      attachedImageUrl: attachedImage || undefined,
      externalLink: externalLinkInput.trim() || undefined,
      status: 'pending',
      maxScore: selectedAssignment.maxScore
    };

    dataService.addDoc('submissions', newSub);

    // Give rewards
    const gainedExp = selectedAssignment.rewardExp;
    const gainedCoins = selectedAssignment.rewardCoins;
    const nextExp = profile.exp + gainedExp;
    const nextCoins = profile.coins + gainedCoins;

    onUpdateProfile({
      exp: nextExp,
      coins: nextCoins
    });

    onShowToast(
      '🎉 ส่งการบ้านสำเร็จแล้ว!',
      `ส่ง "${selectedAssignment.title}" ให้คุณครูเรียบร้อย รับ +${gainedExp} EXP และ +${gainedCoins} Coins`,
      'exp'
    );

    // Reset Form
    setIsSubmitModalOpen(false);
    setAnswerTextInput('');
    setAttachedImage(null);
    setAttachedFileName(null);
    setExternalLinkInput('');
    setSubView('my_submissions');
  };

  // Handle Teacher Grade Submission
  const handleSaveGrading = () => {
    if (!gradingSubmission) return;
    playBadgeUnlockSound();

    const updatedSub = {
      status: 'graded',
      score: Number(gradeScoreInput),
      teacherFeedback: teacherFeedbackInput.trim() || 'ตรวจเรียบร้อยแล้ว ผลงานดีมากครับ',
      gradedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น. วันนี้'
    };

    dataService.saveDoc('submissions', gradingSubmission.id, updatedSub);

    onShowToast('บันทึกผลการตรวจแล้ว 💯', `ให้คะแนน ${gradingSubmission.studentName} (${gradeScoreInput}/${gradingSubmission.maxScore} คะแนน) เรียบร้อย`, 'badge');
    setGradingSubmission(null);
  };

  // Filter student submissions
  const mySubmissions = submissions.filter(
    s => s.studentName === profile.name || 
    (profile.authUser?.id && s.studentId === profile.authUser.id)
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* BANNER: EXCLUSIVELY TEACHER-ASSIGNED WORK */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-4 sm:p-5 text-white shadow-lg border border-emerald-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">ช่องส่งงานที่ครูมอบหมาย</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3 h-3" />
                  <span>งานที่ครูเพิ่มเท่านั้น</span>
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                นักเรียนส่งงานได้เฉพาะใบงานที่ได้รับการมอบหมายจากคุณครูผู้สอนเท่านั้น
              </p>
            </div>
          </div>

          {/* Controls: Role Switcher & Add Assignment Button (Visible ONLY to verified Teacher) */}
          {isAuthTeacher ? (
            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
              {/* Role Switcher */}
              <div className="flex items-center bg-black/25 p-1 rounded-2xl border border-white/20 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setCurrentRole('student');
                    if (subView === 'teacher_review') setSubView('assignments');
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    currentRole === 'student'
                      ? 'bg-white text-emerald-900 font-black shadow-sm'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  <span>👦 โหมดนักเรียน</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setCurrentRole('teacher');
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    currentRole === 'teacher'
                      ? 'bg-amber-300 text-slate-950 font-black shadow-sm'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>👩‍🏫 โหมดครูผู้สอน</span>
                </button>
              </div>

              {/* If in Teacher Role: Add Assignment Button */}
              {currentRole === 'teacher' && (
                <button
                  type="button"
                  onClick={handleOpenCreateAssignment}
                  className="px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-md flex items-center gap-1.5 active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>+ มอบหมายใบงานใหม่</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-2xl bg-black/20 border border-white/20 text-emerald-100 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <span>👦 สำหรับนักเรียนส่งการบ้าน</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SUB-TABS: รายการใบงานที่ครูมอบหมาย | งานที่ฉันส่ง | คุณครูตรวจงาน */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-black">
        <button
          onClick={() => { playClickSound(); setSubView('assignments'); }}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            subView === 'assignments'
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>ใบงานที่ครูมอบหมาย ({(assignments || []).length})</span>
        </button>

        <button
          onClick={() => { playClickSound(); setSubView('my_submissions'); }}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 relative ${
            subView === 'my_submissions'
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>ประวัติงานที่ฉันส่ง</span>
          {mySubmissions.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
              {mySubmissions.length}
            </span>
          )}
        </button>

        {currentRole === 'teacher' && (
          <button
            onClick={() => { playClickSound(); setSubView('teacher_review'); }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              subView === 'teacher_review'
                ? 'bg-amber-500 text-white shadow-md font-black'
                : 'text-amber-800 hover:bg-amber-100/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>ตรวจงานนักเรียน ({(submissions || []).filter(s => s.status === 'pending').length} รอตรวจ)</span>
          </button>
        )}
      </div>

      {/* VIEW 1: ASSIGNMENTS LIST (TEACHER ASSIGNED ONLY) */}
      {subView === 'assignments' && (
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3 shadow-xs">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-3xl">
                📝
              </div>
              <h4 className="font-black text-base text-slate-800">ยังไม่มีใบงานที่ครูมอบหมายในขณะนี้</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                ช่องส่งงานจะแสดงเฉพาะใบงานที่คุณครูผู้สอนเพิ่มและมอบหมายไว้เท่านั้น กรุณารอคุณครูผู้สอนมอบหมายงานใหม่
              </p>
              {currentRole === 'teacher' && (
                <button
                  type="button"
                  onClick={handleOpenCreateAssignment}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-md"
                >
                  + มอบหมายใบงานแรกให้นักเรียน
                </button>
              )}
            </div>
          ) : (
            assignments.map((assignment) => {
              const hasSubmitted = submissions.some(
                s => s.assignmentId === assignment.id && (s.studentName === profile.name || s.studentId === profile.authUser?.id)
              );
              const userSub = submissions.find(
                s => s.assignmentId === assignment.id && (s.studentName === profile.name || s.studentId === profile.authUser?.id)
              );

              return (
                <div
                  key={assignment.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-emerald-300 transition space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          {assignment.code}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {assignment.unit}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[10px] font-black">
                          {assignment.tag}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          <span>ครูมอบหมาย: {assignment.teacherName}</span>
                        </span>
                      </div>

                      <h3 className="font-black text-sm sm:text-base text-slate-800">
                        {assignment.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {assignment.description}
                      </p>
                    </div>

                    {/* Rewards & Teacher Action */}
                    <div className="shrink-0 text-right space-y-1">
                      <div className="flex items-center gap-1.5 justify-end text-xs font-black text-amber-600">
                        <span>+{assignment.rewardExp} EXP</span>
                        <span>💰 +{assignment.rewardCoins}</span>
                      </div>
                      <span className="inline-block text-[11px] font-bold text-slate-400">
                        คะแนนเต็ม {assignment.maxScore} คะแนน
                      </span>

                      {/* Teacher Quick Management Buttons */}
                      {currentRole === 'teacher' && (
                        <div className="flex items-center gap-1 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAssignment(assignment)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition"
                            title="แก้ไขใบงาน"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition"
                            title="ลบใบงาน"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instructions preview */}
                  {assignment.instructions && assignment.instructions.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                      <span className="font-bold text-slate-700 block text-[11px]">คำชี้แจงจากคุณครู:</span>
                      <ul className="pl-4 list-disc space-y-0.5">
                        {assignment.instructions.slice(0, 3).map((inst, i) => (
                          <li key={i}>{inst}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Deadline & Status Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-slate-100 text-xs gap-2">
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>กำหนดส่ง: {assignment.deadline}</span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {hasSubmitted ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 ${
                            userSub?.status === 'graded'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {userSub?.status === 'graded'
                                ? `ตรวจแล้ว (${userSub.score}/${assignment.maxScore} คะแนน)`
                                : 'ส่งงานแล้ว รอครูตรวจ'}
                            </span>
                          </span>

                          <button
                            onClick={() => {
                              playClickSound();
                              setSelectedAssignment(assignment);
                              setIsSubmitModalOpen(true);
                            }}
                            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                          >
                            ส่งเพิ่ม/แก้ไข
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {onAskTeacherAboutHomework && (
                            <button
                              type="button"
                              onClick={() => {
                                playClickSound();
                                onAskTeacherAboutHomework(assignment.title);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-black text-xs transition flex items-center gap-1 border border-teal-200"
                              title="พิมพ์ถามคุณครูเกี่ยวกับใบงานนี้"
                            >
                              <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                              <span className="hidden sm:inline">ถามครู</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              playClickSound();
                              setSelectedAssignment(assignment);
                              setIsSubmitModalOpen(true);
                            }}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 active:scale-95"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>เปิดฟอร์มส่งงาน</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: MY SUBMISSIONS */}
      {subView === 'my_submissions' && (
        <div className="space-y-3">
          {mySubmissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                📂
              </div>
              <h4 className="font-black text-sm text-slate-700">ยังไม่มีประวัติการส่งงาน</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                เลือกใบงานจากแท็บ "ใบงานที่ครูมอบหมาย" เพื่อเริ่มส่งงานและรับเหรียญรางวัลได้เลยครับ!
              </p>
              <button
                onClick={() => { playClickSound(); setSubView('assignments'); }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-500 transition shadow-sm"
              >
                ดูใบงานที่ครูมอบหมาย &rarr;
              </button>
            </div>
          ) : (
            mySubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-800">{sub.assignmentTitle}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        sub.status === 'graded'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.status === 'graded' ? 'ตรวจเรียบร้อยแล้ว' : 'รอคุณครูตรวจ'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      ส่งเมื่อ: {sub.submittedAt} • {sub.classroom} {sub.studentNo ? `เลขที่ ${sub.studentNo}` : ''}
                    </span>
                  </div>

                  {sub.status === 'graded' && (
                    <div className="px-3 py-1.5 rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 border border-amber-200 text-right">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-black text-base text-emerald-800">
                          {sub.score} / {sub.maxScore}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">คะแนนที่ได้</span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 whitespace-pre-line">
                  {sub.answerText || '(ไม่มีข้อความตอบ)'}
                </div>

                {sub.attachedImageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-900 flex items-center justify-center">
                    <img src={sub.attachedImageUrl} alt="ไฟล์งานที่แนบ" className="max-h-48 object-contain" />
                  </div>
                )}

                {sub.externalLink && (
                  <a
                    href={sub.externalLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดลิงก์ผลงาน: {sub.externalLink}</span>
                  </a>
                )}

                {sub.teacherFeedback && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-800 font-black">
                      <span className="flex items-center gap-1.5">
                        <span>👩‍🏫</span> ข้อเสนอแนะจากคุณครู
                      </span>
                      {sub.gradedAt && <span className="text-[10px] text-emerald-600 font-normal">{sub.gradedAt}</span>}
                    </div>
                    <p className="text-emerald-950 font-medium pl-5">{sub.teacherFeedback}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 3: TEACHER REVIEW (Visible if Teacher role) */}
      {subView === 'teacher_review' && currentRole === 'teacher' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-800">
              ผลงานที่นักเรียนส่งเข้ามาทั้งหมด ({(submissions || []).length} รายการ)
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              รอตรวจ {(submissions || []).filter(s => s.status === 'pending').length} รายการ
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs font-bold">
              ยังไม่มีนักเรียนส่งผลงานเข้ามาในระบบ
            </div>
          ) : (
            submissions.map((sub) => (
              <div
                key={sub.id}
                className={`bg-white rounded-2xl p-4 border transition space-y-3 ${
                  sub.status === 'pending'
                    ? 'border-amber-300 shadow-sm shadow-amber-500/10'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl shrink-0">
                      {sub.studentAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-800">{sub.studentName}</span>
                        <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black">
                          {sub.classroom} {sub.studentNo ? `เลขที่ ${sub.studentNo}` : ''}
                        </span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                          sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sub.status === 'graded' ? `ตรวจแล้ว (${sub.score}/${sub.maxScore})` : 'รอตรวจ'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        เรื่อง: {sub.assignmentTitle} • {sub.submittedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        playClickSound();
                        setGradingSubmission(sub);
                        setGradeScoreInput(sub.score ?? sub.maxScore);
                        setTeacherFeedbackInput(sub.teacherFeedback || '');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-sm flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{sub.status === 'graded' ? 'แก้ไขคะแนน' : 'ตรวจให้คะแนน'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSubmission(sub.id, sub.studentName)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition border border-rose-200"
                      title="ลบรายการส่งงานนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 whitespace-pre-line">
                  {sub.answerText || '(ไม่มีข้อความตอบ)'}
                </div>

                {sub.attachedImageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-900 flex items-center justify-center">
                    <img src={sub.attachedImageUrl} alt="ไฟล์งานนักเรียน" className="max-h-48 object-contain" />
                  </div>
                )}

                {sub.externalLink && (
                  <a
                    href={sub.externalLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดลิงก์ผลงาน: {sub.externalLink}</span>
                  </a>
                )}

                {sub.teacherFeedback && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                    <span className="font-black text-emerald-800 block">👩‍🏫 ข้อเสนอแนะที่คุณครูให้:</span>
                    <p className="text-emerald-950 font-medium pl-4">{sub.teacherFeedback}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: SUBMIT HOMEWORK (STUDENT) */}
      {isSubmitModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-2 border-emerald-200 text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                  {selectedAssignment.code}
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-800">{selectedAssignment.title}</h3>
                  <span className="text-[11px] text-emerald-600 font-bold">
                    คะแนนเต็ม {selectedAssignment.maxScore} คะแนน • มอบหมายโดย: {selectedAssignment.teacherName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                ✕
              </button>
            </div>

            {/* Assignment Instructions Snippet */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <span className="font-black text-slate-700 block">คำชี้แจงจากคุณครู:</span>
              <ul className="space-y-1 text-slate-600 pl-4 list-disc">
                {selectedAssignment.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ul>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmitHomework} className="space-y-3 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">ชื่อ-นามสกุล / ชื่อเล่น</label>
                  <input
                    type="text"
                    required
                    value={studentNameInput}
                    onChange={(e) => setStudentNameInput(e.target.value)}
                    placeholder="เช่น ด.ช.ปันดาว ใจดี"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">ชั้นเรียน</label>
                  <select
                    value={classroomInput}
                    onChange={(e) => setClassroomInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  >
                    <option value="ป.5/1">ป.5/1</option>
                    <option value="ป.5/2">ป.5/2</option>
                    <option value="ป.5/3">ป.5/3</option>
                    <option value="ป.5/4">ป.5/4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">เลขที่</label>
                  <input
                    type="text"
                    value={studentNoInput}
                    onChange={(e) => setStudentNoInput(e.target.value)}
                    placeholder="เช่น 15"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  เนื้อหาคำตอบ / คำอธิบายผลงาน *
                </label>
                <textarea
                  rows={4}
                  value={answerTextInput}
                  onChange={(e) => setAnswerTextInput(e.target.value)}
                  placeholder="พิมพ์คำตอบตามโจทย์ใบงาน หรืออธิบายขั้นตอนการสืบค้นข้อมูล..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  แนบรูปภาพผลงาน / รูปถ่ายสมุดการบ้าน (ไม่บังคับ)
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {attachedImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-300 bg-slate-900 max-h-40 flex items-center justify-center">
                    <img src={attachedImage} alt="แนบงาน" className="max-h-40 object-contain" />
                    <button
                      type="button"
                      onClick={() => { setAttachedImage(null); setAttachedFileName(null); }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition"
                      title="ลบรูปภาพ"
                    >
                      ✕
                    </button>
                    {attachedFileName && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px]">
                        {attachedFileName}
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl text-slate-500 hover:text-emerald-700 flex flex-col items-center justify-center gap-1.5 transition bg-slate-50 hover:bg-emerald-50/50"
                  >
                    <UploadCloud className="w-6 h-6 text-slate-400" />
                    <span className="font-bold text-xs">คลิกเพื่อเลือกไฟล์ภาพถ่ายการบ้าน</span>
                    <span className="text-[10px] text-slate-400">รองรับไฟล์ JPG, PNG, WEBP</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  แนบลิงก์ผลงาน (ถ้ามี เช่น Google Docs, Canva)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={externalLinkInput}
                    onChange={(e) => setExternalLinkInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>บันทึกและส่งให้คุณครู</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: TEACHER CREATE / EDIT ASSIGNMENT */}
      {isTeacherAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-2 border-amber-300 text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                  <GraduationCap className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {editingAssignmentId ? 'แก้ไขใบงานที่มอบหมาย' : 'มอบหมายใบงานใหม่ให้นักเรียน'}
                  </h3>
                  <span className="text-[11px] text-amber-700 font-bold">
                    ช่องส่งงานจะแสดงเฉพาะใบงานที่ครูเพิ่มในส่วนนี้เท่านั้น
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsTeacherAssignmentModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeacherAssignment} className="space-y-3 text-xs">
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">รหัสใบงาน *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="เช่น HW-04"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-black focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ป้ายกำกับ *</label>
                  <input
                    type="text"
                    required
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    placeholder="เช่น จำเป็น, สำคัญ, โครงงาน"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ชื่อใบงาน / หัวข้อเรื่อง *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="เช่น ใบงานที่ 4: นักสืบตรวจข่าวลวงบนโลกออนไลน์"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-black text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">หน่วยการเรียนรู้</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="เช่น หน่วยที่ 2: แหล่งข้อมูล"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">วัน-เวลากำหนดส่ง *</label>
                  <input
                    type="text"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    placeholder="เช่น วันศุกร์นี้ (16:30 น.)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">คะแนนเต็ม</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formMaxScore}
                    onChange={(e) => setFormMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-black text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">รางวัล EXP</label>
                  <input
                    type="number"
                    min={0}
                    value={formExp}
                    onChange={(e) => setFormExp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-black text-center focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">รางวัล Coins</label>
                  <input
                    type="number"
                    min={0}
                    value={formCoins}
                    onChange={(e) => setFormCoins(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-black text-center focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">คำอธิบายโจทย์ย่อ</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="อธิบายภาพรวมของงานสั้นๆ 1-2 ประโยค..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  คำชี้แจงขั้นตอนการทำงานให้นักเรียน (พิมพ์ทีละบรรทัด)
                </label>
                <textarea
                  rows={3}
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="1. สืบคดีหรือค้นหาข้อมูลตามหัวข้อ&#10;2. สรุปความรู้ใส่สมุด&#10;3. ถ่ายรูปหรือพิมพ์คำตอบส่งในระบบ"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTeacherAssignmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition shadow-md shadow-amber-500/30 flex items-center gap-1.5 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingAssignmentId ? 'บันทึกการแก้ไข' : 'เผยแพร่ใบงานให้นักเรียน'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: TEACHER GRADING SUBMISSION */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-2 border-emerald-300 text-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-base text-slate-800">ตรวจให้คะแนนและคำแนะนำ</h3>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-black text-slate-800">
                <span>{gradingSubmission.studentName} ({gradingSubmission.classroom})</span>
                <span className="text-emerald-700">{gradingSubmission.assignmentTitle}</span>
              </div>
              <p className="text-slate-600 line-clamp-3 pl-1 italic">"{gradingSubmission.answerText}"</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                ให้คะแนน (เต็ม {gradingSubmission.maxScore} คะแนน)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={gradingSubmission.maxScore}
                  value={gradeScoreInput}
                  onChange={(e) => setGradeScoreInput(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-black text-lg text-emerald-700 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-500">/ {gradingSubmission.maxScore} คะแนน</span>

                <div className="flex items-center gap-1 ml-auto">
                  {[gradingSubmission.maxScore, gradingSubmission.maxScore - 1, gradingSubmission.maxScore - 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setGradeScoreInput(s)}
                      className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black hover:bg-emerald-200 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                ข้อเสนอแนะและคำชมจากคุณครู
              </label>
              <textarea
                rows={3}
                value={teacherFeedbackInput}
                onChange={(e) => setTeacherFeedbackInput(e.target.value)}
                placeholder="เขียนคำชม ข้อสังเกต หรือจุดที่แนะนำให้นักเรียนทบทวนเพิ่มเติม..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {[
                  'ยอดเยี่ยมมากครับ! 👏',
                  'ใช้ตัวดำเนินการได้ถูกต้อง 💯',
                  'อธิบายหลัก 5W1H ได้ชัดเจนดีมาก',
                  'หมั่นตรวจสอบแหล่งที่มาต่อไปนะ'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTeacherFeedbackInput(preset)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-[10px] font-bold text-slate-600 hover:text-emerald-800 shrink-0 transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleSaveGrading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5 active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>บันทึกผลการตรวจ</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
