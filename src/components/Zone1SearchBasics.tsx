import React, { useState, useEffect } from 'react';
import { TabType, DetectiveProfile } from '../types';
import { 
  Search, 
  Key, 
  FolderTree, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Zap,
  Bot,
  Home,
  Award,
  Globe,
  BookOpen
} from 'lucide-react';
import { playClickSound, playCorrectSound, playWrongSound, playClueFoundSound } from '../utils/sound';
import { JourneyNextStepCard } from './JourneyNextStepCard';
import { StageHeaderBanner } from './StageHeaderBanner';

interface Zone1Props {
  profile?: DetectiveProfile;
  onEarnExp: (amount: number, reason: string) => void;
  onUnlockBadge: (badgeId: string) => void;
  onSelectTab?: (tab: TabType) => void;
}

export const Zone1SearchBasics: React.FC<Zone1Props> = ({ profile, onEarnExp, onUnlockBadge, onSelectTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'concepts' | 'keyword_tool' | 'category_tree' | 'minitest'>('concepts');

  // Interactive Keyword Transformer State
  const [selectedBadSentence, setSelectedBadSentence] = useState<number | null>(null);
  const [userExtractedKeyword, setUserExtractedKeyword] = useState<string>('');
  const [keywordResult, setKeywordResult] = useState<{ isCorrect: boolean; feedback: string } | null>(null);

  // Category Tree State
  const [selectedCategory, setSelectedCategory] = useState<string>('science');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  // Mini-test State
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const [autoRedirectEnabled, setAutoRedirectEnabled] = useState<boolean>(true);

  // Auto-redirect countdown when victory modal is shown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showVictoryModal && autoRedirectEnabled && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (showVictoryModal && autoRedirectEnabled && countdown === 0) {
      if (onSelectTab) {
        onSelectTab('hq_overview');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    return () => clearTimeout(timer);
  }, [showVictoryModal, autoRedirectEnabled, countdown, onSelectTab]);

  const BAD_SENTENCES = [
    {
      id: 0,
      longText: 'อยากรู้ว่าสัตว์ป่าสงวนของประเทศไทยที่ใกล้จะสูญพันธุ์มีตัวอะไรบ้างช่วยบอกหน่อยครับ',
      goodKeyword: '"สัตว์ป่าสงวน" ประเทศไทย',
      explanation: 'ตัดคำฟุ่มเฟือย ("อยากรู้ว่า", "ช่วยบอกหน่อย", "มีตัวอะไรบ้าง") เหลือเฉพาะคำสำคัญ "สัตว์ป่าสงวน" และ "ประเทศไทย"',
    },
    {
      id: 1,
      longText: 'ทำอย่างไรต้นไม้ถึงจะสังเคราะห์ด้วยแสงได้ดีที่สุดในเวลากลางวัน',
      goodKeyword: 'การสังเคราะห์ด้วยแสง ปัจจัย',
      explanation: 'ตัดคำกริยาและคำถาม เหลือใจความสำคัญคือ "การสังเคราะห์ด้วยแสง" และ "ปัจจัย"',
    },
    {
      id: 2,
      longText: 'หาสไลด์พาวเวอร์พอยต์เรื่องระบบสุริยะจักรวาลสำหรับเด็ก ป.5 ฟรี',
      goodKeyword: 'ระบบสุริยะ ป.5 filetype:pptx',
      explanation: 'ใช้คำสำคัญ "ระบบสุริยะ ป.5" ร่วมกับเทคนิคระบุชนิดไฟล์ filetype:pptx เพื่อหาสไลด์ทันที',
    },
  ];

  const CATEGORY_TREE_DATA = {
    science: {
      name: '🔬 วิทยาศาสตร์และเทคโนโลยี',
      sub: [
        { id: 'space', name: '🪐 ดาราศาสตร์และอวกาศ', items: ['ระบบสุริยะ', 'การเกิดสุริยุปราคา', 'ยานสำรวจดาวอังคาร', 'ดาวเทียมไทยโชต'] },
        { id: 'bio', name: '🌿 สิ่งมีชีวิตและสิ่งแวดล้อม', items: ['สัตว์ป่าสงวน 19 ชนิด', 'การปรับตัวของพืช', 'ห่วงโซ่อาหาร', 'ระบบนิเวศป่าชายเลน'] },
        { id: 'tech', name: '💻 วิทยาการคำนวณ & AI', items: ['การสืบค้นข้อมูล', 'การเขียนโปรแกรม Scratch', 'ความปลอดภัยทางไซเบอร์', 'ปัญญาประดิษฐ์พื้นฐาน'] },
      ]
    },
    society: {
      name: '🏛️ สังคมศึกษาและประวัติศาสตร์',
      sub: [
        { id: 'history', name: '📜 ประวัติศาสตร์ไทย', items: ['อาณาจักรอยุธยา', 'โบราณสถานวัดมหาธาตุ', 'บุคคลสำคัญของชาติ', 'มรดกโลกสุโขทัย'] },
        { id: 'geography', name: '🗺️ ภูมิศาสตร์ไทย', items: ['แผนที่ประเทศไทย', 'อุทยานแห่งชาติ', 'แม่น้ำเจ้าพระยา', 'ทรัพยากรธรรมชาติ'] },
      ]
    },
    health: {
      name: '🥗 สุขศึกษาและพลศึกษา',
      sub: [
        { id: 'nutrition', name: '🍎 อาหารและโภชนาการ', items: ['อาหารหลัก 5 หมู่', 'สารอาหารและแคลอรี', 'ฉลากโภชนาการ GDA', 'การเลือกซื้ออาหารปลอดภัย'] },
        { id: 'prevention', name: '🩺 การป้องกันโรค', items: ['โรคไข้เลือดออก', 'ไข้หวัดใหญ่', 'การปฐมพยาบาลเบื้องต้น', 'สุขอนามัยส่วนบุคคล'] },
      ]
    }
  };

  const MINI_QUESTIONS = [
    {
      id: 1,
      q: 'เครื่องมือค้นหา (Search Engine) ทำหน้าที่หลักอย่างไร?',
      options: [
        'ซ่อมแซมคอมพิวเตอร์ที่ติดไวรัส',
        'สำรวจและจัดทำดัชนีเว็บ เพื่อให้ผู้ใช้ค้นหาข้อมูลผ่านคำสำคัญได้รวดเร็ว',
        'สร้างภาพกราฟิก 3 มิติสำหรับเล่นเกม',
        'ส่งข้อความคุยกับเพื่อนแบบส่วนตัว'
      ],
      correct: 1,
      exp: 'Search Engine เปรียบเสมือนบรรณารักษ์ดิจิทัลที่คอยจัดทำดัชนีเว็บเพื่อให้เราค้นหาคำสำคัญได้ทันที'
    },
    {
      id: 2,
      q: 'ข้อใดเป็นหลักการตั้ง "คำสำคัญ (Keyword)" ที่มีประสิทธิภาพที่สุด?',
      options: [
        'พิมพ์เป็นประโยคคำถามยาวๆ มีคำสร้อย เช่น "ช่วยบอกทีนะคะ"',
        'เลือกเฉพาะคำสั้นๆ ที่ตรงประเด็น และตัดคำฟุ่มเฟือยทิ้ง',
        'พิมพ์ตัวอักษรภาษาอังกฤษผสมตัวเลขสุ่มๆ',
        'ใส่คำอวยพรและคำทักทายลงในช่องค้นหา'
      ],
      correct: 1,
      exp: 'คำสำคัญที่ดีต้องสั้น เจาะจง และตัดคำฟุ่มเฟือยทิ้ง เช่น "สัตว์ป่าสงวน" ดีกว่าพิมพ์คำถามยาวๆ'
    },
    {
      id: 3,
      q: 'การค้นหาแบบใดเหมาะกับผู้ที่ "ยังไม่แน่ใจว่าจะใช้คำสำคัญอะไร" และต้องการดูหัวข้อที่จัดเรียงไว้เป็นหมวดๆ?',
      options: [
        'การสืบค้นตามหมวดหมู่ (Category / Subject Directory)',
        'การค้นหาด้วยเสียง',
        'การพิมพ์รหัสโปรแกรม',
        'การปิดหน้าจอแล้วเดา'
      ],
      correct: 0,
      exp: 'การค้นหาตามหมวดหมู่ (Subject Directory) ช่วยให้เราสำรวจจากหัวข้อใหญ่ไปหาย่อยได้เป็นระบบ'
    }
  ];

  const handleTestKeywordExtraction = (item: typeof BAD_SENTENCES[0]) => {
    playClueFoundSound();
    setSelectedBadSentence(item.id);
    setUserExtractedKeyword(item.goodKeyword);
    setKeywordResult({
      isCorrect: true,
      feedback: `ยอดเยี่ยมมาก! จากประโยคยาว ${item.longText.length} ตัวอักษร สกัดเหลือเพียง "${item.goodKeyword}" ค้นหาได้เร็วและแม่นยำขึ้น 10 เท่า!`
    });
    onEarnExp(30, 'ฝึกสกัดคำสำคัญ Keyword');
  };

  const handleGradeQuiz = () => {
    let score = 0;
    MINI_QUESTIONS.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) score++;
    });

    setQuizSubmitted(true);
    setQuizScore(score);
    
    if (score >= 2) {
      playCorrectSound();
      if (score === MINI_QUESTIONS.length) {
        onEarnExp(100, 'ผ่านแบบทดสอบโซน 1 คะแนนเต็ม');
        onUnlockBadge('keyword_master');
      } else {
        onEarnExp(70, 'ผ่านแบบทดสอบโซน 1');
      }
      setCountdown(4);
      setAutoRedirectEnabled(true);
      setShowVictoryModal(true);
    } else {
      playWrongSound();
      onEarnExp(40, 'ทำแบบทดสอบโซน 1');
    }
  };

  const subTabs = [
    { id: 'concepts', label: '1. รู้จัก Search Engine', icon: Search },
    { id: 'keyword_tool', label: '2. ห้องแล็บสกัดคีย์เวิร์ด', icon: Key },
    { id: 'category_tree', label: '3. หมวดหมู่ความรู้', icon: FolderTree },
    { id: 'minitest', label: '4. แบบทดสอบประจำด่าน', icon: Award, badge: '+100 XP' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* 3D Ribbon Banner & Currency Bar */}
      <StageHeaderBanner
        stageNumber={1}
        title="พื้นฐานการค้นหา & คำสำคัญ"
        subtitle="เข้าใจการทำงานของ Search Engine, สกัดคำสำคัญ Keyword และท่องหมวดหมู่ความรู้"
        themeGradient="from-cyan-500 via-blue-600 to-indigo-700"
        profile={profile}
        subTabs={subTabs}
        activeSubTab={activeSubTab}
        onSelectSubTab={(id) => setActiveSubTab(id as any)}
      />

      {/* SubTab 1: Concepts */}
      {activeSubTab === 'concepts' && (
        <div className="space-y-6">
          {/* Concept Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: What is Search Engine */}
            <div className="p-5 rounded-3xl bg-white border border-sky-200/80 shadow-sm space-y-3 hover:border-sky-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center border border-sky-200/50">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-800">1. โปรแกรมค้นหา (Search Engine)</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                คือเว็บไซต์ที่ทำหน้าที่เป็น <strong>"บรรณารักษ์ดิจิทัล"</strong> คอยรวบรวมและจัดทำดัชนี (Index) ของหน้าเว็บหลายพันล้านหน้า เพื่อให้เราค้นหาได้ในเสี้ยววินาที
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-500" /> ตัวอย่าง: Google, Bing, DuckDuckGo
              </div>
            </div>

            {/* Card 2: Keyword Search */}
            <div className="p-5 rounded-3xl bg-white border border-blue-200/80 shadow-sm space-y-3 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200/50">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-800">2. การค้นหาด้วยคำสำคัญ (Keyword)</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                พิมพ์ <strong>คำสั้นๆ ที่ตรงกับเรื่องที่ต้องการ</strong> ไม่ต้องพิมพ์ประโยคยาว เช่น สนใจเรื่องดาวอังคาร ให้พิมพ์ <code>"ดาวอังคาร"</code> ไม่ต้องพิมพ์ "อยากรู้จักดาวอังคาร"
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" /> หลักการ: สั้น • กระชับ • ตรงประเด็น
              </div>
            </div>

            {/* Card 3: Directory / Advanced */}
            <div className="p-5 rounded-3xl bg-white border border-purple-200/80 shadow-sm space-y-3 hover:border-purple-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center border border-purple-200/50">
                <FolderTree className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-800">3. การค้นหาตามหมวดหมู่ (Directory)</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                เหมาะสำหรับเวลาที่ยังคิดคำค้นไม่ออก โดยคลิกเลือกหัวข้อใหญ่ แตกกิ่งไปหัวข้อย่อย เช่น <strong>วิทยาศาสตร์ &gt; ดาราศาสตร์ &gt; ระบบสุริยะ</strong> เหมือนเปิดสารบัญ
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" /> โครงสร้าง: หมวดใหญ่ &rarr; หมวดย่อย
              </div>
            </div>
          </div>

          {/* Interactive Pro Tip Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-200/50 blur-3xl rounded-full pointer-events-none" />
            <div className="space-y-1 text-center sm:text-left z-10">
              <h4 className="text-sm sm:text-base font-black text-slate-800 flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                พร้อมฝึกเป็นเซียนคำสำคัญหรือยัง?
              </h4>
              <p className="text-xs text-slate-600">
                ไปที่แท็บ "ห้องแล็บสกัดคีย์เวิร์ด" เพื่อดูตัวอย่างการแปลงประโยคยาวให้เป็นคำค้นหาชั้นยอด!
              </p>
            </div>
            <button
              onClick={() => { playClickSound(); setActiveSubTab('keyword_tool'); }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0 z-10"
            >
              ไปฝึกสกัดคำสำคัญ <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* SubTab 2: Keyword Transformer Tool */}
      {activeSubTab === 'keyword_tool' && (
        <div className="space-y-5">
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-sky-200/80 shadow-sm space-y-1">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Key className="w-5 h-5 text-sky-500" />
              ห้องแล็บสกัดคำสำคัญ (Keyword Transformer)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              คลิกเลือกประโยคยาวๆ ด้านล่าง เพื่อดูวิธีที่สารวัตรไบต์ช่วยตัดคำฟุ่มเฟือย และแปลงเป็นคำสำคัญที่ทรงพลัง!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Long Sentences (Bad Examples) */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-500" /> ❌ ประโยคยาวที่มักพิมพ์ผิด
              </label>

              {BAD_SENTENCES.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleTestKeywordExtraction(item)}
                  className={`p-4 sm:p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                    selectedBadSentence === item.id
                      ? 'bg-sky-50 border-sky-400 shadow-sm scale-[1.01]'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-bold">
                    "{item.longText}"
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-sky-600 font-black">
                    <span>สกัดคำสำคัญ →</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: AI Transformer Result */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-sky-200/80 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs sm:text-sm font-black text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> ✨ ผลลัพธ์ (Keyword)
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 font-black border border-sky-200">
                    Smart Extractor
                  </span>
                </div>

                {keywordResult ? (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-sky-200 space-y-1 relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-20 h-20 bg-sky-200/30 blur-xl rounded-full" />
                      <span className="text-xs text-slate-500 font-bold">คำค้นหาที่แนะนำให้ใช้:</span>
                      <div className="text-base sm:text-lg font-black text-sky-700 flex items-center gap-2">
                        <Key className="w-5 h-5 text-amber-500" />
                        {userExtractedKeyword}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1 shadow-xs">
                      <strong className="text-amber-600 block font-black">💡 ทำไมคำนี้ถึงดีกว่า?</strong>
                      <p>{BAD_SENTENCES[selectedBadSentence || 0].explanation}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>{keywordResult.feedback}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-inner">
                      <Bot className="w-8 h-8 text-slate-300 animate-pulse" />
                    </div>
                    <p className="text-xs font-bold max-w-[200px] text-slate-500">คลิกเลือกประโยคทางด้านซ้ายเพื่อทดสอบการสกัดคำสำคัญ</p>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-sky-600/70 font-bold text-center border-t border-slate-100 pt-3 relative z-10 uppercase tracking-wider">
                กฎทอง: สั้น • กระชับ • ละเว้นคำถาม • ใส่ชื่อเฉพาะ
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: Category Tree */}
      {activeSubTab === 'category_tree' && (
        <div className="space-y-5">
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-purple-200/80 shadow-sm space-y-1">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-purple-500" />
              การสืบค้นตามหมวดหมู่ (Subject Directory Browser)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              ทดลองคลิกเลือกหมวดหมู่ใหญ่ &rarr; แตกแขนงไปหมวดย่อย &rarr; ดูรายการหัวข้อความรู้ที่จัดเป็นระเบียบ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Main Category */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">1. เลือกหมวดหมู่หลัก</label>
              <div className="space-y-2">
                {Object.entries(CATEGORY_TREE_DATA).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => {
                      playClickSound();
                      setSelectedCategory(key);
                      setSelectedSubCategory(null);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left text-xs sm:text-sm font-black transition flex items-center justify-between ${
                      selectedCategory === key
                        ? 'bg-sky-50 text-sky-700 border-2 border-sky-300 shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{value.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </button>
                ))}
              </div>
            </div>

            {/* Column 2: Sub-Category */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">2. เลือกหมวดย่อย</label>
              <div className="space-y-2">
                {(CATEGORY_TREE_DATA as any)[selectedCategory].sub.map((sub: any) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      playClickSound();
                      setSelectedSubCategory(sub.id);
                      onEarnExp(10, 'สำรวจหมวดหมู่วิทยาศาสตร์');
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left text-xs sm:text-sm font-black transition flex items-center justify-between ${
                      selectedSubCategory === sub.id
                        ? 'bg-purple-50 text-purple-700 border-2 border-purple-300 shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{sub.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </button>
                ))}
              </div>
            </div>

            {/* Column 3: Leaf Topics */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border-2 border-sky-200/80 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-sky-100 blur-2xl rounded-full pointer-events-none" />
              <label className="text-xs font-black text-sky-600 uppercase tracking-wider relative z-10">3. หัวข้อย่อยที่พบ</label>
              {selectedSubCategory ? (
                <div className="space-y-2 animate-fadeIn relative z-10">
                  {((CATEGORY_TREE_DATA as any)[selectedCategory].sub.find((s: any) => s.id === selectedSubCategory)?.items || []).map((item: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-sky-100 text-xs sm:text-sm text-slate-800 font-bold flex items-center gap-2 shadow-xs"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-36 flex items-center justify-center text-slate-400 text-xs font-bold text-center relative z-10">
                  เลือกหมวดย่อยในคอลัมน์ที่ 2<br />เพื่อดูหัวข้อความรู้
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SubTab 4: Mini Test */}
      {activeSubTab === 'minitest' && (
        <div className="space-y-6">
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-sm space-y-1">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              มินิแบบทดสอบ: ด่านทดสอบยอดนักสืบคำสำคัญ
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              ตอบคำถาม 3 ข้อเพื่อรับ +100 EXP และเหรียญตรา <strong>"เซียนคีย์เวิร์ด"</strong>!
            </p>
          </div>

          <div className="space-y-4">
            {MINI_QUESTIONS.map((q, qIndex) => {
              const selectedOpt = quizAnswers[q.id];
              const isSubmitted = quizSubmitted;

              return (
                <div key={q.id} className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-sky-100 text-sky-600 border border-sky-200 font-black text-xs flex items-center justify-center shrink-0">
                      {qIndex + 1}
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-slate-800 leading-snug">{q.q}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt, optIndex) => {
                      const isChosen = selectedOpt === optIndex;
                      const isCorrect = q.correct === optIndex;

                      let btnStyle = 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100';
                      if (isSubmitted) {
                        if (isCorrect) btnStyle = 'bg-emerald-50 text-emerald-700 border-emerald-400 font-black shadow-sm';
                        else if (isChosen) btnStyle = 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm';
                      } else if (isChosen) {
                        btnStyle = 'bg-sky-50 text-sky-700 border-sky-400 font-black shadow-sm';
                      }

                      return (
                        <button
                          key={optIndex}
                          disabled={quizSubmitted}
                          onClick={() => {
                            playClickSound();
                            setQuizAnswers(prev => ({ ...prev, [q.id]: optIndex }));
                          }}
                          className={`p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm transition flex items-start gap-2.5 ${btnStyle}`}
                        >
                          <span className="font-mono text-slate-400 font-black">{String.fromCharCode(65 + optIndex)}.</span>
                          <span className="leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs sm:text-sm text-slate-700">
                      <strong className="text-sky-600 font-black">เฉลย: </strong> {q.exp}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            {!quizSubmitted ? (
              <button
                onClick={handleGradeQuiz}
                disabled={Object.keys(quizAnswers).length < MINI_QUESTIONS.length}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95"
              >
                ตรวจคำตอบ & รับคะแนน
              </button>
            ) : (
              <button
                onClick={() => {
                  playClickSound();
                  setQuizSubmitted(false);
                  setQuizAnswers({});
                }}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-black border border-slate-200 shadow-sm transition-all active:scale-95"
              >
                ลองทำใหม่อีกครั้ง
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step Journey Next Step Card */}
      {onSelectTab && (
        <JourneyNextStepCard
          currentStepNumber={1}
          currentStepTitle="พื้นฐานการค้นหา & คำสำคัญ (Keyword)"
          nextTab="zone2_spells"
          nextStepTitle="ด่าน 2: คลังคาถาตัวดำเนินการลับ"
          nextStepDesc="ฝึกใช้เครื่องหมายอัญประกาศ คำค้นคู่, เครื่องหมายลบ -, site:.go.th และ filetype:pdf เพื่อสืบค้นข้อมูลได้แม่นยำ 100%"
          rewardEarnedText="+100 EXP & ตราเซียนคีย์เวิร์ด"
          onSelectTab={onSelectTab}
        />
      )}

      {/* Victory Celebration Modal */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-white via-sky-50 to-white border-4 border-sky-300 p-6 sm:p-8 shadow-2xl text-center overflow-hidden animate-scaleUp text-slate-800">
            {/* Icon / Trophy Badge */}
            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4">
              <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-sky-500 p-1 shadow-lg shadow-emerald-500/30 flex items-center justify-center animate-bounce">
                <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center text-4xl sm:text-5xl">
                  🏆
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                ด่าน 1 ผ่านแล้ว!
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              🎉 ยินดีด้วย! ผ่านด่านที่ 1 แล้ว!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-5 font-medium leading-relaxed">
              คุณผ่านการทดสอบเรื่อง Search Engine & สกัดคำสำคัญ Keyword ได้อย่างยอดเยี่ยม (ตอบถูก {quizScore} / {MINI_QUESTIONS.length} ข้อ)
            </p>

            {/* Rewards Card */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-sky-50 border border-sky-200 mb-6">
              <div className="p-2 rounded-xl bg-white text-center border border-sky-100 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold">EXP ที่ได้รับ</div>
                <div className="text-sm font-black text-sky-600">+{quizScore === 3 ? 100 : 70} EXP</div>
              </div>
              <div className="p-2 rounded-xl bg-white text-center border border-sky-100 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold">เหรียญทอง</div>
                <div className="text-sm font-black text-amber-600">+50 Coins</div>
              </div>
              <div className="p-2 rounded-xl bg-white text-center border border-sky-100 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold">ตราสัญลักษณ์</div>
                <div className="text-xs font-black text-emerald-600 truncate">เซียนคีย์เวิร์ด</div>
              </div>
            </div>

            {/* Return Button */}
            <div>
              <button
                onClick={() => {
                  playClickSound();
                  setShowVictoryModal(false);
                  if (onSelectTab) {
                    onSelectTab('hq_overview');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                id="btn-victory-back-journey"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-sm sm:text-base shadow-lg shadow-teal-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-5 h-5" />
                <span>🗺️ กลับสู่หน้าเดินทาง</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
