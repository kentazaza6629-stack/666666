import React from 'react';
import { TabType } from '../types';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  FolderLock, 
  Terminal, 
  GraduationCap, 
  ArrowLeft, 
  ArrowRight, 
  Map, 
  CheckCircle2,
  ListOrdered
} from 'lucide-react';
import { playClickSound } from '../utils/sound';

interface ZoneNavigationHeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const ZoneNavigationHeader: React.FC<ZoneNavigationHeaderProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const zones: { id: TabType; num: number; shortTitle: string; title: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'zone1_basics', num: 1, shortTitle: '1. ค้นหาพื้นฐาน', title: 'ด่าน 1: พื้นฐานการค้นหา & คำสำคัญ (Keyword)', icon: Search },
    { id: 'zone2_spells', num: 2, shortTitle: '2. คาถาสืบค้น', title: 'ด่าน 2: คลังคาถาตัวดำเนินการสืบค้นลับ', icon: Sparkles },
    { id: 'zone3_trust', num: 3, shortTitle: '3. ความน่าเชื่อถือ', title: 'ด่าน 3: แล็บความน่าเชื่อถือ & นามสกุลเว็บ', icon: ShieldCheck },
    { id: 'zone4_cases', num: 4, shortTitle: '4. แฟ้มคดีปริศนา', title: 'ด่าน 4: ลานประลองแฟ้มคดีปริศนา 4 คดี', icon: FolderLock },
    { id: 'zone5_sandbox', num: 5, shortTitle: '5. จำลอง AI', title: 'ด่าน 5: จำลองค้นหา & ผู้ช่วยสืบค้น AI', icon: Terminal },
    { id: 'zone6_exam', num: 6, shortTitle: '6. สอบยอดนักสืบ', title: 'ด่าน 6: สอบวัดระดับยอดนักสืบสารสนเทศ', icon: GraduationCap },
  ];

  const currentIndex = zones.findIndex(z => z.id === currentTab);
  if (currentIndex === -1) return null;

  const currentZone = zones[currentIndex];
  const prevZone = currentIndex > 0 ? zones[currentIndex - 1] : null;
  const nextZone = currentIndex < zones.length - 1 ? zones[currentIndex + 1] : null;

  return (
    <div className="mb-6 rounded-[28px] bg-white/95 backdrop-blur-md border border-slate-200/80 p-3.5 sm:p-4.5 shadow-md shadow-slate-200/50">
      {/* Top row: Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-150">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <button
            onClick={() => { playClickSound(); onSelectTab('hq_overview'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold border border-sky-200/70 transition-all active:scale-95 shadow-xs"
            id="btn-nav-breadcrumb-hq"
          >
            <Map className="w-3.5 h-3.5 text-sky-600" />
            <span>แผนที่ผจญภัย</span>
          </button>
          <span className="text-slate-300 font-bold">/</span>
          <span className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-black shadow-xs">
              ด่าน {currentZone.num} จาก 6
            </span>
            <span className="hidden sm:inline text-slate-800 font-black truncate max-w-xs">{currentZone.title}</span>
          </span>
        </div>

        {/* Prev / Next step buttons */}
        <div className="flex items-center gap-2">
          {prevZone ? (
            <button
              onClick={() => { playClickSound(); onSelectTab(prevZone.id); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all active:scale-95"
              id="btn-nav-prev-zone"
              title={`ไปด่านก่อนหน้า: ${prevZone.shortTitle}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ด่านก่อนหน้า</span>
            </button>
          ) : (
            <button
              onClick={() => { playClickSound(); onSelectTab('hq_overview'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all active:scale-95"
              id="btn-nav-return-hq"
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">กลับแผนที่</span>
            </button>
          )}

          {nextZone ? (
            <button
              onClick={() => { playClickSound(); onSelectTab(nextZone.id); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-500/25 transition-all active:scale-95"
              id="btn-nav-next-zone"
              title={`ไปด่านถัดไป: ${nextZone.shortTitle}`}
            >
              <span>ด่านถัดไป ({nextZone.num})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => { playClickSound(); onSelectTab('summary_cert'); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/25 transition-all active:scale-95"
              id="btn-nav-go-cert"
            >
              <span>📜 ไปรับเกียรติบัตร</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Step Selector Chips (1 to 6) */}
      <div className="pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs text-slate-500 font-bold whitespace-nowrap mr-1 hidden md:inline">
          เลือกด่าน:
        </span>
        {zones.map((z) => {
          const isActive = z.id === currentTab;
          const isPast = z.num < currentZone.num;
          return (
            <button
              key={z.id}
              onClick={() => { playClickSound(); onSelectTab(z.id); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-300'
                  : isPast
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-800 hover:bg-slate-100'
              }`}
              id={`btn-step-chip-${z.num}`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                isActive 
                  ? 'bg-white text-blue-600' 
                  : isPast 
                  ? 'bg-emerald-200 text-emerald-800' 
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {z.num}
              </span>
              <span>{z.shortTitle.replace(/^\d+\.\s*/, '')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

