import React, { useState } from 'react';
import { TabType, DetectiveProfile } from '../types';
import { OPERATOR_CARDS } from '../data/learningContent';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  ArrowRight, 
  Wand2, 
  Home,
  BookOpen,
  Award
} from 'lucide-react';
import { playClickSound, playCorrectSound, playWrongSound, playBadgeUnlockSound } from '../utils/sound';
import { JourneyNextStepCard } from './JourneyNextStepCard';
import { StageHeaderBanner } from './StageHeaderBanner';

interface Zone2Props {
  profile?: DetectiveProfile;
  onEarnExp: (amount: number, reason: string) => void;
  onUnlockBadge: (badgeId: string) => void;
  onSelectTab?: (tab: TabType) => void;
}

interface SpellChallenge {
  id: number;
  scenario: string;
  targetGoal: string;
  requiredOperator: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const Zone2Operators: React.FC<Zone2Props> = ({ profile, onEarnExp, onUnlockBadge, onSelectTab }) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'builder' | 'puzzles'>('cards');
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);

  // Formula Builder State
  const [builderKeyword, setBuilderKeyword] = useState<string>('พลังงานแสงอาทิตย์');
  const [selectedOperator, setSelectedOperator] = useState<string>('""');
  const [selectedFilter, setSelectedFilter] = useState<string>('site:.go.th');
  const [excludedWord, setExcludedWord] = useState<string>('ขาย');
  const [copiedQuery, setCopiedQuery] = useState<boolean>(false);

  // Puzzle State
  const [puzzleAnswers, setPuzzleAnswers] = useState<{ [key: number]: number }>({});
  const [puzzleCompleted, setPuzzleCompleted] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);

  const PUZZLE_CHALLENGES: SpellChallenge[] = [
    {
      id: 0,
      scenario: 'คุณครูสั่งให้นักเรียนค้นหาคู่มือใบความรู้ "ระบบนิเวศป่าชายเลน" เป็นไฟล์เอกสาร PDF เพื่อดาวน์โหลดมาปริ้นท์ทำรายงาน',
      targetGoal: 'หาไฟล์ PDF เรื่องระบบนิเวศป่าชายเลน',
      requiredOperator: 'filetype:pdf',
      options: [
        'ระบบนิเวศป่าชายเลน -PDF',
        'ระบบนิเวศป่าชายเลน filetype:pdf',
        'ระบบนิเวศป่าชายเลน site:pdf',
        '"ระบบนิเวศป่าชายเลน PDF docx"'
      ],
      correctIndex: 1,
      explanation: 'การใช้คำสั่ง filetype:pdf จะบังคับให้ Google แสดงเฉพาะผลลัพธ์ที่เป็นไฟล์เอกสาร PDF เท่านั้น เหมาะสำหรับการหาคู่มือและเอกสารการเรียน'
    },
    {
      id: 1,
      scenario: 'ต้องการหาข้อมูลทางสถิติและงานวิจัยเรื่อง "ขยะอิเล็กทรอนิกส์ในไทย" จากเว็บไซต์ของกระทรวงหรือหน่วยงานราชการไทยเท่านั้น',
      targetGoal: 'เจาะจงเฉพาะเว็บไซต์หน่วยงานรัฐบาลไทย',
      requiredOperator: 'site:.go.th',
      options: [
        'ขยะอิเล็กทรอนิกส์ site:.co.th',
        'ขยะอิเล็กทรอนิกส์ site:.go.th',
        'ขยะอิเล็กทรอนิกส์ filetype:go.th',
        '"ขยะอิเล็กทรอนิกส์ -ราชการ"'
      ],
      correctIndex: 1,
      explanation: 'site:.go.th หมายถึงการค้นหาเฉพาะในโดเมน Government ของประเทศไทย เช่น กรมควบคุมมลพิษ หรือกระทรวงทรัพยากรธรรมชาติฯ'
    },
    {
      id: 2,
      scenario: 'ต้องการค้นหาข้อมูลเกี่ยวกับ "เสือโคร่ง" ในป่าธรรมชาติ แต่ไม่อยากได้ผลลัพธ์ที่เป็น "เสื้อผ้า" หรือ "ทีมฟุตบอล"',
      targetGoal: 'ตัดคำว่า เสื้อผ้า และ ฟุตบอล ออกจากผลการค้นหา',
      requiredOperator: 'เครื่องหมายลบ (-)',
      options: [
        'เสือโคร่ง +เสื้อผ้า +ฟุตบอล',
        'เสือโคร่ง OR เสื้อผ้า OR ฟุตบอล',
        'เสือโคร่ง -เสื้อผ้า -ฟุตบอล',
        '"เสือโคร่ง เสื้อผ้า ฟุตบอล"'
      ],
      correctIndex: 2,
      explanation: 'เครื่องหมายลบ (-) หน้าคำ เช่น -เสื้อผ้า -ฟุตบอล จะตัดหน้าเว็บที่มีคำเหล่านี้ออกไปทันที ทำให้เหลือเฉพาะเรื่องสัตว์เสือโคร่งตามต้องการ'
    },
    {
      id: 3,
      scenario: 'ต้องการค้นหาชื่ออุทยานแห่งชาติแบบเจาะจง ไม่ให้คำแยกจากกัน เช่น ไม่เอาผลลัพธ์ที่มีคำว่า อุทยาน อยู่หัวหน้า และ เขาใหญ่ อยู่อีกย่อหน้า',
      targetGoal: 'ล็อกกลุ่มคำให้ติดกันเป๊ะตามลำดับ',
      requiredOperator: 'เครื่องหมายคำพูด ("...")',
      options: [
        'อุทยาน AND เขาใหญ่',
        '"อุทยานแห่งชาติเขาใหญ่"',
        'อุทยาน -เขาใหญ่',
        'filetype:อุทยานแห่งชาติเขาใหญ่'
      ],
      correctIndex: 1,
      explanation: 'การใช้อัญประกาศคู่ "..." ล็อกคำ จะทำให้ค้นหาเฉพาะหน้าเว็บที่มีประโยคเรียงติดกันเป๊ะๆ เท่านั้น'
    }
  ];

  const handleSelectPuzzleOption = (puzzleId: number, optionIndex: number) => {
    if (puzzleAnswers[puzzleId] !== undefined) return;
    
    playClickSound();
    const newAnswers = { ...puzzleAnswers, [puzzleId]: optionIndex };
    setPuzzleAnswers(newAnswers);

    const isCorrect = optionIndex === PUZZLE_CHALLENGES[puzzleId].correctIndex;
    if (isCorrect) {
      playCorrectSound();
      onEarnExp(40, 'ตอบปริศนาคาถาสืบค้นถูกต้อง');
    } else {
      playWrongSound();
    }

    if (Object.keys(newAnswers).length === PUZZLE_CHALLENGES.length) {
      setPuzzleCompleted(true);
      const allCorrect = PUZZLE_CHALLENGES.every((p) => newAnswers[p.id] === p.correctIndex);
      if (allCorrect) {
        playBadgeUnlockSound();
        onUnlockBadge('spell_caster');
        onEarnExp(150, 'พิชิตด่านคาถาสืบค้นครบทุกข้อ!');
      }
      setTimeout(() => {
        setShowVictoryModal(true);
      }, 700);
    }
  };

  const getBuiltQuery = () => {
    let q = builderKeyword.trim();
    if (selectedOperator === '""') q = `"${q}"`;
    if (excludedWord.trim()) q += ` -${excludedWord.trim()}`;
    if (selectedFilter) q += ` ${selectedFilter}`;
    return q;
  };

  const handleCopyQuery = () => {
    playClickSound();
    navigator.clipboard.writeText(getBuiltQuery());
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  const subTabs = [
    { id: 'cards', label: '1. คลังคาถาโอเปอเรเตอร์', icon: BookOpen },
    { id: 'builder', label: '2. แท่นผสมสูตรคำค้น', icon: Wand2 },
    { id: 'puzzles', label: '3. ด่านประลองเวทมนตร์', icon: Award, badge: '4 ภารกิจ' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* 3D Ribbon Banner & Currency Bar */}
      <StageHeaderBanner
        stageNumber={2}
        title="คลังคาถาตัวดำเนินการสืบค้นลับ"
        subtitle="ฝึกใช้เครื่องหมายอัญประกาศคู่, ลบคำฟุ่มเฟือย, เจาะจงเว็บ .go.th และค้นหาไฟล์ PDF"
        themeGradient="from-indigo-600 via-purple-600 to-pink-600"
        profile={profile}
        subTabs={subTabs}
        activeSubTab={activeTab}
        onSelectSubTab={(id) => setActiveTab(id as any)}
      />

      {/* Tab 1: Cards */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OPERATOR_CARDS.map((op, idx) => (
              <div
                key={idx}
                onClick={() => { playClickSound(); setSelectedCardIndex(idx); }}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                  selectedCardIndex === idx
                    ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-mono font-black text-xl shadow-xs">
                    {op.symbol.replace(/[()]/g, '')}
                  </span>
                  <span className="text-xs font-black text-purple-300 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                    คาถา #{idx + 1}
                  </span>
                </div>
                <h3 className="text-base font-black text-white mb-1">{op.name}</h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-3 leading-relaxed">{op.purpose || op.meaning}</p>
                
                <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/20 text-xs font-mono font-bold text-purple-300">
                  {op.example}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tip from Mascot */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-500/30 shadow-lg flex items-center gap-3.5 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none" />
            <span className="text-3xl relative z-10">🤖</span>
            <div className="text-xs sm:text-sm text-slate-300 relative z-10">
              <strong className="text-indigo-400 font-black">ข้อควรจำจากสารวัตรไบต์: </strong>
              เครื่องหมายลบ <code className="text-pink-400 bg-slate-900 px-1 rounded">-</code> ต้องเขียนติดกับคำที่ไม่ต้องการเสมอ เช่น <code className="text-pink-400 bg-slate-900 px-1 rounded">-ขาย</code> (ห้ามเว้นวรรคหลังเครื่องหมายลบ)
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Formula Builder */}
      {activeTab === 'builder' && (
        <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border-2 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)] space-y-6">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" />
              แท่นผสมสูตรคำค้นหาวิเศษ (Query Recipe Lab)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              เลือกปรับแต่งตัวเลือกด้านล่าง แล้วดูสูตรค้นหาที่รวมร่างพร้อมใช้งานจริง
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400">1. คำค้นหลัก (Keyword):</label>
              <input
                type="text"
                value={builderKeyword}
                onChange={(e) => setBuilderKeyword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400">2. ตัดคำที่ไม่ต้องการออก (-):</label>
              <input
                type="text"
                value={excludedWord}
                onChange={(e) => setExcludedWord(e.target.value)}
                placeholder="เช่น ขาย, มือสอง, ราคา"
                className="w-full px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-800"
              />
            </div>
          </div>

          {/* Result Formula Output */}
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/40 border-2 border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden">
            <div className="absolute left-0 bottom-0 w-24 h-24 bg-purple-500/10 blur-xl rounded-full" />
            <div className="overflow-hidden w-full relative z-10">
              <span className="text-[11px] text-purple-400 font-black uppercase block tracking-wider">สูตรคำค้นที่ได้:</span>
              <span className="text-base sm:text-lg font-mono font-black text-purple-200 break-all">
                {getBuiltQuery()}
              </span>
            </div>
            <button
              onClick={handleCopyQuery}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] shrink-0 cursor-pointer active:scale-95 transition-all relative z-10"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedQuery ? 'คัดลอกแล้ว!' : 'คัดลอกคำค้น'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Puzzles */}
      {activeTab === 'puzzles' && (
        <div className="space-y-5">
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] space-y-1">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              ด่านประลอง: ไขรหัสลับด้วยตัวดำเนินการ (4 ข้อ)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              ช่วยนักสืบเลือกรหัสคาถาค้นหาที่ถูกต้องสำหรับแต่ละสถานการณ์ เพื่อปลดล็อกตรา <strong>"จอมเวทย์คาถาสืบค้น"</strong>
            </p>
          </div>

          <div className="space-y-4">
            {PUZZLE_CHALLENGES.map((puzzle, idx) => {
              const userChoice = puzzleAnswers[puzzle.id];
              const isAnswered = userChoice !== undefined;
              const isCorrect = userChoice === puzzle.correctIndex;

              return (
                <div
                  key={puzzle.id}
                  className={`p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-sm ${
                    isAnswered
                      ? isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                      : 'bg-slate-900/60 border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-white">
                        ภารกิจ: {puzzle.targetGoal}
                      </span>
                    </div>

                    {isAnswered && (
                      <span className={`text-xs font-black flex items-center gap-1 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {isCorrect ? 'ถูกต้อง (+40 EXP)' : 'ยังไม่ถูกต้อง'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 font-bold">
                    {puzzle.scenario}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {puzzle.options.map((opt, optIdx) => {
                      const isSelected = userChoice === optIdx;
                      const isRightOption = puzzle.correctIndex === optIdx;

                      let btnColor = 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-800';
                      if (isAnswered) {
                        if (isRightOption) btnColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-black shadow-[0_0_10px_rgba(16,185,129,0.3)]';
                        else if (isSelected) btnColor = 'bg-rose-500/20 text-rose-300 border-rose-500 font-black shadow-[0_0_10px_rgba(244,63,94,0.3)]';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswered}
                          onClick={() => handleSelectPuzzleOption(puzzle.id, optIdx)}
                          className={`p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm font-mono font-bold transition-all flex items-center justify-between cursor-pointer ${btnColor}`}
                        >
                          <span>{opt}</span>
                          {isAnswered && isRightOption && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-300">
                      <strong className="text-purple-400 font-black">คำอธิบาย: </strong>
                      {puzzle.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            {!puzzleCompleted ? (
              <div className="text-xs font-black text-cyan-400 bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20">
                ไขรหัสสำเร็จ: {Object.entries(puzzleAnswers).filter(([id, ans]) => PUZZLE_CHALLENGES[Number(id)]?.correctIndex === ans).length}/{PUZZLE_CHALLENGES.length} ข้อ
              </div>
            ) : (
              <div className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-4 h-4" /> ด่านประลองเสร็จสมบูรณ์!
              </div>
            )}
            
            <button
              onClick={() => {
                playClickSound();
                setPuzzleAnswers({});
                setPuzzleCompleted(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black transition-all active:scale-95 border border-slate-700"
            >
              เริ่มประลองใหม่
            </button>
          </div>
        </div>
      )}

      {/* Step Journey Return Card */}
      {onSelectTab && (
        <JourneyNextStepCard
          currentStepNumber={2}
          currentStepTitle="คลังคาถาตัวดำเนินการสืบค้นลับ"
          rewardEarnedText="+150 EXP & ตราจอมเวทโอเปอเรเตอร์"
          onSelectTab={onSelectTab}
        />
      )}

      {/* Victory Celebration Modal */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-white via-indigo-50 to-white border-4 border-indigo-300 p-6 sm:p-8 shadow-2xl text-center overflow-hidden animate-scaleUp text-slate-800">
            {/* Trophy Badge */}
            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4">
              <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-lg shadow-indigo-500/30 flex items-center justify-center animate-bounce">
                <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center text-4xl sm:text-5xl">
                  🪄
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                ด่าน 2 ผ่านแล้ว!
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              🎉 ยินดีด้วย! ผ่านด่านที่ 2 แล้ว!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-5 font-medium leading-relaxed">
              คุณปลดล็อกคาถาตัวดำเนินการสืบค้นลับทั้ง 6 คาถา และไขปริศนาครบถ้วนเรียบร้อย
            </p>

            {/* Rewards Card */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-indigo-50 border border-indigo-200 mb-6">
              <div className="p-2 rounded-xl bg-white text-center border border-indigo-100 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold">EXP ที่ได้รับ</div>
                <div className="text-sm font-black text-indigo-600">+150 EXP</div>
              </div>
              <div className="p-2 rounded-xl bg-white text-center border border-indigo-100 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold">เหรียญทอง</div>
                <div className="text-sm font-black text-amber-600">+60 Coins</div>
              </div>
              <div className="p-2 rounded-xl bg-white text-center border border-indigo-100 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold">ตราสัญลักษณ์</div>
                <div className="text-xs font-black text-purple-600 truncate">จอมเวทคาถา</div>
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
                id="btn-victory-back-journey-zone2"
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
