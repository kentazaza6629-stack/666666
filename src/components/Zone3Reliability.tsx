import React, { useState } from 'react';
import { TabType, DetectiveProfile } from '../types';
import { DOMAIN_KNOWLEDGE } from '../data/learningContent';
import { 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Home,
  Building2,
  GraduationCap,
  HeartHandshake,
  Store,
  ShieldAlert
} from 'lucide-react';
import { playClickSound, playCorrectSound, playWrongSound, playBadgeUnlockSound } from '../utils/sound';
import { JourneyNextStepCard } from './JourneyNextStepCard';
import { StageHeaderBanner } from './StageHeaderBanner';

interface Zone3Props {
  profile?: DetectiveProfile;
  onEarnExp: (amount: number, reason: string) => void;
  onUnlockBadge: (badgeId: string) => void;
  onSelectTab?: (tab: TabType) => void;
}

interface FakeNewsCase {
  id: number;
  title: string;
  url: string;
  sourceType: string;
  domainExtension: string;
  postContent: string;
  postedDate: string;
  authorInfo: string;
  isFake: boolean;
  verdictReason: string;
  redFlags: string[];
}

export const Zone3Reliability: React.FC<Zone3Props> = ({ profile, onEarnExp, onUnlockBadge, onSelectTab }) => {
  const [activeTab, setActiveTab] = useState<'domain_inspector' | 'checklist_5w1h' | 'fake_buster'>('domain_inspector');

  // Domain Inspector selection
  const [selectedDomainIndex, setSelectedDomainIndex] = useState<number>(0);

  // Fake News Buster State
  const [inspectedCases, setInspectedCases] = useState<{ [key: number]: 'safe' | 'fake' }>({});
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);

  const FAKE_NEWS_CASES: FakeNewsCase[] = [
    {
      id: 0,
      title: 'ส่งต่อด่วน! รับฟรีแท็บเล็ตเพื่อการศึกษาสำหรับนักเรียน ป.5 ทุกคน',
      url: 'https://www.chula-free-tablet-giveaway.xyz/claim-now',
      sourceType: 'ลิงก์สแปมในแชท / เว็บไซต์สุ่มแจกของ',
      domainExtension: '.xyz (โดเมนราคาถูก ใครก็จดได้)',
      postContent: 'กระทรวงประกาศแจก iPad และแท็บเล็ตฟรี ให้กดลิงก์และกรอกเลขบัตรประชาชนพร้อมเบอร์โทรเพื่อรับสิทธิ์ด่วน ก่อนหมดเขตเที่ยงคืนนี้!',
      postedDate: 'ไม่มีวันที่ระบุ (ใช้คำว่า "วันนี้เท่านั้น")',
      authorInfo: 'Admin ไม่ระบุตัวตนจริง',
      isFake: true,
      verdictReason: 'เป็นเว็บไซต์ฟิชชิ่ง (Phishing) หลอกเอาข้อมูลส่วนตัว! โดเมนเป็น .xyz ไม่ใช่เว็บราชการ .go.th และแอบอ้างชื่อสถาบัน',
      redFlags: [
        'นามสกุลเว็บ .xyz ไม่ใช่เว็บการศึกษาหรือราชการ',
        'เร่งเร้าให้รีบตัดสินใจ "ก่อนเที่ยงคืนนี้"',
        'ขอข้อมูลส่วนตัวสำคัญ เช่น เลขบัตรประชาชน',
        'ไม่มีการยืนยันจากข่าวทางการ'
      ]
    },
    {
      id: 1,
      title: 'ประกาศเตือนภัยการระบาดของโรคไข้เลือดออกในฤดูฝน - กรมควบคุมโรค',
      url: 'https://www.ddc.moph.go.th/news/dengue-fever-warning',
      sourceType: 'เว็บไซต์ทางการกระทรวงสาธารณสุข',
      domainExtension: '.go.th (Government Thailand)',
      postContent: 'กรมควบคุมโรค กระทรวงสาธารณสุข เตือนประชาชนระวังยุงลายพาหะโรคไข้เลือดออก แนะมาตรการ "3 เก็บ 3 ป้องกัน" กำจัดแหล่งน้ำขังรอบบ้าน...',
      postedDate: '15 พฤษภาคม 2567',
      authorInfo: 'นายแพทย์ผู้เชี่ยวชาญ กรมควบคุมโรค กระทรวงสาธารณสุข',
      isFake: false,
      verdictReason: 'ข้อมูลน่าเชื่อถือสูงมาก (100%) เพราะมาจากเว็บไซต์หน่วยงานราชการโดยตรง (.go.th) มีชื่อแพทย์และมาตรการทางสาธารณสุขชัดเจน',
      redFlags: []
    },
    {
      id: 2,
      title: 'ค้นพบสิ่งมีชีวิตต่างดาวตัวจริงบนดาวอังคาร รัฐบาลแอบปิดข่าว!',
      url: 'https://www.super-mystery-alien-news.com/shocking-truth',
      sourceType: 'เว็บบล็อกเรื่องลึกลับ / โซเชียลมีเดีย',
      domainExtension: '.com (เว็บไซต์ทั่วไป/ธุรกิจ)',
      postContent: 'นักบินอวกาศนิรนามเผยภาพเอเลี่ยนตัวเขียวกำลังสร้างพีระมิดบนดาวอังคาร นาซ่าแอบซ่อนความจริงมานานกว่า 50 ปี คลิกดูภาพหลุดที่นี่!',
      postedDate: '3 ปีก่อน (ข้อมูลเก่า)',
      authorInfo: 'นามแฝง "X-Files-Hunter"',
      isFake: true,
      verdictReason: 'ข่าวปลอมประเภท Clickbait สร้างเรื่องตื่นเต้นเพื่อยอดวิว รูปภาพผ่านการตัดต่อ ไม่มีรายงานจากองค์การดาราศาสตร์สากล',
      redFlags: [
        'พาดหัวตกใจเกินจริง (Clickbait)',
        'ไม่ระบุชื่อนักวิทยาศาสตร์จริง',
        'ไม่มีงานวิจัยหรือหลักฐานทางดาราศาสตร์รองรับ'
      ]
    },
    {
      id: 3,
      title: 'บทความวิชาการ: การสังเคราะห์ด้วยแสงและการเปลี่ยนแปลงสภาพภูมิอากาศ',
      url: 'https://www.scijournal.chula.ac.th/article/photosynthesis-2024',
      sourceType: 'วารสารวิชาการ คณะวิทยาศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย',
      domainExtension: '.ac.th (Academic Thailand)',
      postContent: 'รายงานการวิจัยเรื่องประสิทธิภาพการดูดซับคาร์บอนไดออกไซด์ของพืชเมืองร้อนในเขตป่าฝน โดยคณะผู้วิจัยภาควิชาพฤกษศาสตร์...',
      postedDate: 'มกราคม 2567',
      authorInfo: 'รศ.ดร. นักวิจัยผู้เชี่ยวชาญด้านชีววิทยาพืช',
      isFake: false,
      verdictReason: 'น่าเชื่อถือสูงมาก (.ac.th) จัดทำโดยอาจารย์นักวิจัยมหาวิทยาลัย มีระเบียบวิธีวิจัยและผ่านการตรวจประเมินทางวิชาการ (Peer Review)',
      redFlags: []
    }
  ];

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-6 h-6" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6" />;
      case 'HeartHandshake': return <HeartHandshake className="w-6 h-6" />;
      case 'Store': return <Store className="w-6 h-6" />;
      default: return <Globe className="w-6 h-6" />;
    }
  };

  const handleJudgeCase = (caseId: number, judgment: 'safe' | 'fake') => {
    if (inspectedCases[caseId]) return;

    playClickSound();
    const newInspected = { ...inspectedCases, [caseId]: judgment };
    setInspectedCases(newInspected);

    const targetCase = FAKE_NEWS_CASES[caseId];
    const isCorrect = (targetCase.isFake && judgment === 'fake') || (!targetCase.isFake && judgment === 'safe');

    if (isCorrect) {
      playCorrectSound();
      onEarnExp(45, 'ตรวจจับความน่าเชื่อถือถูกต้อง');
    } else {
      playWrongSound();
    }

    if (Object.keys(newInspected).length === FAKE_NEWS_CASES.length) {
      const correctCount = FAKE_NEWS_CASES.filter(
        (c) => (c.isFake && newInspected[c.id] === 'fake') || (!c.isFake && newInspected[c.id] === 'safe')
      ).length;

      if (correctCount === FAKE_NEWS_CASES.length) {
        playBadgeUnlockSound();
        onUnlockBadge('fact_checker');
        onEarnExp(180, 'ผ่านด่านจับผิดข่าวลวงคะแนนเต็ม 100%!');
      }
      setTimeout(() => {
        setShowVictoryModal(true);
      }, 800);
    }
  };

  const subTabs = [
    { id: 'domain_inspector', label: '1. ตรวจสอบนามสกุลเว็บ (.go / .ac)', icon: Globe },
    { id: 'checklist_5w1h', label: '2. กฎ 5W1H เช็กความจริง', icon: ShieldCheck },
    { id: 'fake_buster', label: '3. ห้องแล็บจับผิดข่าวลวง', icon: ShieldAlert, badge: '4 เคส' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* 3D Ribbon Banner & Currency Bar */}
      <StageHeaderBanner
        stageNumber={3}
        title="ประเมินความน่าเชื่อถือ & นามสกุลเว็บ"
        subtitle="แยกแยะโดเมน .go.th, .ac.th, .or.th และฝึกจับผิดข่าวปลอม Fake News ด้วยหลัก 5W1H"
        themeGradient="from-teal-600 via-emerald-600 to-cyan-700"
        profile={profile}
        subTabs={subTabs}
        activeSubTab={activeTab}
        onSelectSubTab={(id) => setActiveTab(id as any)}
      />

      {/* Tab 1: Domain Inspector */}
      {activeTab === 'domain_inspector' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DOMAIN_KNOWLEDGE.map((item, idx) => (
              <div
                key={item.domain}
                onClick={() => { playClickSound(); setSelectedDomainIndex(idx); }}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                  selectedDomainIndex === idx
                    ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
                    {getDomainIcon(item.iconName)}
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                    {item.trustLevel}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-mono">{item.domain}</h3>
                <h4 className="text-xs font-black text-emerald-400 mb-2">{item.name}</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">{item.description}</p>
                
                <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-300 truncate">
                  ตัวอย่าง: {item.example}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Mascot Tip */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-cyan-950 border border-emerald-500/30 shadow-lg flex items-center gap-3.5 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />
            <span className="text-3xl relative z-10">🤖</span>
            <div className="text-xs sm:text-sm text-slate-300 relative z-10">
              <strong className="text-emerald-400 font-black">สารวัตรไบต์แนะจำ: </strong>
              เว็บไซต์ที่ลงท้ายด้วย <code className="text-emerald-300 bg-slate-900 px-1 rounded">.go.th</code> (รัฐบาล) และ <code className="text-emerald-300 bg-slate-900 px-1 rounded">.ac.th</code> (การศึกษา) ต้องผ่านการรับรองจากองค์กรทางการ จึงมีความน่าเชื่อถือสูงสุดในการทำรายงาน!
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 5W1H Checklist */}
      {activeTab === 'checklist_5w1h' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { tag: 'Who', label: 'ใครเป็นคนเขียน / หน่วยงานใด?', desc: 'มีชื่อผู้แต่ง สำนักพิมพ์ หรือองค์กรที่ตรวจสอบได้จริงหรือไม่', icon: '👤', color: 'from-blue-950/40 to-sky-950/40 border-sky-500/30 text-sky-400', tagBg: 'bg-sky-500/20 border-sky-500/30 text-sky-300' },
            { tag: 'What', label: 'เนื้อหาคืออะไร มีหลักฐานไหม?', desc: 'เป็นข้อเท็จจริง (Fact) หรือแค่ความคิดเห็น (Opinion) มีสถิติอ้างอิงไหม', icon: '📝', color: 'from-purple-950/40 to-indigo-950/40 border-purple-500/30 text-purple-400', tagBg: 'bg-purple-500/20 border-purple-500/30 text-purple-300' },
            { tag: 'When', label: 'เผยแพร่เมื่อไหร่ ทันสมัยไหม?', desc: 'ตรวจสอบวันที่เผยแพร่ ข้อมูลทางการแพทย์หรือเทคโนโลยีที่เก่าเกินไปอาจไม่ถูกต้อง', icon: '📅', color: 'from-amber-950/40 to-yellow-950/40 border-amber-500/30 text-amber-400', tagBg: 'bg-amber-500/20 border-amber-500/30 text-amber-300' },
            { tag: 'Where', label: 'มาจากแหล่งใด โดเมนอะไร?', desc: 'ตรวจดู URL และโดเมน เช่น .go.th หรือเว็บแอบอ้างสแปม .xyz', icon: '🌐', color: 'from-emerald-950/40 to-teal-950/40 border-emerald-500/30 text-emerald-400', tagBg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' },
            { tag: 'Why', label: 'เผยแพร่เพื่อวัตถุประสงค์ใด?', desc: 'เพื่อให้ความรู้ หรือเพื่อขายของ หรือหลอกล่อให้คลิกเพื่อเอาเงินโฆษณา (Clickbait)', icon: '🎯', color: 'from-pink-950/40 to-rose-950/40 border-pink-500/30 text-pink-400', tagBg: 'bg-pink-500/20 border-pink-500/30 text-pink-300' },
            { tag: 'How', label: 'นำเสนออย่างไร น่าเชื่อถือไหม?', desc: 'ใช้ภาษาที่สุภาพ เป็นกลาง หรือใช้คำพาดหัวตกใจเกินจริง ขู่ให้กลัว', icon: '🔍', color: 'from-violet-950/40 to-fuchsia-950/40 border-violet-500/30 text-violet-400', tagBg: 'bg-violet-500/20 border-violet-500/30 text-violet-300' }
          ].map((item, idx) => (
            <div key={idx} className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-br ${item.color} border-2 space-y-2.5 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-transform`}>
              <div className="flex items-center justify-between">
                <span className="text-3xl">{item.icon}</span>
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${item.tagBg}`}>
                  {item.tag}
                </span>
              </div>
              <h3 className={`text-base font-black text-white`}>{item.label}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Fake News Buster */}
      {activeTab === 'fake_buster' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] space-y-1">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              ห้องทดลองจับผิดข่าวลวง (Fake News Buster - 4 คดี)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              วิเคราะห์ URL, โดเมน, และเนื้อหาด้านล่าง แล้วตัดสินว่าข้อมูลนี้น่าเชื่อถือ หรือเป็นข่าวปลอม!
            </p>
          </div>

          <div className="space-y-4">
            {FAKE_NEWS_CASES.map((item) => {
              const judged = inspectedCases[item.id];
              const isJudged = judged !== undefined;
              const isCorrect = (item.isFake && judged === 'fake') || (!item.isFake && judged === 'safe');

              return (
                <div
                  key={item.id}
                  className={`p-5 sm:p-6 rounded-3xl border-2 transition-all ${
                    isJudged
                      ? isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                      : 'bg-slate-900/60 border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                        {item.url}
                      </span>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {item.domainExtension}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-white">{item.title}</h4>

                    <div className="p-4 rounded-2xl bg-slate-950 text-xs sm:text-sm text-slate-300 leading-relaxed border border-slate-800 font-medium">
                      "{item.postContent}"
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 pt-1 font-bold">
                      <span>ผู้เขียน/แหล่งที่มา: <strong className="text-slate-300">{item.authorInfo}</strong></span>
                      <span>วันที่: <strong className="text-slate-300">{item.postedDate}</strong></span>
                    </div>
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 mt-2">
                    <span className="text-xs sm:text-sm font-black text-slate-300">คำตัดสินของนักสืบ:</span>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        disabled={isJudged}
                        onClick={() => handleJudgeCase(item.id, 'safe')}
                        className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                          judged === 'safe'
                            ? 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500'
                            : 'bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:bg-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" /> น่าเชื่อถือ (Safe)
                      </button>
                      <button
                        disabled={isJudged}
                        onClick={() => handleJudgeCase(item.id, 'fake')}
                        className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                          judged === 'fake'
                            ? 'bg-rose-500/20 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] ring-2 ring-rose-500'
                            : 'bg-slate-800 text-rose-400 border border-rose-500/30 hover:bg-slate-700'
                        }`}
                      >
                        <XCircle className="w-4 h-4" /> ข่าวปลอม (Fake)
                      </button>
                    </div>
                  </div>

                  {/* Analysis Result */}
                  {isJudged && (
                    <div className="mt-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <span className="text-emerald-400 font-black flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> ตัดสินถูกต้อง! (+45 EXP)
                          </span>
                        ) : (
                          <span className="text-rose-400 font-black flex items-center gap-1.5">
                            <XCircle className="w-4 h-4" /> ยังไม่ถูกต้อง ลองสังเกตนามสกุลเว็บและแหล่งที่มาอีกครั้ง
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        <strong className="text-white font-black">เฉลยของสารวัตรไบต์: </strong>
                        {item.verdictReason}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Journey Return Card */}
      {onSelectTab && (
        <JourneyNextStepCard
          currentStepNumber={3}
          currentStepTitle="แล็บประเมินความน่าเชื่อถือ & นามสกุลเว็บ"
          rewardEarnedText="+180 EXP & ตรานักปราบข่าวลือ Fake News"
          onSelectTab={onSelectTab}
        />
      )}

      {/* Victory Celebration Modal */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-4 border-emerald-500/50 p-6 sm:p-8 shadow-[0_0_30px_rgba(16,185,129,0.3)] text-center overflow-hidden animate-scaleUp text-white">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
            
            {/* Trophy Badge */}
            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4 z-10">
              <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-1 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center animate-bounce">
                <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-4xl sm:text-5xl">
                  🛡️
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md border border-amber-300">
                ด่าน 3 ผ่านแล้ว!
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 relative z-10">
              🎉 ยินดีด้วย! ผ่านด่านที่ 3 แล้ว!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-5 font-medium leading-relaxed relative z-10">
              คุณผ่านการตรวจสอบโดเมนเว็บไซต์และตรวจจับข่าวลวง Fake News ครบทั้ง 4 กรณีอย่างยอดเยี่ยม
            </p>

            {/* Rewards Card */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-800/80 border border-emerald-500/30 mb-6 relative z-10 shadow-inner">
              <div className="p-2 rounded-xl bg-slate-900 text-center border border-slate-700 shadow-sm">
                <div className="text-[10px] text-slate-400 font-bold">EXP ที่ได้รับ</div>
                <div className="text-sm font-black text-emerald-400">+180 EXP</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 text-center border border-slate-700 shadow-sm">
                <div className="text-[10px] text-slate-400 font-bold">เหรียญทอง</div>
                <div className="text-sm font-black text-amber-400">+70 Coins</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 text-center border border-slate-700 shadow-sm">
                <div className="text-[10px] text-slate-400 font-bold">ตราสัญลักษณ์</div>
                <div className="text-xs font-black text-teal-400 truncate">นักปราบข่าวลือ</div>
              </div>
            </div>

            {/* Return Button */}
            <div className="relative z-10">
              <button
                onClick={() => {
                  playClickSound();
                  setShowVictoryModal(false);
                  if (onSelectTab) {
                    onSelectTab('hq_overview');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                id="btn-victory-back-journey-zone3"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm sm:text-base shadow-[0_0_15px_rgba(20,184,166,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-5 h-5 stroke-[2.5]" />
                <span>🗺️ กลับสู่หน้าเดินทาง</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
