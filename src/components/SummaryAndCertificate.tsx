import React, { useRef } from 'react';
import { DetectiveProfile, TabType } from '../types';
import { 
  Award, 
  Printer, 
  Download, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Key, 
  BookOpen, 
  Terminal,
  FileText,
  Home,
  ShoppingBag,
  RotateCcw
} from 'lucide-react';
import { playClickSound } from '../utils/sound';

interface SummaryAndCertificateProps {
  profile: DetectiveProfile;
  onSelectTab?: (tab: TabType) => void;
}

export const SummaryAndCertificate: React.FC<SummaryAndCertificateProps> = ({ profile, onSelectTab }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const completedCases = profile.completedCases || [];
  const badges = profile.badges || [];

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-14">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-850 to-purple-950/80 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
            <Award className="w-3.5 h-3.5" /> เกียรติบัตร & สรุปสูตรสารสนเทศ ป.5
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            ประกาศนียบัตรยอดนักสืบดิจิทัล & แผ่นพับสรุปบทเรียน
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            พิมพ์เกียรติบัตรเป็นผลงาน และทบทวนความรู้วิทยาการคำนวณ ป.5 หน่วยการเรียนรู้ที่ 3
          </p>
        </div>

        <button
          onClick={handlePrint}
          id="btn-print-certificate"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg flex items-center gap-2 transition shrink-0"
        >
          <Printer className="w-4 h-4" /> พิมพ์ / บันทึก PDF เกียรติบัตร
        </button>
      </div>

      {/* Printable Certificate Showcase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            ตัวอย่างใบประกาศนียบัตรทางการ
          </h3>
          <span className="text-xs text-amber-400 font-mono">ID: IQ-{profile.level}95-{profile.exp}</span>
        </div>

        {/* Certificate Card Body */}
        <div 
          ref={printRef}
          className="relative bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 rounded-3xl border-4 border-amber-400/80 p-8 sm:p-12 shadow-2xl shadow-amber-950/40 text-center space-y-6 overflow-hidden print:m-0 print:border-amber-600 print:text-black print:bg-white"
        >
          {/* Decorative Corners */}
          <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
          <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

          {/* Top Title */}
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
              สำนักงานสารวัตรไบต์ • กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide">
              ใบประกาศนียบัตรยอดนักสืบสารสนเทศดิจิทัล
            </h1>
            <p className="text-xs sm:text-sm text-cyan-300">
              หลักสูตรวิทยาการคำนวณ ชั้นประถมศึกษาปีที่ 5 (สพฐ.)
            </p>
          </div>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />

          {/* Student Info */}
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-slate-300">ขอมอบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า</p>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 py-1">
              {profile.avatar} {profile.name}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              ได้ผ่านการฝึกอบรมและปฏิบัติการสืบค้นข้อมูลผ่านเครือข่ายอินเทอร์เน็ต <br className="hidden sm:inline" />
              มีความเชี่ยวชาญการสกัดคำสำคัญ (Keyword), การใช้คาถาตัวดำเนินการสืบค้นขั้นสูง, <br className="hidden sm:inline" />
              และผ่านเกณฑ์การประเมินความน่าเชื่อถือของข้อมูล 5W1H ด้วยยศเกียรติยศ
            </p>
            <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-bold text-sm">
              🌟 {profile.rankTitle} (ระดับ Level {profile.level}) 🌟
            </div>
          </div>

          {/* Stats Badges in Cert */}
          <div className="grid grid-cols-3 max-w-md mx-auto gap-2 text-center text-xs pt-2">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700">
              <span className="text-slate-400 block text-[10px]">คะแนนสอบ</span>
              <span className="font-bold text-emerald-400 text-sm">{profile.quizScore}%</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700">
              <span className="text-slate-400 block text-[10px]">คดีที่คลี่คลาย</span>
              <span className="font-bold text-amber-400 text-sm">{(completedCases || []).length}/4 คดี</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700">
              <span className="text-slate-400 block text-[10px]">เหรียญเกียรติยศ</span>
              <span className="font-bold text-cyan-400 text-sm">{badges.filter(b => b && b.unlocked).length} เหรียญ</span>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-800/80 max-w-2xl mx-auto text-xs text-slate-400 gap-4">
            <div className="text-center sm:text-left space-y-1">
              <div className="font-mono text-white font-bold">สารวัตรไบต์ (Inspector Byte)</div>
              <div className="text-[11px]">หัวหน้าศูนย์ปฏิบัติการสืบสวนดิจิทัล</div>
            </div>

            {/* Gold Seal */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg border-2 border-amber-200">
              <Award className="w-8 h-8" />
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="font-mono text-white font-bold">{currentDate}</div>
              <div className="text-[11px]">วันที่ออกประกาศนียบัตร</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cheat Sheet for Grade 5 */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              แผ่นพับสรุปสูตรยอดนักสืบ ป.5 (Cheat Sheet)
            </h3>
            <p className="text-xs text-slate-400">พกพาสรุปความรู้ติดตัว ทบทวนก่อนสอบวิทยาการคำนวณ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: 3 Search Forms */}
          <div className="p-5 rounded-2xl bg-slate-850 border border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Key className="w-4 h-4" /> 1. 3 รูปแบบการค้นหา
            </div>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li><strong>1. คำสำคัญ (Keyword):</strong> สั้น กระชับ ตรงประเด็น ตัดคำถามทิ้ง</li>
              <li><strong>2. ตามหมวดหมู่ (Directory):</strong> เหมาะเมื่อยังคิดคำค้นไม่ออก เลือกจากหมวดใหญ่ไปย่อย</li>
              <li><strong>3. ขั้นสูง (Advanced):</strong> ผสมตัวดำเนินการเพื่อผลลัพธ์ที่แม่นยำ</li>
            </ul>
          </div>

          {/* Card 2: Operators Quick Table */}
          <div className="p-5 rounded-2xl bg-slate-850 border border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <Terminal className="w-4 h-4" /> 2. คาถาตัวดำเนินการหลัก
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
              <li><code className="text-cyan-300 font-bold">"..."</code> : ค้นหาคำติดกันเป๊ะ</li>
              <li><code className="text-rose-300 font-bold">-คำ</code> : ตัดคำที่ไม่ต้องการออก</li>
              <li><code className="text-emerald-300 font-bold">site:</code> : เจาะจงเว็บไซต์ (.go.th, .ac.th)</li>
              <li><code className="text-amber-300 font-bold">filetype:</code> : เจาะจงไฟล์ (pdf, pptx)</li>
              <li><code className="text-blue-300 font-bold">OR</code> : ค้นหาอย่างใดอย่างหนึ่ง</li>
            </ul>
          </div>

          {/* Card 3: Domains & Trust */}
          <div className="p-5 rounded-2xl bg-slate-850 border border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" /> 3. รหัสโดเมน & 5W1H
            </div>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li><strong>.go.th:</strong> รัฐบาลไทย (เชื่อถือได้สูงสุด)</li>
              <li><strong>.ac.th:</strong> สถาบันการศึกษา / มหาวิทยาลัย</li>
              <li><strong>5W1H:</strong> ตรวจสอบ Who, What, When, Where, Why, How ก่อนแชร์ทุกครั้ง!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Graduation Action Card */}
      {onSelectTab && (
        <div className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/40 text-center space-y-4 shadow-xl">
          <div className="text-2xl">🎓🎉</div>
          <h3 className="text-xl font-bold text-white">
            ยินดีด้วย! คุณได้ผ่านการฝึกฝนหลักสูตรนักสืบสารสนเทศ ป.5 ครบถ้วนแล้ว
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            คุณสามารถกลับไปทบทวนด่านต่างๆ แต่งห้องนอนนักสืบ หรือพิมพ์เกียรติบัตรเก็บไว้ส่งคุณครูได้ตลอดเวลา
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                playClickSound();
                onSelectTab('hq_overview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>กลับสู่แผนที่การเดินทาง</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onSelectTab('reward_shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ไปแต่งห้องนอน & อวาตาร์</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
