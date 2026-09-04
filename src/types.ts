export type TabType = 
  | 'hq'
  | 'hq_overview'   // ศูนย์บัญชาการ (Overview & Map / เส้นทาง)
  | 'missions'      // หน้าภารกิจ (Quests & Missions UI)
  | 'shop'          // หน้าร้านค้า (Shop View)
  | 'reward_shop'    // ร้านค้าของรางวัลเดิม (Alias)
  | 'community'     // หน้าชุมชน (Community Feed & Social)
  | 'profile'       // หน้าโปรไฟล์ (Profile View)
  | 'teacher_portal' // ระบบคุณครู & แดชบอร์ดจัดการการเรียนรู้ (Teacher Portal)
  | 'zone1_basics'   // โซน 1: รู้จัก Search Engine & รูปแบบการค้นหา
  | 'zone2_spells'   // โซน 2: คาถาตัวดำเนินการ (Operators & Techniques)
  | 'zone3_trust'    // โซน 3: แล็บตรวจความน่าเชื่อถือ & นามสกุลเว็บ (Domain & 5W1H)
  | 'zone4_cases'    // โซน 4: แฟ้มคดีปริศนา (Gamified Case Quests)
  | 'zone5_sandbox'  // โซน 5: จำลองระบบค้นหา & AI Assistant (Sandbox)
  | 'zone6_exam'     // โซน 6: สอบวัดระดับยอดนักสืบ (Master Quiz)
  | 'boss_battle'    // ศึกบอสใหญ่: ดาร์กบัก ปีศาจข่าวลวง (Glitch Titan Boss)
  | 'summary_cert';  // ใบประกาศนียบัตร & แผนผังความรู้

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type ShopCategory = 
  | 'avatar_hat'      // หมวก / แว่น / อุปกรณ์ศีรษะ
  | 'avatar_outfit'   // ชุดเครื่องแบบ / สูท
  | 'avatar_pet'      // คู่หูสัตว์เลี้ยง / โดรน
  | 'avatar_frame'    // กรอบโปรไฟล์ / แสงออร่า
  | 'room_wallpaper'  // วอลเปเปอร์ผนังห้อง
  | 'room_bed'        // เตียงนอน / ที่พักผ่อน
  | 'room_desk'       // โต๊ะทำงาน & คอมพิวเตอร์
  | 'room_decor';     // พร็อพตกแต่ง / บอร์ดเบาะแส / โคมไฟ

export interface EquippedAvatarItems {
  hat?: string;
  outfit?: string;
  pet?: string;
  frame?: string;
}

export interface EquippedRoomItems {
  wallpaper?: string;
  bed?: string;
  desk?: string;
  decor?: string;
  poster?: string;
  lamp?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  group: 'avatar' | 'room';
  price: number;
  rarity: ItemRarity;
  description: string;
  icon: string;
  previewGraphic: string; // Emoji, SVG representation or CSS styling
  visualDetails?: {
    accentColor?: string;
    bgPattern?: string;
    glowEffect?: string;
    furnitureScale?: string;
    badgeText?: string;
    roomElement?: string;
  };
}

export interface AuthUser {
  id: string;
  name: string;
  usernameOrEmail: string;
  classroom?: string;
  schoolName?: string;
  loginMethod: 'google' | 'student_id' | 'password' | 'teacher';
  role?: 'student' | 'teacher';
  isTeacher?: boolean;
  avatar?: string;
  customAvatarImage?: string;
  googlePhotoUrl?: string;
  createdAt?: string;
}

export interface DetectiveProfile {
  name: string;
  avatar: string;
  customAvatarImage?: string;
  rankTitle: string;
  level: number;
  exp: number;
  maxExp: number;
  coins: number;
  stars: number;
  gems: number;
  dailyCheckInDays: number;
  hasCheckedInToday: boolean;
  completedDailyQuests: string[];
  completedSpecialQuests?: string[];
  inventory: string[]; // List of purchased item IDs
  equippedAvatar: EquippedAvatarItems;
  equippedRoom: EquippedRoomItems;
  soundEnabled: boolean;
  unlockedZones: TabType[];
  completedCases: string[];
  badges: Badge[];
  quizScore: number;
  totalQuizTaken: number;
  solvedCluesCount: number;
  health?: number;
  maxHealth?: number;
  streak?: number;
  bossDefeated?: boolean;
  keys?: number;
  authUser?: AuthUser;
  myNotes?: string;
}


export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  color: string;
}

export interface CaseMission {
  id: string;
  code: string;
  title: string;
  difficulty: 'ง่าย' | 'ปานกลาง' | 'ท้าทาย';
  stars: number;
  targetSubject: string;
  storyBrief: string;
  suspectInfo: string;
  clues: string[];
  requiredSkill: string;
  missionGoal: string;
  targetKeywords: string[];
  acceptedOperators: string[];
  correctAnswerSummary: string;
  simulationResults: SearchResult[];
  explanation: string;
  rewardExp: number;
  badgeRewardId?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  reliability: 'สูงมาก' | 'น่าเชื่อถือ' | 'ปานกลาง' | 'ต้องระวัง' | 'ปลอม/อันตราย';
  reliabilityScore: number; // 1 - 100
  type: 'article' | 'pdf' | 'video' | 'news' | 'government';
  date: string;
  author: string;
  isClue: boolean;
  clueInsight?: string;
  fakeReason?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'เครื่องมือค้นหา' | 'ตัวดำเนินการ' | 'ความน่าเชื่อถือ' | 'โดเมนเนม';
  hint: string;
}

export interface DomainInfo {
  domain: string;
  name: string;
  description: string;
  trustLevel: 'สูงมาก (ภาครัฐ)' | 'สูงมาก (การศึกษา)' | 'ปานกลาง-สูง (องค์กร)' | 'ต้องตรวจสอบ (ธุรกิจ/ทั่วไป)';
  color: string;
  example: string;
  iconName: string;
}

export interface OperatorCard {
  symbol: string;
  name: string;
  example: string;
  meaning: string;
  purpose: string;
  scenario: string;
  badgeColor: string;
}
