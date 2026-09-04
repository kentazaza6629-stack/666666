import React, { useState, useEffect } from 'react';
import { DetectiveProfile, TabType } from '../../types';
import { FileText, GraduationCap, ShieldCheck, Clock } from 'lucide-react';
import { playClickSound } from '../../utils/sound';
import { CommunityHomework } from './CommunityHomework';
import { CommunityTeacherChat } from './CommunityTeacherChat';

import { dataService } from '../../lib/dataService';
import { orderBy, where } from 'firebase/firestore';

interface CommunityTeacherHubProps {
  profile: DetectiveProfile;
  onUpdateProfile: (updated: Partial<DetectiveProfile>) => void;
  onShowToast: (title: string, message: string, type?: 'exp' | 'badge') => void;
  onNavigateTab: (tab: TabType) => void;
}

export const CommunityTeacherHub: React.FC<CommunityTeacherHubProps> = ({
  profile,
  onUpdateProfile,
  onShowToast,
  onNavigateTab
}) => {
  const [hubTab, setHubTab] = useState<'homework' | 'chat'>('homework');
  const [chatInitialQuery, setChatInitialQuery] = useState<string | undefined>(undefined);
  const [assignmentCount, setAssignmentCount] = useState<number>(3);
  const [waitingChatCount, setWaitingChatCount] = useState<number>(0);

  // Sync assignment and chat counts from Firestore
  useEffect(() => {
    // Listen for assignments count
    const unsubAssignments = dataService.subscribeCollection(
      'assignments',
      [],
      (data) => {
        setAssignmentCount((data || []).length);
      }
    );

    // Listen for waiting chat messages
    const unsubChat = dataService.subscribeCollection(
      'teacher_chat',
      [where('sender', '==', 'student'), where('status', '==', 'waiting_teacher')],
      (data) => {
        setWaitingChatCount((data || []).length);
      }
    );

    return () => {
      unsubAssignments();
      unsubChat();
    };
  }, []);

  const handleAskTeacher = (assignmentTitle: string) => {
    setChatInitialQuery(`คุณครูครับ มีคำถามเกี่ยวกับ "${assignmentTitle}" ครับ`);
    setHubTab('chat');
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Combined Hub Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-4 sm:p-5 text-white shadow-lg border border-emerald-400/30 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner shrink-0 border border-white/30">
              👩‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">ห้องเรียนคุณครู</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>งานที่ครูเพิ่ม & ครูจริงตอบเท่านั้น</span>
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                ส่งงานเฉพาะใบงานที่คุณครูมอบหมาย และปรึกษาคำถามการเรียนกับคุณครูผู้สอนตัวจริง
              </p>
            </div>
          </div>

          {/* Sub-Switch Buttons (Inside the same view) */}
          <div className="flex items-center bg-black/20 p-1 rounded-2xl border border-white/20 self-stretch sm:self-auto shrink-0">
            <button
              onClick={() => {
                playClickSound();
                setHubTab('homework');
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                hubTab === 'homework'
                  ? 'bg-white text-emerald-800 shadow-md font-black'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ช่องส่งงาน</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                hubTab === 'homework' ? 'bg-amber-100 text-amber-900' : 'bg-white/20 text-white'
              }`}>
                {assignmentCount} งาน
              </span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setHubTab('chat');
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                hubTab === 'chat'
                  ? 'bg-white text-emerald-800 shadow-md font-black'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <div className="relative">
                <GraduationCap className="w-3.5 h-3.5" />
                {waitingChatCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                )}
              </div>
              <span>คุยกับคุณครู</span>
              {waitingChatCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  {waitingChatCount} รอครูตอบ
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RENDER ACTIVE SUB-SECTION */}
      {hubTab === 'homework' ? (
        <CommunityHomework
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          onShowToast={onShowToast}
          onNavigateTab={onNavigateTab}
          onAskTeacherAboutHomework={handleAskTeacher}
        />
      ) : (
        <CommunityTeacherChat
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          onShowToast={onShowToast}
          initialQuery={chatInitialQuery}
          onOpenHomework={() => setHubTab('homework')}
        />
      )}
    </div>
  );
};
