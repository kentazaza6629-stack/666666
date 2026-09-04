export interface StudentRecord {
  id: string;
  studentNumber: number;
  name: string;
  avatar: string;
  classroom: string;
  level: number;
  exp: number;
  coins: number;
  quizScore: number; // Max 10
  totalQuizAttempts: number;
  completedZones: number; // 0 - 6
  completedCasesCount: number; // 0 - 4
  bossDefeated: boolean;
  certificateEarned: boolean;
  lastActive: string;
  indicator1Status: 'ผ่านเกณฑ์ดีเยี่ยม' | 'ผ่านเกณฑ์ดี' | 'ผ่านเกณฑ์ขั้นต้น' | 'ยังไม่ผ่าน'; // การใช้คำค้นหาและตัวดำเนินการ
  indicator2Status: 'ผ่านเกณฑ์ดีเยี่ยม' | 'ผ่านเกณฑ์ดี' | 'ผ่านเกณฑ์ขั้นต้น' | 'ยังไม่ผ่าน'; // การประเมินความน่าเชื่อถือ
  teacherNotes?: string;
}

export interface LessonMaterial {
  id: string;
  title: string;
  category: 'video' | 'worksheet' | 'slides' | 'plan';
  description: string;
  fileOrUrl: string;
  updatedAt: string;
  viewsCount: number;
}

export interface ClassAnnouncement {
  id: string;
  title: string;
  content: string;
  targetClass: string;
  date: string;
  important: boolean;
  author: string;
}

export const INITIAL_STUDENTS_LIST: StudentRecord[] = [
  {
    id: 'std_01',
    studentNumber: 1,
    name: 'เด็กชายกานต์ กิตติคุณ',
    avatar: '👦',
    classroom: 'ป.5/1',
    level: 7,
    exp: 420,
    coins: 680,
    quizScore: 9,
    totalQuizAttempts: 1,
    completedZones: 6,
    completedCasesCount: 4,
    bossDefeated: true,
    certificateEarned: true,
    lastActive: '10 นาทีที่แล้ว',
    indicator1Status: 'ผ่านเกณฑ์ดีเยี่ยม',
    indicator2Status: 'ผ่านเกณฑ์ดีเยี่ยม',
    teacherNotes: 'ใช้ตัวดำเนินการ site: และ "" ได้คล่องแคล่วมาก',
  },
  {
    id: 'std_02',
    studentNumber: 2,
    name: 'เด็กหญิงมินนี่ รัตนสุวรรณ',
    avatar: '👧',
    classroom: 'ป.5/1',
    level: 5,
    exp: 260,
    coins: 350,
    quizScore: 8,
    totalQuizAttempts: 2,
    completedZones: 5,
    completedCasesCount: 3,
    bossDefeated: false,
    certificateEarned: false,
    lastActive: 'กำลังออนไลน์',
    indicator1Status: 'ผ่านเกณฑ์ดีเยี่ยม',
    indicator2Status: 'ผ่านเกณฑ์ดี',
    teacherNotes: 'กระตือรือร้นในการทำภารกิจแฟ้มคดี',
  },
  {
    id: 'std_03',
    studentNumber: 3,
    name: 'เด็กชายนพดล ชัยเจริญ',
    avatar: '👦',
    classroom: 'ป.5/1',
    level: 6,
    exp: 340,
    coins: 520,
    quizScore: 7,
    totalQuizAttempts: 1,
    completedZones: 4,
    completedCasesCount: 2,
    bossDefeated: false,
    certificateEarned: false,
    lastActive: '1 ชั่วโมงที่แล้ว',
    indicator1Status: 'ผ่านเกณฑ์ดี',
    indicator2Status: 'ผ่านเกณฑ์ดี',
    teacherNotes: 'ยังสับสนระหว่างตัวดำเนินการ AND กับ OR เล็กน้อย',
  },
  {
    id: 'std_04',
    studentNumber: 4,
    name: 'เด็กหญิงพิชชา มหาสมุทร',
    avatar: '👧',
    classroom: 'ป.5/1',
    level: 8,
    exp: 580,
    coins: 890,
    quizScore: 10,
    totalQuizAttempts: 1,
    completedZones: 6,
    completedCasesCount: 4,
    bossDefeated: true,
    certificateEarned: true,
    lastActive: '30 นาทีที่แล้ว',
    indicator1Status: 'ผ่านเกณฑ์ดีเยี่ยม',
    indicator2Status: 'ผ่านเกณฑ์ดีเยี่ยม',
    teacherNotes: 'ทำคะแนนแบบทดสอบได้เต็ม 10/10 ช่วยแนะนำเพื่อนในกลุ่มได้ดี',
  },
  {
    id: 'std_05',
    studentNumber: 5,
    name: 'เด็กชายวรพล สายสมบัติ',
    avatar: '👦',
    classroom: 'ป.5/1',
    level: 3,
    exp: 110,
    coins: 140,
    quizScore: 4,
    totalQuizAttempts: 2,
    completedZones: 2,
    completedCasesCount: 1,
    bossDefeated: false,
    certificateEarned: false,
    lastActive: 'เมื่อวานนี้',
    indicator1Status: 'ผ่านเกณฑ์ขั้นต้น',
    indicator2Status: 'ยังไม่ผ่าน',
    teacherNotes: 'ต้องการการดูแลเรื่องการตรวจนามสกุลโดเมน .go.th และ .ac.th',
  },
  {
    id: 'std_06',
    studentNumber: 6,
    name: 'เด็กหญิงอรัญญา สดใส',
    avatar: '👧',
    classroom: 'ป.5/1',
    level: 5,
    exp: 280,
    coins: 400,
    quizScore: 8,
    totalQuizAttempts: 1,
    completedZones: 5,
    completedCasesCount: 3,
    bossDefeated: true,
    certificateEarned: false,
    lastActive: '2 ชั่วโมงที่แล้ว',
    indicator1Status: 'ผ่านเกณฑ์ดีเยี่ยม',
    indicator2Status: 'ผ่านเกณฑ์ดี',
  },
  {
    id: 'std_07',
    studentNumber: 7,
    name: 'เด็กชายภาคิน ธีรพงศ์',
    avatar: '👦',
    classroom: 'ป.5/1',
    level: 6,
    exp: 390,
    coins: 560,
    quizScore: 9,
    totalQuizAttempts: 1,
    completedZones: 6,
    completedCasesCount: 4,
    bossDefeated: true,
    certificateEarned: true,
    lastActive: '5 นาทีที่แล้ว',
    indicator1Status: 'ผ่านเกณฑ์ดีเยี่ยม',
    indicator2Status: 'ผ่านเกณฑ์ดีเยี่ยม',
  },
  {
    id: 'std_08',
    studentNumber: 1,
    name: 'เด็กชายธนกร เจริญสุข',
    avatar: '👦',
    classroom: 'ป.5/2',
    level: 5,
    exp: 290,
    coins: 430,
    quizScore: 8,
    totalQuizAttempts: 1,
    completedZones: 5,
    completedCasesCount: 3,
    bossDefeated: true,
    certificateEarned: false,
    lastActive: '4 ชั่วโมงที่แล้ว',
    indicator1Status: 'ผ่านเกณฑ์ดี',
    indicator2Status: 'ผ่านเกณฑ์ดีเยี่ยม',
  },
  {
    id: 'std_09',
    studentNumber: 2,
    name: 'เด็กหญิงกัญญารัตน์ ชาญศิลป์',
    avatar: '👧',
    classroom: 'ป.5/2',
    level: 7,
    exp: 490,
    coins: 710,
    quizScore: 10,
    totalQuizAttempts: 1,
    completedZones: 6,
    completedCasesCount: 4,
    bossDefeated: true,
    certificateEarned: true,
    lastActive: '15 นาทีที่แล้ว',
    indicator1Status: 'ผ่านเกณฑ์ดีเยี่ยม',
    indicator2Status: 'ผ่านเกณฑ์ดีเยี่ยม',
  },
  {
    id: 'std_10',
    studentNumber: 3,
    name: 'เด็กชายปิติ เกียรติเกรียงไกร',
    avatar: '👦',
    classroom: 'ป.5/2',
    level: 4,
    exp: 180,
    coins: 220,
    quizScore: 6,
    totalQuizAttempts: 2,
    completedZones: 3,
    completedCasesCount: 2,
    bossDefeated: false,
    certificateEarned: false,
    lastActive: 'เมื่อวานนี้',
    indicator1Status: 'ผ่านเกณฑ์ดี',
    indicator2Status: 'ผ่านเกณฑ์ขั้นต้น',
  },
];

export const INITIAL_ANNOUNCEMENTS: ClassAnnouncement[] = [
  {
    id: 'ann_1',
    title: '📢 กำหนดส่งงาน: แฟ้มคดีปริศนา (ด่าน 4) ภายในวันศุกร์นี้',
    content: 'ให้นักเรียนสืบค้นและไขปริศนาคดีทั้ง 4 ให้ครบถ้วน เพื่อปลดล็อกเข้าสู่ห้องจำลอง Search Sandbox และรับดาวสะสมเพื่อแลกของรางวัลในร้านค้าจ้ะ',
    targetClass: 'ทุกห้องเรียน (ป.5/1 - ป.5/2)',
    date: '3 ก.ย. 2026',
    important: true,
    author: 'คุณครูรูริยะ (วิทยาการคำนวณ)',
  },
  {
    id: 'ann_2',
    title: '🏆 ประกาศเกียรติคุณนักสืบยอดเยี่ยมประจำสัปดาห์',
    content: 'ขอแสดงความยินดีกับนักเรียนที่สอบผ่านการวัดระดับ Zone 6 ด้วยคะแนนเต็ม 10/10 และได้รับเกียรติบัตรยอดนักสืบเรียบร้อยแล้ว!',
    targetClass: 'ป.5/1',
    date: '1 ก.ย. 2026',
    important: false,
    author: 'คุณครูรูริยะ (วิทยาการคำนวณ)',
  },
];

export const INITIAL_LESSON_MATERIALS: LessonMaterial[] = [
  {
    id: 'mat_1',
    title: '🎥 วิดีโอคลิปการสอน: คาถาตัวดำเนินการสืบค้นขั้นเทพ (Operators)',
    category: 'video',
    description: 'สาธิตวิธีใช้เครื่องหมายคำพูด "", site:, filetype: และเครื่องหมายลบ - ในการสืบค้นข้อมูล',
    fileOrUrl: '/lesson.mp4',
    updatedAt: '1 ก.ย. 2026',
    viewsCount: 42,
  },
  {
    id: 'mat_2',
    title: '📄 ใบงานที่ 1: การสืบค้นข้อมูลและการใช้ตัวดำเนินการเฉพาะเจาะจง',
    category: 'worksheet',
    description: 'แบบฝึกหัดทบทวนความรู้การตั้งคำค้นหาและแบบทดสอบจับคู่ตัวดำเนินการ',
    fileOrUrl: '#',
    updatedAt: '2 ก.ย. 2026',
    viewsCount: 38,
  },
  {
    id: 'mat_3',
    title: '📊 สไลด์นำเสนอประกอบการสอน: หน่วยการเรียนรู้ที่ 3 ข้อมูลสารสนเทศ',
    category: 'slides',
    description: 'สไลด์ประกอบการบรรยายสรุปหลักการ 5W1H และการสังเกตโดเมนเนมน่าเชื่อถือ',
    fileOrUrl: '#',
    updatedAt: '3 ก.ย. 2026',
    viewsCount: 55,
  },
];

export const CURRICULUM_INFO = {
  subjectName: 'วิทยาศาสตร์และเทคโนโลยี (วิทยาการคำนวณ)',
  grade: 'ประถมศึกษาปีที่ 5 (ป.5)',
  unitTitle: 'หน่วยการเรียนรู้ที่ 3 ข้อมูลสารสนเทศ',
  subUnit: 'เรื่อง การสืบค้นข้อมูลที่สนใจผ่านเครือข่ายอินเทอร์เน็ตอย่างมีประสิทธิภาพ',
  totalHours: 4,
  standard: 'มาตรฐาน ว 4.2',
  standardDetail: 'เข้าใจและใช้แนวคิดเชิงคำนวณในการแก้ปัญหาที่พบในชีวิตจริงอย่างเป็นขั้นตอนและเป็นระบบ ใช้เทคโนโลยีสารสนเทศและการสื่อสารในการเรียนรู้ การทำงาน และการแก้ปัญหาได้อย่างมีประสิทธิภาพ รู้เท่าทัน และมีจริยธรรม',
  indicators: [
    {
      code: 'ว 4.2 ป.5/3',
      description: 'ใช้อินเทอร์เน็ตค้นหาข้อมูล ติดต่อสื่อสารและทำงานร่วมกัน ประเมินความน่าเชื่อถือของข้อมูล',
      objectives: [
        'K (ความรู้): อธิบายความหมายของ Search Engine, ตัวดำเนินการค้นหา (Operators) และหลักการประเมินความน่าเชื่อถือ 5W1H ได้ถูกต้อง',
        'P (ทักษะ): เลือกใช้คำสำคัญ (Keywords) และตัวดำเนินการเฉพาะเจาะจง ("", -, site:, filetype:) ในการสืบค้นข้อมูลได้อย่างรวดเร็วและแม่นยำ',
        'A (เจตคติ): ตระหนักถึงความสำคัญของการตรวจสอบแหล่งที่มาของข้อมูล มีวิจารณญาณ และไม่ส่งต่อข่าวปลอม (Fake News)',
      ],
    },
  ],
  rubrics: [
    {
      criteria: '1. การกำหนดคำค้นหาและใช้ตัวดำเนินการ (Operators)',
      level4: 'ใช้คำสำคัญได้ตรงประเด็น และเลือกใช้ตัวดำเนินการ ("", site:, filetype:, -) ผสมผสานได้ถูกต้องคล่องแคล่ว',
      level3: 'ใช้คำสำคัญและตัวดำเนินการอย่างน้อย 2 ชนิดได้ถูกต้อง ค้นพบข้อมูลตามเป้าหมาย',
      level2: 'ใช้คำสำคัญได้ แต่ยังใช้ตัวดำเนินการไม่ถูกต้องในบางกรณี ต้องได้รับคำแนะนำ',
      level1: 'ค้นหาด้วยคำที่กว้างเกินไปและไม่สามารถใช้ตัวดำเนินการได้',
    },
    {
      criteria: '2. การประเมินความน่าเชื่อถือของแหล่งข้อมูล',
      level4: 'จำแนกโดเมน (.go.th, .ac.th, .or.th, .co.th) ได้ถูกต้อง 100% ตรวจสอบชื่อผู้เขียน วันที่ และวัตถุประสงค์ได้อย่างละเอียด',
      level3: 'ระบุความน่าเชื่อถือของโดเมนและแยกแยะข่าวจริง/ข่าวลวงได้ถูกต้องเป็นส่วนใหญ่',
      level2: 'ตรวจสอบโดเมนได้บางประเภท ยังหลงเชื่อข้อความพาดหัวชวนคลิก (Clickbait)',
      level1: 'ไม่สามารถระบุความน่าเชื่อถือของแหล่งที่มาได้',
    },
  ],
};
