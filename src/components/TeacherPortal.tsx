import React, { useState, useEffect } from 'react';
import { DetectiveProfile, TabType, AuthUser } from '../types';
import { 
  StudentRecord, 
  INITIAL_STUDENTS_LIST, 
  INITIAL_ANNOUNCEMENTS, 
  ClassAnnouncement, 
  CURRICULUM_INFO,
  LessonMaterial,
  INITIAL_LESSON_MATERIALS 
} from '../data/teacherData';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Video, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  Edit2,
  Edit3, 
  Search, 
  Filter, 
  Sparkles, 
  Clock, 
  Shuffle, 
  Flame, 
  Eye, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  ChevronRight, 
  Printer, 
  Save, 
  RefreshCw, 
  BarChart3, 
  Check, 
  Upload, 
  ExternalLink,
  MessageSquare,
  Gift,
  ArrowLeft,
  KeyRound,
  X
} from 'lucide-react';
import { 
  playClickSound, 
  playCorrectSound, 
  playWrongSound, 
  playBadgeUnlockSound,
  playCoinSound
} from '../utils/sound';
import { dataService } from '../lib/dataService';
import { orderBy, limit } from 'firebase/firestore';

interface TeacherPortalProps {
  profile: DetectiveProfile;
  onUpdateProfile: (updated: Partial<DetectiveProfile> | ((prev: DetectiveProfile) => DetectiveProfile)) => void;
  onNavigateTab: (tab: TabType) => void;
  onShowToast: (title: string, description: string, type?: 'exp' | 'badge') => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  profile,
  onUpdateProfile,
  onNavigateTab,
  onShowToast,
}) => {
  // Navigation sub-tab inside Teacher Portal
  const [activeTeacherTab, setActiveTeacherTab] = useState<
    'overview' | 'students' | 'video_lessons' | 'curriculum' | 'announcements' | 'classroom_tools'
  >('overview');

  // Students management state
  const [studentsList, setStudentsList] = useState<StudentRecord[]>([]);

  // Announcements state
  const [announcements, setAnnouncements] = useState<ClassAnnouncement[]>([]);

  // Class filter & search query
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected student for detail/grading modal
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [bonusExpInput, setBonusExpInput] = useState<number>(50);
  const [bonusCoinInput, setBonusCoinInput] = useState<number>(100);
  const [teacherNoteInput, setTeacherNoteInput] = useState<string>('');

  // Teacher Security PIN Management State
  const [showPinSettings, setShowPinSettings] = useState(false);
  const [teacherPinValue, setTeacherPinValue] = useState('10102549');
  const [pinSuccessMsg, setPinSuccessMsg] = useState(false);

  // Video management states
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string>('/lesson.mp4');
  const [videoUrlInput, setVideoUrlInput] = useState<string>('');
  const [videoUploadMsg, setVideoUploadMsg] = useState<string | null>(null);

  // New announcement form states
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnTarget, setNewAnnTarget] = useState('ทุกห้องเรียน (ป.5/1 - ป.5/2)');
  const [newAnnImportant, setNewAnnImportant] = useState(true);

  // Classroom Tool: Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(300); // 5 mins
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Classroom Tool: Random Student Picker
  const [pickedStudent, setPickedStudent] = useState<StudentRecord | null>(null);
  const [isPicking, setIsPicking] = useState<boolean>(false);

  // Classroom Tool: Group Scores & List (Dynamic CRUD)
  const [groupsList, setGroupsList] = useState<{ id: string; name: string; score: number }[]>([]);

  // --- CRUD STATE 1: STUDENT MANAGEMENT ---
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [stdNumber, setStdNumber] = useState<number>(1);
  const [stdName, setStdName] = useState<string>('');
  const [stdClassroom, setStdClassroom] = useState<string>('ป.5/1');
  const [stdAvatar, setStdAvatar] = useState<string>('👦');
  const [stdLevel, setStdLevel] = useState<number>(1);
  const [stdExp, setStdExp] = useState<number>(0);
  const [stdCoins, setStdCoins] = useState<number>(50);
  const [stdQuizScore, setStdQuizScore] = useState<number>(0);
  const [stdIndicator1, setStdIndicator1] = useState<StudentRecord['indicator1Status']>('ยังไม่ผ่าน');
  const [stdIndicator2, setStdIndicator2] = useState<StudentRecord['indicator2Status']>('ยังไม่ผ่าน');
  const [stdNotes, setStdNotes] = useState<string>('');

  // --- CRUD STATE 2: LESSON MATERIALS ---
  const [lessonMaterials, setLessonMaterials] = useState<LessonMaterial[]>([]);

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<LessonMaterial | null>(null);
  const [matTitle, setMatTitle] = useState('');
  const [matCategory, setMatCategory] = useState<'video' | 'worksheet' | 'slides' | 'plan'>('video');
  const [matDesc, setMatDesc] = useState('');
  const [matUrl, setMatUrl] = useState('');

  // --- SUBSCRIPTIONS ---
  useEffect(() => {
    // Subscribe to students
    const unsubStudents = dataService.subscribeCollection('users', [], (data) => {
      // Filter only students for the teacher's list
      if (data && data.length > 0) {
        setStudentsList(data as StudentRecord[]);
      } else {
        setStudentsList(INITIAL_STUDENTS_LIST);
      }
    });

    // Subscribe to announcements
    const unsubAnnouncements = dataService.subscribeCollection('announcements', [orderBy('timestamp', 'desc')], (data) => {
      if (data && data.length > 0) {
        setAnnouncements(data as ClassAnnouncement[]);
      } else {
        setAnnouncements(INITIAL_ANNOUNCEMENTS);
      }
    });

    // Subscribe to lesson materials
    const unsubMaterials = dataService.subscribeCollection('lesson_materials', [], (data) => {
      if (data && data.length > 0) {
        setLessonMaterials(data as LessonMaterial[]);
      } else {
        setLessonMaterials(INITIAL_LESSON_MATERIALS);
      }
    });

    // Subscribe to classroom groups
    const unsubGroups = dataService.subscribeCollection('classroom_groups', [], (data) => {
      if (data && data.length > 0) {
        setGroupsList(data as any[]);
      } else {
        setGroupsList([
          { id: 'grp_1', name: 'กลุ่มที่ 1 (ยอดนักสืบแว่นขยาย)', score: 0 },
          { id: 'grp_2', name: 'กลุ่มที่ 2 (จอมเวทย์คีย์เวิร์ด)', score: 0 },
          { id: 'grp_3', name: 'กลุ่มที่ 3 (ผู้พิทักษ์โดเมน)', score: 0 },
          { id: 'grp_4', name: 'กลุ่มที่ 4 (หน่วยปราบข่าวลวง)', score: 0 },
        ]);
      }
    });

    // Subscribe to curriculum data
    const unsubCurriculum = dataService.subscribeDoc('curriculum', 'main', (data) => {
      if (data) {
        setCurriculumData(data as any);
      }
    });

    // Subscribe to teacher config (PIN and Global Video)
    const unsubConfig = dataService.subscribeDoc('settings', 'teacher_config', (data) => {
      if (data) {
        if (data.securityPin) setTeacherPinValue(data.securityPin);
        if (data.customVideoSrc) setCurrentVideoSrc(data.customVideoSrc);
      }
    });

    return () => {
      unsubStudents();
      unsubAnnouncements();
      unsubMaterials();
      unsubGroups();
      unsubCurriculum();
      unsubConfig();
    };
  }, []);

  // --- CRUD STATE 3: ANNOUNCEMENT EDIT ---
  const [editingAnnouncement, setEditingAnnouncement] = useState<ClassAnnouncement | null>(null);
  const [editAnnTitle, setEditAnnTitle] = useState('');
  const [editAnnContent, setEditAnnContent] = useState('');
  const [editAnnTarget, setEditAnnTarget] = useState('');
  const [editAnnImportant, setEditAnnImportant] = useState(true);

  // --- CRUD STATE 4: CURRICULUM, INDICATORS & RUBRICS ---
  const [curriculumData, setCurriculumData] = useState<typeof CURRICULUM_INFO>(CURRICULUM_INFO);

  const updateCurriculumData = (data: typeof CURRICULUM_INFO) => {
    setCurriculumData(data);
    dataService.saveDoc('curriculum', 'main', data);
  };

  const [isCourseInfoModalOpen, setIsCourseInfoModalOpen] = useState(false);
  const [courseSubject, setCourseSubject] = useState('');
  const [courseGrade, setCourseGrade] = useState('');
  const [courseUnit, setCourseUnit] = useState('');
  const [courseSubUnit, setCourseSubUnit] = useState('');
  const [courseHours, setCourseHours] = useState(4);
  const [courseStandard, setCourseStandard] = useState('');
  const [courseStandardDetail, setCourseStandardDetail] = useState('');

  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  const [editingIndicatorIdx, setEditingIndicatorIdx] = useState<number>(-1);
  const [indCode, setIndCode] = useState('');
  const [indDesc, setIndDesc] = useState('');
  const [indK, setIndK] = useState('');
  const [indP, setIndP] = useState('');
  const [indA, setIndA] = useState('');

  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [editingRubricIdx, setEditingRubricIdx] = useState<number>(-1);
  const [rubCriteria, setRubCriteria] = useState('');
  const [rubL4, setRubL4] = useState('');
  const [rubL3, setRubL3] = useState('');
  const [rubL2, setRubL2] = useState('');
  const [rubL1, setRubL1] = useState('');

  // Handlers for persistence
  const updateStudentsList = (newList: StudentRecord[]) => {
    // In Firestore model, we don't save the whole list at once
    // We update individual docs. This helper is now mostly for local state fallback
    setStudentsList(newList);
  };

  const updateAnnouncements = (newAnnouncements: ClassAnnouncement[]) => {
    setAnnouncements(newAnnouncements);
  };

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      playBadgeUnlockSound();
      alert('⏰ หมดเวลาทำกิจกรรมแล้วครับ/ค่ะ นักเรียนทุกคน!');
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Filtered students
  const filteredStudents = (studentsList || []).filter(std => {
    if (!std) return false;
    const matchClass = selectedClassFilter === 'all' || std.classroom === selectedClassFilter;
    const matchSearch = (std.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (std.studentNumber || '').toString().includes(searchQuery) ||
      (std.classroom || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });

  // Stats calculation
  const totalStudents = (studentsList || []).length;
  const passedExamCount = (studentsList || []).filter(s => s && s.quizScore >= 8).length;
  const avgExamScore = ((studentsList || []).reduce((acc, s) => acc + (s?.quizScore || 0), 0) / (totalStudents || 1)).toFixed(1);
  const bossDefeatedCount = (studentsList || []).filter(s => s && s.bossDefeated).length;
  const certifiedCount = (studentsList || []).filter(s => s && s.certificateEarned).length;

  // Handlers
  const handleAwardBonus = (studentId: string) => {
    playCoinSound();
    const student = studentsList.find(s => s.id === studentId);
    if (!student) return;

    const updatedData = {
      exp: (student.exp || 0) + bonusExpInput,
      coins: (student.coins || 0) + bonusCoinInput,
      teacherNotes: teacherNoteInput.trim() || student.teacherNotes || '',
    };

    dataService.saveDoc('users', studentId, updatedData);
    
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent({
        ...selectedStudent,
        ...updatedData
      });
    }
    onShowToast('มอบรางวัลสำเร็จ!', `มอบ +${bonusExpInput} EXP และ +${bonusCoinInput} เหรียญ แก่นักเรียนเรียบร้อย`, 'exp');
  };

  const handleUnlockAllZonesForStudent = (studentId: string) => {
    playBadgeUnlockSound();
    const student = studentsList.find(s => s.id === studentId);
    if (!student) return;

    const updatedData = {
      completedZones: 6,
      completedCasesCount: 4,
      certificateEarned: true,
      quizScore: Math.max(student.quizScore || 0, 9),
    };

    dataService.saveDoc('users', studentId, updatedData);

    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent({
        ...selectedStudent,
        ...updatedData
      });
    }
    onShowToast('ปลดล็อกด่านสำเร็จ', 'ปลดล็อกทุกด่านและภารกิจให้นักเรียนเรียบร้อยแล้ว', 'badge');
  };

  const handleDemoUnlockAll = () => {
    playBadgeUnlockSound();
    onUpdateProfile(prev => ({
      ...prev,
      level: Math.max(prev.level || 1, 10),
      exp: Math.max(prev.exp || 0, 500),
      coins: Math.max(prev.coins || 0, 999),
      unlockedZones: [
        'hq',
        'hq_overview',
        'missions',
        'shop',
        'reward_shop',
        'community',
        'profile',
        'zone1_basics',
        'zone2_spells',
        'zone3_trust',
        'zone4_cases',
        'zone5_sandbox',
        'zone6_exam',
        'boss_battle',
        'summary_cert',
      ],
      completedCases: ['case_01', 'case_02', 'case_03', 'case_04'],
      quizScore: 10,
      bossDefeated: true,
    }));
    onShowToast('เปิดโหมดสาธิตการสอน', 'ปลดล็อกทุกด่าน ด่าน 1-6 และบอสใหญ่ สำหรับขึ้นจอโปรเจกเตอร์เรียบร้อย!', 'badge');
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) {
      playWrongSound();
      alert('กรุณากรอกหัวข้อและเนื้อหาประกาศ');
      return;
    }
    playClickSound();
    const newAnn: any = {
      title: newAnnTitle.trim(),
      content: newAnnContent.trim(),
      targetClass: newAnnTarget,
      date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
      timestamp: Date.now(),
      important: newAnnImportant,
      author: profile.name || 'คุณครูผู้สอน',
    };
    
    dataService.addDoc('announcements', newAnn);
    setNewAnnTitle('');
    setNewAnnContent('');
    onShowToast('ส่งประกาศสำเร็จ', 'ประกาศถูกส่งถึงหน้าจอนักเรียนทุกคนเรียบร้อย', 'exp');
  };

  // --- HANDLERS FOR STUDENT CRUD ---
  const handleOpenAddStudent = () => {
    playClickSound();
    setEditingStudent(null);
    const nextNum = (studentsList || []).length > 0 ? Math.max(...(studentsList || []).map(s => s.studentNumber)) + 1 : 1;
    setStdNumber(nextNum);
    setStdName('');
    setStdClassroom('ป.5/1');
    setStdAvatar('👦');
    setStdLevel(1);
    setStdExp(0);
    setStdCoins(50);
    setStdQuizScore(0);
    setStdIndicator1('ยังไม่ผ่าน');
    setStdIndicator2('ยังไม่ผ่าน');
    setStdNotes('');
    setIsAddStudentOpen(true);
  };

  const handleOpenEditStudent = (student: StudentRecord) => {
    playClickSound();
    setEditingStudent(student);
    setStdNumber(student.studentNumber);
    setStdName(student.name);
    setStdClassroom(student.classroom);
    setStdAvatar(student.avatar);
    setStdLevel(student.level);
    setStdExp(student.exp);
    setStdCoins(student.coins);
    setStdQuizScore(student.quizScore);
    setStdIndicator1(student.indicator1Status);
    setStdIndicator2(student.indicator2Status);
    setStdNotes(student.teacherNotes || '');
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stdName.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุลนักเรียน');
      return;
    }
    playCorrectSound();
    if (editingStudent) {
      const updatedData = {
        studentNumber: stdNumber,
        name: stdName.trim(),
        classroom: stdClassroom,
        avatar: stdAvatar,
        level: stdLevel,
        exp: stdExp,
        coins: stdCoins,
        quizScore: stdQuizScore,
        indicator1Status: stdIndicator1,
        indicator2Status: stdIndicator2,
        teacherNotes: stdNotes.trim() || '',
      };
      dataService.saveDoc('users', editingStudent.id, updatedData);
      onShowToast('อัปเดตข้อมูลนักเรียนเรียบร้อย', `บันทึกข้อมูลของ ${stdName} เรียบร้อยแล้ว`);
      setEditingStudent(null);
    } else {
      const newStd: any = {
        studentNumber: stdNumber,
        name: stdName.trim(),
        avatar: stdAvatar,
        classroom: stdClassroom,
        level: stdLevel,
        exp: stdExp,
        coins: stdCoins,
        quizScore: stdQuizScore,
        totalQuizAttempts: 0,
        completedZones: 0,
        completedCasesCount: 0,
        bossDefeated: false,
        certificateEarned: false,
        lastActive: 'เพิ่งเพิ่มในระบบ',
        indicator1Status: stdIndicator1,
        indicator2Status: stdIndicator2,
        teacherNotes: stdNotes.trim() || '',
        role: 'student'
      };
      dataService.addDoc('users', newStd);
      onShowToast('เพิ่มนักเรียนเรียบร้อย', `เพิ่ม ${newStd.name} เข้าสู่ทะเบียนนักเรียนแล้ว`);
      setIsAddStudentOpen(false);
    }
  };

  const handleDeleteStudent = (studentId: string, name: string) => {
    if (confirm(`คุณครูแน่ใจหรือว่าต้องการลบรายชื่อนักเรียน "${name}" ออกจากระบบทะเบียน?`)) {
      playClickSound();
      dataService.deleteDoc('users', studentId);
      if (selectedStudent?.id === studentId) setSelectedStudent(null);
      onShowToast('ลบนักเรียนแล้ว', `นำรายชื่อ ${name} ออกจากระบบเรียบร้อย`);
    }
  };

  // --- HANDLERS FOR LESSON MATERIAL CRUD ---
  const handleOpenAddMaterial = () => {
    playClickSound();
    setEditingMaterial(null);
    setMatTitle('');
    setMatCategory('video');
    setMatDesc('');
    setMatUrl('');
    setIsMaterialModalOpen(true);
  };

  const handleOpenEditMaterial = (mat: LessonMaterial) => {
    playClickSound();
    setEditingMaterial(mat);
    setMatTitle(mat.title);
    setMatCategory(mat.category);
    setMatDesc(mat.description);
    setMatUrl(mat.fileOrUrl);
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) { alert('กรุณาระบุชื่อสื่อบทเรียน'); return; }
    playCorrectSound();
    const today = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    if (editingMaterial) {
      const updatedData = {
        title: matTitle.trim(),
        category: matCategory,
        description: matDesc.trim(),
        fileOrUrl: matUrl.trim() || '#',
        updatedAt: today,
      };
      dataService.saveDoc('lesson_materials', editingMaterial.id, updatedData);
      onShowToast('บันทึกสื่อการสอนสำเร็จ', `อัปเดต "${matTitle}" เรียบร้อยแล้ว`);
    } else {
      const newMat: any = {
        title: matTitle.trim(),
        category: matCategory,
        description: matDesc.trim(),
        fileOrUrl: matUrl.trim() || '#',
        updatedAt: today,
        viewsCount: 0,
      };
      dataService.addDoc('lesson_materials', newMat);
      onShowToast('เพิ่มสื่อการสอนแล้ว', `เพิ่ม "${matTitle}" ในคลังสื่อบทเรียนแล้ว`);
    }
    setIsMaterialModalOpen(false);
  };

  const handleDeleteMaterial = (matId: string, title: string) => {
    if (confirm(`ต้องการลบสื่อบทเรียน "${title}" ออกจากระบบหรือไม่?`)) {
      playClickSound();
      dataService.deleteDoc('lesson_materials', matId);
      onShowToast('ลบสื่อการสอนแล้ว', `นำ "${title}" ออกจากคลังสื่อแล้ว`);
    }
  };

  // --- HANDLERS FOR ANNOUNCEMENT EDIT ---
  const handleOpenEditAnnouncement = (ann: ClassAnnouncement) => {
    playClickSound();
    setEditingAnnouncement(ann);
    setEditAnnTitle(ann.title);
    setEditAnnContent(ann.content);
    setEditAnnTarget(ann.targetClass);
    setEditAnnImportant(ann.important);
  };

  const handleSaveEditAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement || !editAnnTitle.trim() || !editAnnContent.trim()) return;
    playCorrectSound();
    const updatedData = {
      title: editAnnTitle.trim(),
      content: editAnnContent.trim(),
      targetClass: editAnnTarget,
      important: editAnnImportant,
    };
    dataService.saveDoc('announcements', editingAnnouncement.id, updatedData);
    setEditingAnnouncement(null);
    onShowToast('แก้ไขประกาศสำเร็จ', 'อัปเดตเนื้อหาประกาศเรียบร้อย');
  };

  const handleDeleteAnnouncement = (id: string, title?: string) => {
    if (confirm(`ต้องการลบประกาศ ${title ? `"${title}"` : ''} หรือไม่?`)) {
      playClickSound();
      dataService.deleteDoc('announcements', id);
      onShowToast('ลบประกาศแล้ว', 'นำประกาศออกจากระบบเรียบร้อย');
    }
  };

  // --- HANDLERS FOR CURRICULUM, INDICATORS & RUBRICS ---
  const handleOpenEditCourseInfo = () => {
    playClickSound();
    setCourseSubject(curriculumData.subjectName);
    setCourseGrade(curriculumData.grade);
    setCourseUnit(curriculumData.unitTitle);
    setCourseSubUnit(curriculumData.subUnit);
    setCourseHours(curriculumData.totalHours);
    setCourseStandard(curriculumData.standard);
    setCourseStandardDetail(curriculumData.standardDetail);
    setIsCourseInfoModalOpen(true);
  };

  const handleSaveCourseInfo = (e: React.FormEvent) => {
    e.preventDefault();
    playCorrectSound();
    const updated = {
      subjectName: courseSubject,
      grade: courseGrade,
      unitTitle: courseUnit,
      subUnit: courseSubUnit,
      totalHours: Number(courseHours),
      standard: courseStandard,
      standardDetail: courseStandardDetail,
    };
    dataService.saveDoc('curriculum', 'main', updated);
    setIsCourseInfoModalOpen(false);
    onShowToast('บันทึกแผนการสอนสำเร็จ', 'อัปเดตข้อมูลโครงสร้างวิชาและมาตรฐานเรียบร้อย');
  };

  const handleOpenAddIndicator = () => {
    playClickSound();
    setEditingIndicatorIdx(-1);
    setIndCode('ว 4.2 ป.5/3');
    setIndDesc('');
    setIndK('');
    setIndP('');
    setIndA('');
    setIsIndicatorModalOpen(true);
  };

  const handleOpenEditIndicator = (index: number) => {
    playClickSound();
    const target = curriculumData.indicators[index];
    setEditingIndicatorIdx(index);
    setIndCode(target.code);
    setIndDesc(target.description);
    setIndK(target.objectives[0] || '');
    setIndP(target.objectives[1] || '');
    setIndA(target.objectives[2] || '');
    setIsIndicatorModalOpen(true);
  };

  const handleSaveIndicator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indCode.trim() || !indDesc.trim()) return;
    playCorrectSound();
    const newInd = {
      code: indCode.trim(),
      description: indDesc.trim(),
      objectives: [
        indK.trim() ? indK.trim() : 'K (ความรู้): ',
        indP.trim() ? indP.trim() : 'P (ทักษะ): ',
        indA.trim() ? indA.trim() : 'A (เจตคติ): ',
      ],
    };
    const updatedIndicators = [...curriculumData.indicators];
    if (editingIndicatorIdx >= 0) {
      updatedIndicators[editingIndicatorIdx] = newInd;
    } else {
      updatedIndicators.push(newInd);
    }
    updateCurriculumData({ ...curriculumData, indicators: updatedIndicators });
    setIsIndicatorModalOpen(false);
    onShowToast('บันทึกตัวชี้วัดสำเร็จ', 'อัปเดตตัวชี้วัดและจุดประสงค์ K-P-A เรียบร้อย');
  };

  const handleDeleteIndicator = (index: number) => {
    if (confirm('ต้องการลบตัวชี้วัดนี้ใช่หรือไม่?')) {
      playClickSound();
      const updatedIndicators = curriculumData.indicators.filter((_, i) => i !== index);
      updateCurriculumData({ ...curriculumData, indicators: updatedIndicators });
      onShowToast('ลบตัวชี้วัดแล้ว', 'นำตัวชี้วัดออกจากระบบเรียบร้อย');
    }
  };

  const handleOpenAddRubric = () => {
    playClickSound();
    setEditingRubricIdx(-1);
    setRubCriteria('');
    setRubL4('');
    setRubL3('');
    setRubL2('');
    setRubL1('');
    setIsRubricModalOpen(true);
  };

  const handleOpenEditRubric = (index: number) => {
    playClickSound();
    const target = curriculumData.rubrics[index];
    setEditingRubricIdx(index);
    setRubCriteria(target.criteria);
    setRubL4(target.level4);
    setRubL3(target.level3);
    setRubL2(target.level2);
    setRubL1(target.level1);
    setIsRubricModalOpen(true);
  };

  const handleSaveRubric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rubCriteria.trim()) return;
    playCorrectSound();
    const newRub = {
      criteria: rubCriteria.trim(),
      level4: rubL4.trim(),
      level3: rubL3.trim(),
      level2: rubL2.trim(),
      level1: rubL1.trim(),
    };
    const updatedRubrics = [...curriculumData.rubrics];
    if (editingRubricIdx >= 0) {
      updatedRubrics[editingRubricIdx] = newRub;
    } else {
      updatedRubrics.push(newRub);
    }
    updateCurriculumData({ ...curriculumData, rubrics: updatedRubrics });
    setIsRubricModalOpen(false);
    onShowToast('บันทึกเกณฑ์ Rubrics สำเร็จ', 'อัปเดตเกณฑ์ประเมินเรียบร้อย');
  };

  const handleDeleteRubric = (index: number) => {
    if (confirm('ต้องการลบเกณฑ์การประเมินนี้หรือไม่?')) {
      playClickSound();
      const updatedRubrics = curriculumData.rubrics.filter((_, i) => i !== index);
      updateCurriculumData({ ...curriculumData, rubrics: updatedRubrics });
      onShowToast('ลบเกณฑ์ประเมินแล้ว', 'นำเกณฑ์ Rubrics ออกเรียบร้อย');
    }
  };

  // --- HANDLERS FOR GROUPS CRUD ---
  const handleAddGroup = () => {
    const name = prompt('กรุณากรอกชื่อกลุ่มเรียนรู้ใหม่:', `กลุ่มที่ ${(groupsList || []).length + 1}`);
    if (name && name.trim()) {
      playCorrectSound();
      const newGroup = { id: 'grp_' + Date.now(), name: name.trim(), score: 0 };
      dataService.saveDoc('classroom_groups', newGroup.id, newGroup);
      onShowToast('เพิ่มกลุ่มสำเร็จ', `เพิ่มกลุ่ม "${name.trim()}" เรียบร้อยแล้ว`);
    }
  };

  const handleEditGroupName = (id: string, currentName: string) => {
    const name = prompt('แก้ไขชื่อกลุ่มเรียนรู้:', currentName);
    if (name && name.trim()) {
      playClickSound();
      dataService.saveDoc('classroom_groups', id, { name: name.trim() });
      onShowToast('เปลี่ยนชื่อกลุ่มสำเร็จ', `อัปเดตเป็น "${name.trim()}" เรียบร้อย`);
    }
  };

  const handleDeleteGroup = (id: string, name: string) => {
    if (confirm(`ต้องการลบกลุ่ม "${name}" ออกจากระบบหรือไม่?`)) {
      playClickSound();
      dataService.deleteDoc('classroom_groups', id);
      onShowToast('ลบกลุ่มเรียบร้อย', `นำกลุ่ม "${name}" ออกแล้ว`);
    }
  };

  const handleExportCSV = () => {
    playClickSound();
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'เลขที่,ชื่อ-นามสกุล,ห้องเรียน,ระดับเลเวล,EXP,เหรียญ,คะแนนสอบ(เต็ม 10),ผ่านครบทุกด่าน,ปราบ Boss,ตัวชี้วัด 1 (คำค้นหา & Operators),ตัวชี้วัด 2 (ความน่าเชื่อถือ),หมายเหตุครู\n';
    
    studentsList.forEach(s => {
      const row = [
        s.studentNumber,
        `"${s.name}"`,
        s.classroom,
        s.level,
        s.exp,
        s.coins,
        s.quizScore,
        s.completedZones >= 6 ? 'ผ่านครบ' : `ผ่าน ${s.completedZones}/6`,
        s.bossDefeated ? 'สำเร็จ' : 'ยังไม่สำเร็จ',
        s.indicator1Status,
        s.indicator2Status,
        `"${s.teacherNotes || '-'}"`,
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `สรุปผลการเรียนรู้_วิทยาการคำนวณ_ป5_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('ดาวน์โหลดรายงานแล้ว', 'ส่งออกข้อมูลคะแนนนักเรียนรูปแบบ CSV เรียบร้อย', 'exp');
  };

  const handlePickRandomStudent = () => {
    playClickSound();
    setIsPicking(true);
    let count = 0;
    const interval = setInterval(() => {
      const randomStd = (studentsList || [])[Math.floor(Math.random() * (studentsList || []).length)];
      setPickedStudent(randomStd);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setIsPicking(false);
        playBadgeUnlockSound();
      }
    }, 100);
  };

  const handleAdjustGroupScore = (groupId: string, delta: number) => {
    playCoinSound();
    const group = groupsList.find(g => g.id === groupId);
    if (group) {
      dataService.saveDoc('classroom_groups', groupId, { score: Math.max(0, (group.score || 0) + delta) });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Top Banner: Teacher Identity & Quick Action Strip */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 rounded-3xl p-5 sm:p-7 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Teacher Title & Info */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl sm:text-4xl">
                👩‍🏫
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-emerald-500 text-slate-950 font-black text-[9px] border border-emerald-300">
                TEACHER
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  ระบบสารสนเทศสำหรับครูผู้สอน
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  สิทธิ์ครูประจำชั้น (Teacher Only)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200/80 mt-1">
                วิชาวิทยาศาสตร์และเทคโนโลยี (วิทยาการคำนวณ) ชั้น ป.5 • หน่วยการเรียนรู้ที่ 3 ข้อมูลสารสนเทศ
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-300">
                <span>ครูผู้สอน: <strong className="text-white">{profile.authUser?.name || 'คุณครูรูริยะ'}</strong></span>
                <span>•</span>
                <span>โรงเรียน: <strong className="text-emerald-300">{profile.authUser?.schoolName || 'โรงเรียนสาธิตวิทยาการ'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Presenter Controls */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            {/* Demo Unlock All Button */}
            <button
              onClick={handleDemoUnlockAll}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
              title="ปลดล็อกทุกด่านทันที สำหรับการสาธิตการสอนหน้าห้องเรียน"
            >
              <Unlock className="w-4 h-4" />
              <span>โหมดสาธิต (ปลดล็อกทุกด่าน)</span>
            </button>

            {/* Teacher PIN Security Control */}
            <button
              onClick={() => {
                playClickSound();
                setShowPinSettings(true);
                setPinSuccessMsg(false);
              }}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition"
              title="ตั้งค่าหรือเปลี่ยนรหัสผ่านเข้าใช้งานระบบครูผู้สอน"
            >
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>รหัสเข้าใช้ครู ({teacherPinValue})</span>
            </button>

            {/* Switch to Student Game View */}
            <button
              onClick={() => {
                playClickSound();
                onNavigateTab('hq_overview');
              }}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 text-emerald-200 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition"
              title="สลับไปยังหน้าจอเส้นทางผจญภัยของนักเรียน"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>ดูมุมมองนักเรียน (แผนที่เกม)</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="mt-6 pt-4 border-t border-emerald-800/40 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => { playClickSound(); setActiveTeacherTab('overview'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTeacherTab === 'overview'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'bg-emerald-950/60 text-emerald-200/90 hover:bg-emerald-900/60 border border-emerald-800/40'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> ภาพรวม & สถิติ
          </button>

          <button
            onClick={() => { playClickSound(); setActiveTeacherTab('students'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTeacherTab === 'students'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'bg-emerald-950/60 text-emerald-200/90 hover:bg-emerald-900/60 border border-emerald-800/40'
            }`}
          >
            <Users className="w-4 h-4" /> ทะเบียน & ผลการเรียน ({(studentsList || []).length})
          </button>

          <button
            onClick={() => { playClickSound(); setActiveTeacherTab('video_lessons'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTeacherTab === 'video_lessons'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'bg-emerald-950/60 text-emerald-200/90 hover:bg-emerald-900/60 border border-emerald-800/40'
            }`}
          >
            <Video className="w-4 h-4" /> จัดการวิดีโอบทเรียน
          </button>

          <button
            onClick={() => { playClickSound(); setActiveTeacherTab('curriculum'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTeacherTab === 'curriculum'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'bg-emerald-950/60 text-emerald-200/90 hover:bg-emerald-900/60 border border-emerald-800/40'
            }`}
          >
            <BookOpen className="w-4 h-4" /> แผนการสอน & ตัวชี้วัด
          </button>

          <button
            onClick={() => { playClickSound(); setActiveTeacherTab('announcements'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTeacherTab === 'announcements'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'bg-emerald-950/60 text-emerald-200/90 hover:bg-emerald-900/60 border border-emerald-800/40'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> ประกาศห้องเรียน ({(announcements || []).length})
          </button>

          <button
            onClick={() => { playClickSound(); setActiveTeacherTab('classroom_tools'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTeacherTab === 'classroom_tools'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'bg-emerald-950/60 text-emerald-200/90 hover:bg-emerald-900/60 border border-emerald-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4" /> เครื่องมือช่วยสอนหน้าห้อง
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUB-TAB 1: ภาพรวม & สถิติ (Overview & Analytics) */}
      {/* ============================================================ */}
      {activeTeacherTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Students Total */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">นักเรียนในระบบทั้งหมด</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-white">{totalStudents}</span>
                  <span className="text-xs text-emerald-400 font-bold">คน</span>
                </div>
                <span className="text-[10px] text-slate-400">ป.5/1 และ ป.5/2</span>
              </div>
            </div>

            {/* Card 2: Exam Pass Rate */}
            <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">อัตราผ่านการทดสอบ (≥80%)</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-white">
                    {Math.round((passedExamCount / (totalStudents || 1)) * 100)}%
                  </span>
                  <span className="text-xs text-blue-400 font-bold">({passedExamCount}/{totalStudents} คน)</span>
                </div>
                <span className="text-[10px] text-slate-400">เกณฑ์ประเมินยอดนักสืบ</span>
              </div>
            </div>

            {/* Card 3: Average Score */}
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">คะแนนสอบเฉลี่ย Zone 6</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-amber-400">{avgExamScore}</span>
                  <span className="text-xs text-slate-400 font-bold">/ 10 คะแนน</span>
                </div>
                <span className="text-[10px] text-emerald-400">อยู่ในเกณฑ์ "ดีเยี่ยม"</span>
              </div>
            </div>

            {/* Card 4: Boss Defeated & Certificates */}
            <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">ได้รับเกียรติบัตรแล้ว</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-white">{certifiedCount}</span>
                  <span className="text-xs text-purple-400 font-bold">ใบ</span>
                </div>
                <span className="text-[10px] text-slate-400">ปราบ Boss ข่าวลวง: {bossDefeatedCount} คน</span>
              </div>
            </div>
          </div>

          {/* Quick Learning Zones Progress Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  สถิติการผ่านแต่ละโซนการเรียนรู้ (Zone Progression)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ติดตามดูว่านักเรียนติดขัดในโซนหรือบทเรียนใด เพื่อจัดสอนซ่อมเสริมได้ตรงจุด
                </p>
              </div>
              <button
                onClick={() => setActiveTeacherTab('students')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                ดูรายชื่อนักเรียน <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { title: 'โซน 1: รู้จัก Search Engine & Keyword', passCount: 10, total: 10, color: 'bg-cyan-500' },
                { title: 'โซน 2: คลังคาถาตัวดำเนินการ ("", -, site:, filetype:)', passCount: 9, total: 10, color: 'bg-blue-500' },
                { title: 'โซน 3: แล็บตรวจความน่าเชื่อถือ & โดเมนเนม', passCount: 8, total: 10, color: 'bg-emerald-500' },
                { title: 'โซน 4: แฟ้มคดีปริศนา (Gamified Case Quests)', passCount: 7, total: 10, color: 'bg-purple-500' },
                { title: 'โซน 5: จำลองระบบค้นหาจริง & AI Assistant', passCount: 6, total: 10, color: 'bg-amber-500' },
                { title: 'โซน 6: สอบวัดระดับยอดนักสืบ & รับเกียรติบัตร', passCount: 6, total: 10, color: 'bg-rose-500' },
              ].map((zone, idx) => {
                const percent = Math.round((zone.passCount / zone.total) * 100);
                return (
                  <div key={idx} className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-200">{zone.title}</span>
                      <span className="font-mono text-emerald-300 font-bold">
                        {zone.passCount}/{zone.total} คน ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`${zone.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 2: ทะเบียน & ผลการเรียน (Students Management) */}
      {/* ============================================================ */}
      {activeTeacherTab === 'students' && (
        <div className="space-y-4">
          
          {/* Search, Filters & Export Header */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            
            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อ, เลขที่ หรือห้อง..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter Buttons, Add & Export */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setSelectedClassFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    selectedClassFilter === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ทั้งหมด ({(studentsList || []).length})
                </button>
                <button
                  onClick={() => setSelectedClassFilter('ป.5/1')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    selectedClassFilter === 'ป.5/1' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ป.5/1
                </button>
                <button
                  onClick={() => setSelectedClassFilter('ป.5/2')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    selectedClassFilter === 'ป.5/2' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ป.5/2
                </button>
              </div>

              {/* Add Student Button */}
              <button
                onClick={handleOpenAddStudent}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มนักเรียนใหม่</span>
              </button>

              {/* Export CSV Button */}
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-sm flex items-center gap-1.5 transition active:scale-95 border border-slate-700"
                title="ส่งออกรายงานคะแนนเป็นไฟล์ CSV/Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ส่งออก CSV</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800 font-mono">
                  <tr>
                    <th className="px-4 py-3">เลขที่</th>
                    <th className="px-4 py-3">นักเรียน</th>
                    <th className="px-4 py-3">ห้อง</th>
                    <th className="px-4 py-3">ระดับ / EXP</th>
                    <th className="px-4 py-3 text-center">คะแนน Zone 6</th>
                    <th className="px-4 py-3 text-center">ด่านที่ผ่าน</th>
                    <th className="px-4 py-3 text-center">ปราบ Boss</th>
                    <th className="px-4 py-3">การประเมิน ว 4.2</th>
                    <th className="px-4 py-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStudents.map(std => (
                    <tr key={std.id} className="hover:bg-slate-850/50 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-400">{std.studentNumber}</td>
                      <td className="px-4 py-3 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{std.avatar}</span>
                          <div>
                            <div>{std.name}</div>
                            <span className="text-[10px] text-slate-500 font-normal">{std.lastActive}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                          {std.classroom}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-amber-300">Lv.{std.level}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{std.exp} EXP</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-xl font-bold font-mono ${
                          std.quizScore >= 8 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : std.quizScore >= 5
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {std.quizScore} / 10
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-bold text-slate-200">
                          {std.completedZones} / 6
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {std.bossDefeated ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            ✅ ปราบแล้ว
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                            ยังไม่สู้
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[10px] text-emerald-400 font-medium">
                          {std.indicator1Status}
                        </div>
                        <div className="text-[10px] text-blue-400 font-medium">
                          {std.indicator2Status}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              playClickSound();
                              setSelectedStudent(std);
                              setTeacherNoteInput(std.teacherNotes || '');
                            }}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 font-bold text-[11px] transition"
                            title="ตรวจ/ให้คะแนน"
                          >
                            ตรวจ/ให้คะแนน
                          </button>
                          <button
                            onClick={() => handleOpenEditStudent(std)}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition"
                            title="แก้ไขข้อมูลนักเรียน"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(std.id, std.name)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                            title="ลบนักเรียน"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 3: จัดการวิดีโอบทเรียน (Lesson Video Manager) */}
      {/* ============================================================ */}
      {activeTeacherTab === 'video_lessons' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-400" />
                ระบบจัดการวิดีโอคลิปการสอนของครู (Lesson Video Settings)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                คุณครูสามารถอัปโหลดคลิปวิดีโอการสอนของตนเอง หรือเปลี่ยนวิดีโอที่ให้นักเรียนรับชมในหน้า "บทเรียน / บันทึกของฉัน" ได้อย่างอิสระ
              </p>
            </div>

            {/* Current Active Video Preview */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  วิดีโอที่ใช้งานอยู่ในปัจจุบัน: <strong className="text-emerald-400">{currentVideoSrc}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                  พร้อมใช้งานในหน้านักเรียน
                </span>
              </div>

              {/* Video Player Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-xl mx-auto border border-slate-800">
                <video
                  key={currentVideoSrc}
                  controls
                  className="w-full h-full object-contain"
                >
                  <source src={currentVideoSrc} type="video/mp4" />
                  เบราว์เซอร์ไม่รองรับการเล่นวิดีโอ
                </video>
              </div>
            </div>

            {/* Upload & Link Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Option A: Upload Video File */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  อัปโหลดไฟล์คลิปวิดีโอใหม่ (MP4 / WebM)
                </h4>
                <p className="text-xs text-slate-400">
                  เลือกไฟล์คลิปการสอนจากคอมพิวเตอร์ของคุณเพื่อบันทึกลงในระบบ
                </p>

                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  id="teacher-video-upload"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      playClickSound();
                      setVideoUploadMsg('กำลังอัปโหลดวิดีโอของคุณ...');
                      const objUrl = URL.createObjectURL(file);
                      setCurrentVideoSrc(objUrl);
                      dataService.saveDoc('settings', 'teacher_config', { customVideoSrc: objUrl, isCustomVideo: true });

                      // Upload to server
                      try {
                        const formData = new FormData();
                        formData.append('video', file);
                        const res = await fetch('/api/upload-video', {
                          method: 'POST',
                          body: formData,
                        });
                        const data = await res.json();
                        if (data.success) {
                          setVideoUploadMsg('✅ บันทึกวิดีโอบทเรียนลงระบบเซิร์ฟเวอร์เรียบร้อย!');
                        } else {
                          setVideoUploadMsg('✅ กำหนดใช้วิดีโอในอุปกรณ์นี้เรียบร้อย');
                        }
                      } catch {
                        setVideoUploadMsg('✅ กำหนดใช้วิดีโอในอุปกรณ์นี้เรียบร้อย');
                      }
                      setTimeout(() => setVideoUploadMsg(null), 4000);
                      onShowToast('เปลี่ยนวิดีโอสำเร็จ', 'นักเรียนจะเห็นวิดีโอนี้ในหน้าบทเรียนทันที', 'exp');
                    }
                  }}
                />

                <label
                  htmlFor="teacher-video-upload"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition active:scale-95 text-center block"
                >
                  <Upload className="w-4 h-4" />
                  <span>คลิกเพื่อเลือกไฟล์วิดีโอจากเครื่อง</span>
                </label>

                {videoUploadMsg && (
                  <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs font-bold text-center animate-fadeIn">
                    {videoUploadMsg}
                  </div>
                )}
              </div>

              {/* Option B: Direct URL / Video Link */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                  กำหนดผ่านลิงก์วิดีโอออนไลน์ (Direct URL)
                </h4>
                <p className="text-xs text-slate-400">
                  กรอกลิงก์ไฟล์วิดีโอ .mp4 ออนไลน์ เพื่อใช้เป็นบทเรียน
                </p>

                <div className="space-y-2">
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={e => setVideoUrlInput(e.target.value)}
                    placeholder="https://example.com/lesson-video.mp4"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (videoUrlInput.trim()) {
                          playClickSound();
                          setCurrentVideoSrc(videoUrlInput.trim());
                          dataService.saveDoc('settings', 'teacher_config', { customVideoSrc: videoUrlInput.trim(), isCustomVideo: true });
                          setVideoUrlInput('');
                          onShowToast('อัปเดตลิงก์วิดีโอแล้ว', 'เปลี่ยนวิดีโอบทเรียนเรียบร้อย', 'exp');
                        }
                      }}
                      className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition active:scale-95"
                    >
                      นำไปใช้ทันที
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        setCurrentVideoSrc('/lesson.mp4');
                        dataService.saveDoc('settings', 'teacher_config', { customVideoSrc: '/lesson.mp4', isCustomVideo: false });
                        onShowToast('รีเซ็ตสำเร็จ', 'เปลี่ยนกลับเป็นวิดีโอเริ่มต้น (lesson.mp4)', 'exp');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                    >
                      รีเซ็ตเป็นค่าเริ่มต้น
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Lesson Materials & Handouts Repository */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-400" />
                  คลังสื่อ & ใบงานประกอบบทเรียน ({(lessonMaterials || []).length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  จัดการเอกสาร ใบงาน ลิงก์อ่านเพิ่มเติมสำหรับนักเรียน ป.5
                </p>
              </div>

              <button
                onClick={handleOpenAddMaterial}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition active:scale-95 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มสื่อบทเรียนใหม่</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lessonMaterials.map(mat => (
                <div
                  key={mat.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        mat.category === 'video'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : mat.category === 'pdf'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : mat.category === 'worksheet'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}>
                        {mat.category === 'video' ? '🎬 คลิปวิดีโอ' : mat.category === 'pdf' ? '📄 ไฟล์ PDF' : mat.category === 'worksheet' ? '📝 ใบงาน/แบบฝึก' : '🌐 ลิงก์ภายนอก'}
                      </span>
                      <span className="text-[10px] text-slate-500">{mat.updatedAt}</span>
                    </div>

                    <h4 className="font-bold text-white text-sm line-clamp-1">{mat.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{mat.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500">
                      เข้าชม {mat.viewsCount} ครั้ง
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditMaterial(mat)}
                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition text-xs font-bold flex items-center gap-1"
                        title="แก้ไขสื่อนี้"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition text-xs font-bold"
                        title="ลบสื่อนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 4: แผนการสอน & ตัวชี้วัด (Curriculum & Rubrics) */}
      {/* ============================================================ */}
      {activeTeacherTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
            
            {/* Header with Print & Edit buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  แผนการจัดการเรียนรู้ & โครงสร้างหลักสูตรแกนกลาง
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  หลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พุทธศักราช 2551 (ฉบับปรับปรุง พ.ศ. 2560)
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleOpenEditCourseInfo}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>แก้ไขโครงสร้างวิชา</span>
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    window.print();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>พิมพ์แผน (Print)</span>
                </button>
              </div>
            </div>

            {/* Curriculum Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold">ข้อมูลทั่วไปของหน่วยการเรียนรู้:</span>
                <ul className="space-y-1 text-slate-300 leading-relaxed">
                  <li>• <strong>กลุ่มสาระฯ:</strong> {curriculumData.subjectName}</li>
                  <li>• <strong>ระดับชั้น:</strong> {curriculumData.grade}</li>
                  <li>• <strong>หน่วยการเรียนรู้:</strong> {curriculumData.unitTitle}</li>
                  <li>• <strong>เรื่อง:</strong> {curriculumData.subUnit}</li>
                  <li>• <strong>เวลาเรียน:</strong> {curriculumData.totalHours} ชั่วโมง</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-cyan-400 font-bold">มาตรฐานการเรียนรู้:</span>
                <p className="text-slate-300 leading-relaxed">
                  <strong>{curriculumData.standard}:</strong> {curriculumData.standardDetail}
                </p>
              </div>
            </div>

            {/* Indicators & K-P-A List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ตัวชี้วัด & จุดประสงค์การเรียนรู้ (Indicators & Objectives)
                </h4>
                <button
                  onClick={handleOpenAddIndicator}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 font-bold text-xs transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มตัวชี้วัด</span>
                </button>
              </div>

              <div className="space-y-3">
                {curriculumData.indicators.map((ind, index) => (
                  <div key={index} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                          {ind.code}
                        </span>
                        <span className="font-bold text-white text-sm">
                          {ind.description}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenEditIndicator(index)}
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition text-xs font-bold flex items-center gap-1"
                          title="แก้ไขตัวชี้วัด"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteIndicator(index)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition text-xs font-bold"
                          title="ลบตัวชี้วัด"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400 font-bold text-[11px]">จุดประสงค์การเรียนรู้ (K-P-A):</span>
                      {ind.objectives.map((obj, i) => (
                        <div key={i} className="flex items-start gap-2 text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rubrics Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  เกณฑ์การประเมินชิ้นงานและการปฏิบัติกิจกรรม (Rubrics Scoring Scale)
                </h4>
                <button
                  onClick={handleOpenAddRubric}
                  className="px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 font-bold text-xs transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มเกณฑ์ Rubrics</span>
                </button>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 text-[11px] border-b border-slate-800 font-bold">
                    <tr>
                      <th className="px-4 py-3 w-1/5">ประเด็นการประเมิน</th>
                      <th className="px-3 py-3 text-emerald-300">ระดับ 4 (ดีเยี่ยม)</th>
                      <th className="px-3 py-3 text-blue-300">ระดับ 3 (ดี)</th>
                      <th className="px-3 py-3 text-amber-300">ระดับ 2 (พอใช้)</th>
                      <th className="px-3 py-3 text-rose-300">ระดับ 1 (ปรับปรุง)</th>
                      <th className="px-3 py-3 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {curriculumData.rubrics.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="px-4 py-3 font-bold text-white align-top">{r.criteria}</td>
                        <td className="px-3 py-3 text-[11px] leading-relaxed text-slate-200 align-top">{r.level4}</td>
                        <td className="px-3 py-3 text-[11px] leading-relaxed text-slate-300 align-top">{r.level3}</td>
                        <td className="px-3 py-3 text-[11px] leading-relaxed text-slate-400 align-top">{r.level2}</td>
                        <td className="px-3 py-3 text-[11px] leading-relaxed text-slate-500 align-top">{r.level1}</td>
                        <td className="px-3 py-3 text-right align-top">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditRubric(i)}
                              className="p-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition"
                              title="แก้ไขเกณฑ์ประเมิน"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRubric(i)}
                              className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                              title="ลบเกณฑ์ประเมิน"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 5: ประกาศห้องเรียน (Announcements) */}
      {/* ============================================================ */}
      {activeTeacherTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* New Announcement Form */}
          <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 h-fit">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              เขียนประกาศใหม่ถึงนักเรียน
            </h3>

            <form onSubmit={handleAddAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">หัวข้อประกาศ:</label>
                <input
                  type="text"
                  value={newAnnTitle}
                  onChange={e => setNewAnnTitle(e.target.value)}
                  placeholder="เช่น กำหนดส่งงานแฟ้มคดีปริศนา..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">กลุ่มเป้าหมาย:</label>
                <select
                  value={newAnnTarget}
                  onChange={e => setNewAnnTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ทุกห้องเรียน (ป.5/1 - ป.5/2)">ทุกห้องเรียน (ป.5/1 - ป.5/2)</option>
                  <option value="ป.5/1">เฉพาะห้อง ป.5/1</option>
                  <option value="ป.5/2">เฉพาะห้อง ป.5/2</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">เนื้อหาประกาศ:</label>
                <textarea
                  rows={4}
                  value={newAnnContent}
                  onChange={e => setNewAnnContent(e.target.value)}
                  placeholder="พิมพ์ข้อความแนะนำ หรือแจ้งเตือนนักเรียนที่นี่..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ann-important"
                  checked={newAnnImportant}
                  onChange={e => setNewAnnImportant(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="ann-important" className="text-slate-300 font-medium">
                  ปักหมุดเป็นประกาศสำคัญ (Important)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>ส่งประกาศถึงนักเรียนทันที</span>
              </button>
            </form>
          </div>

          {/* Published Announcements List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-black text-white flex items-center justify-between">
              <span>ประกาศทั้งหมด ({(announcements || []).length})</span>
              <span className="text-xs text-slate-400 font-normal">นักเรียนสามารถอ่านได้จากหน้าการแจ้งเตือน</span>
            </h3>

            <div className="space-y-3">
              {announcements.map(ann => (
                <div
                  key={ann.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-2 relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-white text-sm">{ann.title}</h4>
                        {ann.important && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                            สำคัญ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>ส่งถึง: <strong className="text-cyan-300">{ann.targetClass}</strong></span>
                        <span>•</span>
                        <span>{ann.date}</span>
                        <span>•</span>
                        <span>โดย {ann.author}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditAnnouncement(ann)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                        title="แก้ไขประกาศนี้"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="ลบประกาศนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 6: เครื่องมือช่วยสอนหน้าห้อง (Classroom Presenter Tools) */}
      {/* ============================================================ */}
      {activeTeacherTab === 'classroom_tools' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tool 1: Classroom Activity Timer */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-amber-400" />
                นาฬิกาจับเวลากิจกรรมสืบค้น
              </h3>
              <p className="text-xs text-slate-400">
                ใช้จับเวลาการทำภารกิจหรือทำแบบทดสอบร่วมกันในชั้นเรียน
              </p>
            </div>

            {/* Timer Display */}
            <div className="text-center py-6 bg-slate-950 rounded-2xl border border-slate-800 my-2">
              <span className="text-5xl font-black font-mono tracking-wider bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:
                {(timerSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Controls */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs transition shadow-md ${
                    timerRunning
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {timerRunning ? 'หยุดชั่วคราว' : 'เริ่มจับเวลา'}
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(300);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  รีเซ็ต (5 นาที)
                </button>
              </div>

              <div className="flex items-center gap-1.5 justify-center text-xs">
                {[1, 3, 5, 10, 15].map(mins => (
                  <button
                    key={mins}
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerSeconds(mins * 60);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-400/40 text-[11px] font-mono"
                  >
                    {mins} นาที
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tool 2: Random Student Picker */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
                <Shuffle className="w-5 h-5 text-cyan-400" />
                วงล้อสุ่มนักเรียนตอบคำถาม
              </h3>
              <p className="text-xs text-slate-400">
                สุ่มนักเรียนในห้องเพื่อตอบคำถาม หรือสาธิตการใช้ตัวดำเนินการ
              </p>
            </div>

            {/* Result Box */}
            <div className="text-center py-6 bg-slate-950 rounded-2xl border border-slate-800 my-2 min-h-[120px] flex flex-col items-center justify-center">
              {pickedStudent ? (
                <div className="animate-fadeIn">
                  <span className="text-4xl">{pickedStudent.avatar}</span>
                  <div className="text-base font-black text-white mt-1">
                    {pickedStudent.name}
                  </div>
                  <span className="text-xs text-cyan-300 font-bold">
                    เลขที่ {pickedStudent.studentNumber} ({pickedStudent.classroom})
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-500">
                  กดปุ่มด้านล่างเพื่อเริ่มสุ่มรายชื่อนักเรียน
                </span>
              )}
            </div>

            <button
              onClick={handlePickRandomStudent}
              disabled={isPicking}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Shuffle className={`w-4 h-4 ${isPicking ? 'animate-spin' : ''}`} />
              <span>{isPicking ? 'กำลังหมุนสุ่มรายชื่อ...' : '🎲 สุ่มเลือกนักเรียน'}</span>
            </button>
          </div>

          {/* Tool 3: Group Score Counter */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
                  <Flame className="w-5 h-5 text-rose-400" />
                  กระดานคะแนนกลุ่ม ({(groupsList || []).length} กลุ่ม)
                </h3>
                <p className="text-xs text-slate-400">
                  ให้คะแนนการตอบคำถามและการแข่งขันทักษะการสืบค้นแบบทีม
                </p>
              </div>

              <button
                onClick={handleAddGroup}
                className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition"
                title="เพิ่มกลุ่มเรียนรู้ใหม่"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มกลุ่ม</span>
              </button>
            </div>

            <div className="space-y-2 text-xs max-h-60 overflow-y-auto pr-1">
              {groupsList.map(g => (
                <div key={g.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                    <span className="font-bold text-slate-200 truncate">{g.name}</span>
                    <button
                      onClick={() => handleEditGroupName(g.id, g.name)}
                      className="p-1 text-slate-500 hover:text-blue-400 transition"
                      title="แก้ไขชื่อกลุ่ม"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(g.id, g.name)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="ลบกลุ่มนี้"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-black text-amber-300 text-sm">{g.score} คะแนน</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          playClickSound();
                          dataService.saveDoc('classroom_groups', g.id, { score: Math.max(0, (g.score || 0) - 1) });
                        }}
                        className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <button
                        onClick={() => {
                          playCoinSound();
                          dataService.saveDoc('classroom_groups', g.id, { score: (g.score || 0) + 1 });
                        }}
                        className="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (confirm('ต้องการรีเซ็ตคะแนนทุกกลุ่มกลับเป็น 0 ใช่หรือไม่?')) {
                  playClickSound();
                  groupsList.forEach(g => {
                    dataService.saveDoc('classroom_groups', g.id, { score: 0 });
                  });
                }
              }}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition"
            >
              รีเซ็ตคะแนนทุกกลุ่มเป็น 0
            </button>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ตรวจงาน & ให้รางวัลนักเรียนรายบุคคล (Student Detail Modal) */}
      {/* ============================================================ */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedStudent.avatar}</span>
                <div>
                  <h3 className="font-black text-white text-base">{selectedStudent.name}</h3>
                  <span className="text-xs text-cyan-300 font-bold">
                    เลขที่ {selectedStudent.studentNumber} • ห้อง {selectedStudent.classroom}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">คะแนนสอบ Zone 6</span>
                <strong className="text-emerald-400 text-base">{selectedStudent.quizScore} / 10</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">ผ่านด่านแล้ว</span>
                <strong className="text-cyan-400 text-base">{selectedStudent.completedZones} / 6</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">แฟ้มคดีที่ไขได้</span>
                <strong className="text-purple-400 text-base">{selectedStudent.completedCasesCount} / 4</strong>
              </div>
            </div>

            {/* Indicators Status */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <span className="text-slate-400 font-bold block text-[11px]">การประเมินตามตัวชี้วัด ว 4.2 ป.5/3:</span>
              <div className="flex items-center justify-between">
                <span>1. การกำหนดคำค้นหา & ตัวดำเนินการ:</span>
                <strong className="text-emerald-400">{selectedStudent.indicator1Status}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>2. การประเมินความน่าเชื่อถือ & โดเมน:</span>
                <strong className="text-blue-400">{selectedStudent.indicator2Status}</strong>
              </div>
            </div>

            {/* Teacher Bonus Awarding */}
            <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-500/30 space-y-2 text-xs">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-emerald-400" />
                มอบ EXP & เหรียญรางวัลพิเศษแก่นักเรียน:
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block mb-0.5">+EXP:</label>
                  <input
                    type="number"
                    value={bonusExpInput}
                    onChange={e => setBonusExpInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block mb-0.5">+เหรียญ (Coins):</label>
                  <input
                    type="number"
                    value={bonusCoinInput}
                    onChange={e => setBonusCoinInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs"
                  />
                </div>
                <button
                  onClick={() => handleAwardBonus(selectedStudent.id)}
                  className="px-4 py-2 mt-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition active:scale-95"
                >
                  มอบรางวัล
                </button>
              </div>
            </div>

            {/* Teacher Notes Input */}
            <div className="space-y-1 text-xs">
              <label className="text-slate-300 font-bold block">บันทึกข้อเสนอแนะของครู:</label>
              <textarea
                rows={2}
                value={teacherNoteInput}
                onChange={e => setTeacherNoteInput(e.target.value)}
                placeholder="เช่น ควรทบทวนเรื่องการใช้เครื่องหมายลบ (-) เพิ่มเติม..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Quick Zone Unlock for student */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleUnlockAllZonesForStudent(selectedStudent.id)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>ปลดล็อกทุกด่านให้นักเรียนคนนี้</span>
              </button>

              <button
                onClick={() => {
                  handleAwardBonus(selectedStudent.id);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                บันทึก & ปิด
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: เพิ่ม/แก้ไข ข้อมูลนักเรียน */}
      {(isAddStudentOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                {editingStudent ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่เข้าสู่ระบบ'}
              </h3>
              <button
                onClick={() => { setIsAddStudentOpen(false); setEditingStudent(null); }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">เลขที่:</label>
                  <input
                    type="number"
                    value={stdNumber}
                    onChange={e => setStdNumber(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">ชื่อ-นามสกุล:</label>
                  <input
                    type="text"
                    value={stdName}
                    onChange={e => setStdName(e.target.value)}
                    placeholder="เช่น ด.ช. สมชาย สายสืบ"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ห้องเรียน:</label>
                  <select
                    value={stdClassroom}
                    onChange={e => setStdClassroom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="ป.5/1">ป.5/1</option>
                    <option value="ป.5/2">ป.5/2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">รูปประจำตัว (Emoji):</label>
                  <input
                    type="text"
                    value={stdAvatar}
                    onChange={e => setStdAvatar(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">ระดับ (Level):</label>
                  <input
                    type="number"
                    value={stdLevel}
                    onChange={e => setStdLevel(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">EXP สะสม:</label>
                  <input
                    type="number"
                    value={stdExp}
                    onChange={e => setStdExp(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">เหรียญ (Coins):</label>
                  <input
                    type="number"
                    value={stdCoins}
                    onChange={e => setStdCoins(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">คะแนนสอบ (Zone 6):</label>
                  <input
                    type="number"
                    max={10}
                    min={0}
                    value={stdQuizScore}
                    onChange={e => setStdQuizScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">การประเมินตัวชี้วัดที่ 1:</label>
                  <select
                    value={stdIndicator1}
                    onChange={e => setStdIndicator1(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-bold"
                  >
                    <option value="ผ่านระดับดีเยี่ยม">ผ่านระดับดีเยี่ยม</option>
                    <option value="ผ่านระดับดี">ผ่านระดับดี</option>
                    <option value="ผ่านระดับพอใช้">ผ่านระดับพอใช้</option>
                    <option value="ยังไม่ผ่าน">ยังไม่ผ่าน</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">การประเมินตัวชี้วัดที่ 2:</label>
                  <select
                    value={stdIndicator2}
                    onChange={e => setStdIndicator2(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-blue-300 font-bold"
                  >
                    <option value="ผ่านระดับดีเยี่ยม">ผ่านระดับดีเยี่ยม</option>
                    <option value="ผ่านระดับดี">ผ่านระดับดี</option>
                    <option value="ผ่านระดับพอใช้">ผ่านระดับพอใช้</option>
                    <option value="ยังไม่ผ่าน">ยังไม่ผ่าน</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">บันทึกข้อเสนอแนะครู:</label>
                <textarea
                  rows={2}
                  value={stdNotes}
                  onChange={e => setStdNotes(e.target.value)}
                  placeholder="พิมพ์ข้อความบันทึกถึงนักเรียนคนนี้..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddStudentOpen(false); setEditingStudent(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md"
                >
                  {editingStudent ? 'บันทึกการแก้ไข' : 'เพิ่มนักเรียน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: เพิ่ม/แก้ไข สื่อบทเรียน */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-teal-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                {editingMaterial ? 'แก้ไขสื่อประกอบการสอน' : 'เพิ่มสื่อ/ใบงานใหม่เข้าคลัง'}
              </h3>
              <button
                onClick={() => setIsMaterialModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">ชื่อสื่อบทเรียน / เอกสาร:</label>
                <input
                  type="text"
                  value={matTitle}
                  onChange={e => setMatTitle(e.target.value)}
                  placeholder="เช่น ใบงานวิเคราะห์ความน่าเชื่อถือ..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">หมวดหมู่สื่อ:</label>
                <select
                  value={matCategory}
                  onChange={e => setMatCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="video">🎬 คลิปวิดีโอ (Video Clip)</option>
                  <option value="pdf">📄 ไฟล์เอกสาร (PDF Document)</option>
                  <option value="worksheet">📝 ใบงาน / แบบฝึกหัด (Worksheet)</option>
                  <option value="external_link">🌐 ลิงก์ภายนอก (External Link)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">คำอธิบายรายละเอียด:</label>
                <textarea
                  rows={3}
                  value={matDesc}
                  onChange={e => setMatDesc(e.target.value)}
                  placeholder="พิมพ์รายละเอียดสำหรับให้นักเรียนอ่านทำความเข้าใจ..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">URL ไฟล์หรือลิงก์ปลายทาง:</label>
                <input
                  type="text"
                  value={matUrl}
                  onChange={e => setMatUrl(e.target.value)}
                  placeholder="https://example.com/worksheet.pdf"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition shadow-md"
                >
                  {editingMaterial ? 'บันทึกการแก้ไข' : 'เพิ่มสื่อบทเรียน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: แก้ไข ประกาศห้องเรียน */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                แก้ไขประกาศห้องเรียน
              </h3>
              <button
                onClick={() => setEditingAnnouncement(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">หัวข้อประกาศ:</label>
                <input
                  type="text"
                  value={editAnnTitle}
                  onChange={e => setEditAnnTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">กลุ่มเป้าหมาย:</label>
                <select
                  value={editAnnTarget}
                  onChange={e => setEditAnnTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="ทุกห้องเรียน (ป.5/1 - ป.5/2)">ทุกห้องเรียน (ป.5/1 - ป.5/2)</option>
                  <option value="ป.5/1">เฉพาะห้อง ป.5/1</option>
                  <option value="ป.5/2">เฉพาะห้อง ป.5/2</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">เนื้อหาประกาศ:</label>
                <textarea
                  rows={4}
                  value={editAnnContent}
                  onChange={e => setEditAnnContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-ann-important"
                  checked={editAnnImportant}
                  onChange={e => setEditAnnImportant(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="edit-ann-important" className="text-slate-300 font-medium">
                  ปักหมุดเป็นประกาศสำคัญ
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAnnouncement(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md"
                >
                  บันทึกประกาศ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: แก้ไข โครงสร้างหลักสูตรและวิชา */}
      {isCourseInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-blue-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                แก้ไขโครงสร้างแผนการสอน & มาตรฐาน
              </h3>
              <button
                onClick={() => setIsCourseInfoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourseInfo} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">กลุ่มสาระการเรียนรู้:</label>
                  <input
                    type="text"
                    value={courseSubject}
                    onChange={e => setCourseSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ระดับชั้น:</label>
                  <input
                    type="text"
                    value={courseGrade}
                    onChange={e => setCourseGrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">ชื่อหน่วยการเรียนรู้:</label>
                <input
                  type="text"
                  value={courseUnit}
                  onChange={e => setCourseUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">เรื่อง / บทเรียน:</label>
                  <input
                    type="text"
                    value={courseSubUnit}
                    onChange={e => setCourseSubUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">เวลา (ชั่วโมง):</label>
                  <input
                    type="number"
                    value={courseHours}
                    onChange={e => setCourseHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">รหัสมาตรฐานการเรียนรู้:</label>
                <input
                  type="text"
                  value={courseStandard}
                  onChange={e => setCourseStandard(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">คำอธิบายมาตรฐาน:</label>
                <textarea
                  rows={3}
                  value={courseStandardDetail}
                  onChange={e => setCourseStandardDetail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white resize-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCourseInfoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-md"
                >
                  บันทึกข้อมูลหลักสูตร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: เพิ่ม/แก้ไข ตัวชี้วัด & K-P-A */}
      {isIndicatorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                {editingIndicatorIdx >= 0 ? 'แก้ไขตัวชี้วัด & K-P-A' : 'เพิ่มตัวชี้วัดใหม่'}
              </h3>
              <button
                onClick={() => setIsIndicatorModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveIndicator} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">รหัสตัวชี้วัด:</label>
                <input
                  type="text"
                  value={indCode}
                  onChange={e => setIndCode(e.target.value)}
                  placeholder="เช่น ว 4.2 ป.5/3"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">คำอธิบายตัวชี้วัด:</label>
                <textarea
                  rows={2}
                  value={indDesc}
                  onChange={e => setIndDesc(e.target.value)}
                  placeholder="เช่น ใช้อินเทอร์เน็ตค้นหาข้อมูล ติดต่อสื่อสาร และทำงานร่วมกัน..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white resize-none"
                  required
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-emerald-400 font-bold block">จุดประสงค์การเรียนรู้ (K-P-A):</span>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">K (ด้านความรู้ Knowledge):</label>
                  <input
                    type="text"
                    value={indK}
                    onChange={e => setIndK(e.target.value)}
                    placeholder="K: อธิบายหลักการค้นหา..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">P (ด้านทักษะ/กระบวนการ Process):</label>
                  <input
                    type="text"
                    value={indP}
                    onChange={e => setIndP(e.target.value)}
                    placeholder="P: ใช้คำค้นหาและคีย์เวิร์ดได้อย่างแม่นยำ..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">A (ด้านเจตคติ/คุณลักษณะ Attitude):</label>
                  <input
                    type="text"
                    value={indA}
                    onChange={e => setIndA(e.target.value)}
                    placeholder="A: ตระหนักถึงความสำคัญของการตรวจสอบความถูกต้อง..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIndicatorModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md"
                >
                  บันทึกตัวชี้วัด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: เพิ่ม/แก้ไข เกณฑ์การประเมิน Rubrics */}
      {isRubricModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                {editingRubricIdx >= 0 ? 'แก้ไขเกณฑ์ประเมิน Rubrics' : 'เพิ่มประเด็นการประเมิน Rubrics'}
              </h3>
              <button
                onClick={() => setIsRubricModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRubric} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">ประเด็นการประเมิน (Criteria):</label>
                <input
                  type="text"
                  value={rubCriteria}
                  onChange={e => setRubCriteria(e.target.value)}
                  placeholder="เช่น ทักษะการตั้งคำค้นหา (Keyword)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-emerald-300 font-bold mb-0.5">ระดับ 4 (ดีเยี่ยม):</label>
                  <textarea
                    rows={2}
                    value={rubL4}
                    onChange={e => setRubL4(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white resize-none"
                  />
                </div>
                <div>
                  <label className="block text-blue-300 font-bold mb-0.5">ระดับ 3 (ดี):</label>
                  <textarea
                    rows={2}
                    value={rubL3}
                    onChange={e => setRubL3(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white resize-none"
                  />
                </div>
                <div>
                  <label className="block text-amber-300 font-bold mb-0.5">ระดับ 2 (พอใช้):</label>
                  <textarea
                    rows={2}
                    value={rubL2}
                    onChange={e => setRubL2(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white resize-none"
                  />
                </div>
                <div>
                  <label className="block text-rose-300 font-bold mb-0.5">ระดับ 1 (ปรับปรุง):</label>
                  <textarea
                    rows={2}
                    value={rubL1}
                    onChange={e => setRubL1(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white resize-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRubricModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition shadow-md"
                >
                  บันทึกเกณฑ์ประเมิน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher PIN Settings Modal */}
      {showPinSettings && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-white">
            <button
              onClick={() => setShowPinSettings(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">ตั้งค่ารหัสผ่านปลอดภัยครูผู้สอน</h3>
                <p className="text-xs text-emerald-300/80">จำกัดให้เฉพาะคุณครูผู้สอน 1 ท่านเท่านั้นที่สามารถเข้าถึงระบบได้</p>
              </div>
            </div>

            {pinSuccessMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>บันทึกรหัสผ่านปลอดภัยของคุณครูเรียบร้อยแล้ว!</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  🔑 กำหนดรหัสผ่านปลอดภัยใหม่ (Teacher PIN/Password):
                </label>
                <input
                  type="text"
                  value={teacherPinValue}
                  onChange={(e) => setTeacherPinValue(e.target.value)}
                  placeholder="เช่น 2549 หรือ kru123"
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-200 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  รหัสผ่านนี้ใช้สำหรับการยืนยันสิทธิ์ก่อนเข้าสู่ระบบจัดการสำหรับครูผู้สอน ( Teacher Access ) เพื่อป้องกันไม่ให้นักเรียนหรือบุคคลอื่นแอบเข้าถึงระบบ
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinSettings(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playCorrectSound();
                    dataService.saveDoc('settings', 'teacher_config', { securityPin: teacherPinValue.trim() || '10102549' });
                    setPinSuccessMsg(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกรหัสผ่าน</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
