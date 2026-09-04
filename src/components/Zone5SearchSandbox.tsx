import React, { useState } from 'react';
import { SANDBOX_PRESET_QUERIES } from '../data/learningContent';
import { SearchResult, TabType } from '../types';
import { 
  Search, 
  Sparkles, 
  Terminal, 
  Bot, 
  Send, 
  Filter, 
  FileText, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Zap,
  Image as ImageIcon,
  Newspaper,
  GraduationCap
} from 'lucide-react';
import { playClickSound, playCorrectSound, playSearchSound } from '../utils/sound';
import { JourneyNextStepCard } from './JourneyNextStepCard';

interface Zone5Props {
  detectiveName?: string;
  onEarnExp: (amount: number, reason: string) => void;
  onUnlockBadge?: (badgeId: string) => void;
  onEarnCoins?: (amount: number, reason: string) => void;
  onSelectTab?: (tab: TabType) => void;
}

export const Zone5SearchSandbox: React.FC<Zone5Props> = ({ detectiveName = 'นักสืบ', onEarnExp, onUnlockBadge, onEarnCoins, onSelectTab }) => {
  const [searchQuery, setSearchQuery] = useState<string>('"สัตว์ป่าสงวน" site:.go.th');
  const [activeFilter, setActiveFilter] = useState<'all' | 'gov' | 'edu' | 'pdf' | 'news'>('all');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(true);

  // AI Evaluator Result State
  const [evalResult, setEvalResult] = useState<any>({
    score: 9,
    verdict: 'ยอดเยี่ยม',
    feedback: 'คำค้นหานี้ใช้เครื่องหมายคำพูดล็อกคำเฉพาะ และระบุ site:.go.th เพื่อดึงข้อมูลจากเว็บราชการที่น่าเชื่อถือสูงมาก!',
    recommendedKeywords: ['"สัตว์ป่าสงวน" 19 ชนิด site:.go.th', 'สัตว์ป่าสงวน filetype:pdf'],
    operatorsUsed: ['เครื่องหมายคำพูด ("...")', 'site: (ระบุโดเมน)'],
  });

  // AI Chat Assistant State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `สวัสดีครับนักสืบ ${detectiveName}! 🤖 สารวัตรไบต์ประจำการใน Search Sandbox แล้ว ลองพิมพ์คำค้นหา หรือถามข้อสงสัยเกี่ยวกับวิชาวิทยาการคำนวณ ป.5 ได้เลยนะ!`,
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Simulated Database for the sandbox
  const ALL_MOCK_RESULTS: SearchResult[] = [
    {
      id: 's-1',
      title: 'รายชื่อสัตว์ป่าสงวนแห่งชาติ 19 ชนิดของประเทศไทย - กรมอุทยานแห่งชาติ',
      url: 'https://www.dnp.go.th/wildlife/reserved_species_thailand.html',
      domain: 'dnp.go.th',
      snippet: 'พระราชบัญญัติสงวนและคุ้มครองสัตว์ป่า พ.ศ. 2562 กำหนดสัตว์ป่าสงวน 19 ชนิด เช่น สมเสร็จ เลียงผา กวางผา ละองหรือละมั่ง วาฬบรูด้า นกชนหิน...',
      reliability: 'สูงมาก',
      reliabilityScore: 99,
      type: 'government',
      date: '10 ม.ค. 2567',
      author: 'กรมอุทยานแห่งชาติ สัตว์ป่า และพันธุ์พืช',
      isClue: true,
    },
    {
      id: 's-2',
      title: 'สื่อการสอนวิทยาการคำนวณ ป.5: การสืบค้นข้อมูลอย่างปลอดภัย [PDF] - สสวท.',
      url: 'https://www.ipst.ac.th/curriculum/p5-computing-science-search.pdf',
      domain: 'ipst.ac.th',
      snippet: 'คู่มือและใบกิจกรรมการเรียนรู้เรื่องการค้นหาข้อมูลด้วยคำสำคัญ ตัวดำเนินการค้นหา และการประเมินความน่าเชื่อถือ 5W1H...',
      reliability: 'สูงมาก',
      reliabilityScore: 98,
      type: 'pdf',
      date: '5 ก.พ. 2567',
      author: 'สถาบันส่งเสริมการสอนวิทยาศาสตร์และเทคโนโลยี',
      isClue: true,
    },
    {
      id: 's-3',
      title: 'ระบบสุริยะและการโคจรของดาวเคราะห์บริวาร - องค์การดาราศาสตร์',
      url: 'https://www.narit.or.th/index.php/student-space/solar-system',
      domain: 'narit.or.th',
      snippet: 'เรียนรู้เรื่องดวงอาทิตย์ ดาวเคราะห์หิน ดาวเคราะห์แก๊ส และดวงจันทร์บริวาร พร้อมภาพจำลอง 3 มิติความละเอียดสูง...',
      reliability: 'สูงมาก',
      reliabilityScore: 97,
      type: 'article',
      date: '18 ม.ค. 2567',
      author: 'สถาบันวิจัยดาราศาสตร์แห่งชาติ (สดร.)',
      isClue: true,
    },
    {
      id: 's-4',
      title: 'ข่าวสิ่งแวดล้อม: มาตรการลดขยะพลาสติกและผลกระทบต่อป่าชายเลน',
      url: 'https://www.thaipbs.or.th/news/content/marine-plastic-waste-2024',
      domain: 'thaipbs.or.th',
      snippet: 'รายงานข่าวเชิงวิเคราะห์: ปัญหาขยะพลาสติกส่งผลกระทบต่อระบบนิเวศทางทะเลและสัตว์น้ำหายากในอ่าวไทย...',
      reliability: 'น่าเชื่อถือ',
      reliabilityScore: 92,
      type: 'news',
      date: 'เมื่อวานนี้',
      author: 'ศูนย์ข่าวสิ่งแวดล้อม Thai PBS',
      isClue: true,
    },
    {
      id: 's-5',
      title: 'ขายของเล่นโมเดลสัตว์ป่าสงวน ลดราคา 70% ส่งฟรีทั่วประเทศ',
      url: 'https://www.super-toy-store-sale.com/products/wild-animals',
      domain: 'super-toy-store-sale.com',
      snippet: 'สั่งซื้อของเล่นสัตว์ป่าสงวนครบเซ็ต 19 ชนิด ราคาถูกที่สุด ซื้อ 1 แถม 1 มีบริการเก็บเงินปลายทาง...',
      reliability: 'ต้องระวัง',
      reliabilityScore: 30,
      type: 'article',
      date: '2024',
      author: 'ToyStore Online',
      isClue: false,
      fakeReason: 'เป็นเว็บร้านค้าออนไลน์ ไม่ใช่แหล่งข้อมูลความรู้ทางวิชาการ',
    },
  ];

  // Dynamic filter
  const filteredResults = ALL_MOCK_RESULTS.filter((item) => {
    if (activeFilter === 'gov') return item.domain.includes('.go.th');
    if (activeFilter === 'edu') return item.domain.includes('.ac.th');
    if (activeFilter === 'pdf') return item.type === 'pdf';
    if (activeFilter === 'news') return item.type === 'news';
    return true;
  });

  const handleExecuteSearch = async () => {
    if (!searchQuery.trim()) return;
    playSearchSound();
    setIsSearching(true);
    setHasSearched(true);
    onEarnExp(20, 'ทดสอบการค้นหาใน Sandbox');

    try {
      const res = await fetch('/api/evaluate-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          missionGoal: 'การสืบค้นข้อมูลทางวิชาการสำหรับเด็ก ป.5',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvalResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendChatMessage = async (presetText?: string) => {
    const messageToSend = presetText || chatInput;
    if (!messageToSend.trim() || isAiLoading) return;

    playClickSound();
    const newMessages = [...chatMessages, { sender: 'user' as const, text: messageToSend }];
    setChatMessages(newMessages);
    if (!presetText) setChatInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/detective-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          context: `Search Sandbox (Current Query: ${searchQuery})`,
          detectiveName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        playCorrectSound();
        setChatMessages([...newMessages, { sender: 'ai' as const, text: data.response }]);
        onEarnExp(15, 'สนทนากับสารวัตรไบต์ AI');
      }
    } catch (e) {
      console.error(e);
      setChatMessages([
        ...newMessages,
        {
          sender: 'ai' as const,
          text: 'สารวัตรไบต์ขอแนะนำ: ลองใช้คำสำคัญที่สั้นลง และใส่เครื่องหมายคำพูด "" ครอบคำเฉพาะดูนะ!',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border-2 border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
            <Terminal className="w-3.5 h-3.5" /> โซนที่ 5: วิทยาการคำนวณ ป.5
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            จำลองระบบสืบค้นเสมือนจริง & สารวัตรไบต์ AI
          </h2>
          <p className="text-xs sm:text-sm text-cyan-100/70">
            ระบบค้นหาจำลองแบบ Google รองรับตัวดำเนินการ พร้อมระบบ AI ช่วยประเมินคุณภาพคำค้นหา
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-cyan-500/30 flex items-center gap-2 text-xs font-bold text-cyan-300 shrink-0 relative z-10">
          <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Gemini AI Connected</span>
        </div>
      </div>

      {/* Main Grid: Search Engine (Left 2 Col) + AI Chatbot (Right 1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Search Console & Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Mock Browser Container */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-4 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-sm relative z-10">
            {/* Search Input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch()}
                    placeholder="พิมพ์คำสำคัญ หรือใช้ตัวดำเนินการ เช่น &quot;&quot;, -, site:, filetype:"
                    className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-slate-950 border border-slate-700 hover:border-slate-600 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 text-xs font-bold"
                    >
                      ล้าง
                    </button>
                  )}
                </div>
                <button
                  onClick={handleExecuteSearch}
                  disabled={isSearching}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs shadow-md shadow-cyan-900/50 transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  {isSearching ? 'กำลังค้นหา...' : 'สืบค้น'}
                </button>
              </div>

              {/* Preset Queries */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400">สูตรตัวอย่าง:</span>
                {SANDBOX_PRESET_QUERIES.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playClickSound();
                      setSearchQuery(preset.query);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 font-mono text-[11px] border border-slate-700 hover:border-cyan-500/50 transition cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Tabs (All, Gov, Edu, PDF, News) */}
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'ทั้งหมด (All)', icon: Globe },
                { id: 'gov', label: 'ภาครัฐ (.go.th)', icon: ShieldCheck },
                { id: 'edu', label: 'การศึกษา (.ac.th)', icon: GraduationCap },
                { id: 'pdf', label: 'ไฟล์เอกสาร (PDF)', icon: FileText },
                { id: 'news', label: 'ข่าวสาร (News)', icon: Newspaper },
              ].map((f) => {
                const Icon = f.icon;
                const isActive = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => { playClickSound(); setActiveFilter(f.id as any); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            {/* AI Evaluator Bar */}
            {evalResult && (
              <div className="p-3.5 rounded-xl bg-slate-850 border border-cyan-500/30 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      ผลการประเมินคุณภาพคำค้นหา:
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      evalResult.score >= 8
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {evalResult.verdict} ({evalResult.score}/10 คะแนน)
                    </span>
                  </div>

                  {evalResult.operatorsUsed?.length > 0 && (
                    <span className="text-[10px] text-purple-300 font-mono hidden sm:inline-block">
                      ตรวจพบ: {evalResult.operatorsUsed.join(', ')}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{evalResult.feedback}</p>
              </div>
            )}
          </div>

          {/* Results List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>แสดงผลลัพธ์ {filteredResults.length} รายการ</span>
              <span className="text-cyan-400 font-mono text-[11px]">Query: "{searchQuery}"</span>
            </div>

            {filteredResults.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-xl bg-slate-850/90 border border-slate-700/80 hover:border-cyan-400/50 hover:bg-slate-800 transition space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-cyan-400 truncate max-w-sm">
                    {res.url}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    res.reliabilityScore >= 80
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {res.reliability} ({res.reliabilityScore}%)
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white hover:text-cyan-300 transition-colors">
                  {res.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">{res.snippet}</p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>ผู้เขียน: {res.author}</span>
                  <span>วันที่: {res.date}</span>
                  <span>โดเมน: {res.domain}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: AI Detective Assistant (Inspector Byte) */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border-2 border-cyan-500/30 flex flex-col justify-between h-[650px] shadow-[0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-[50px] rounded-full pointer-events-none" />
          
          {/* Chat Header */}
          <div className="space-y-2 border-b border-slate-700/50 pb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  สารวัตรไบต์ (Inspector Byte)
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </h3>
                <p className="text-[11px] text-cyan-300">ผู้ช่วยสอนวิทยาการคำนวณ ป.5 (AI)</p>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'แนะนำคำสำคัญดีๆ',
                'สอนใช้ site: หน่อย',
                'วิธีจับผิดข่าวปลอม',
              ].map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSendChatMessage(qp)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-100 hover:text-white border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2 text-xs custom-scrollbar relative z-10">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-tr-none shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isAiLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-2">
                <Bot className="w-4 h-4 animate-bounce text-cyan-400" />
                <span>สารวัตรไบต์กำลังวิเคราะห์ข้อมูล...</span>
              </div>
            )}
          </div>

          {/* Chat Input Box */}
          <div className="pt-3 border-t border-slate-700/50 flex gap-2 relative z-10">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
              placeholder="พิมพ์คำถาม หรือขอคำแนะนำ..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 hover:border-slate-600 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            <button
              onClick={() => handleSendChatMessage()}
              disabled={isAiLoading || !chatInput.trim()}
              className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all cursor-pointer flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Step Journey Next Step Card */}
      {onSelectTab && (
        <JourneyNextStepCard
          currentStepNumber={5}
          currentStepTitle="จำลองค้นหาจริง & ผู้ช่วยสารวัตร AI"
          nextTab="zone6_exam"
          nextStepTitle="ด่าน 6: สอบวัดระดับยอดนักสืบสารสนเทศ ป.5"
          nextStepDesc="ทดสอบประมวลความรู้สืบค้น 10 ข้อ ทำคะแนนให้ได้ 80% ขึ้นไปเพื่อรับยศทองและปลดล็อกใบประกาศนียบัตรทางการ!"
          rewardEarnedText="ฝึกฝน AI พร้อมประลองข้อสอบจริง"
          onSelectTab={onSelectTab}
        />
      )}
    </div>
  );
};
