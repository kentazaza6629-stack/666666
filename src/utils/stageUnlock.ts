import { TabType, DetectiveProfile } from '../types';

export const isStageUnlocked = (tab: TabType, profile?: DetectiveProfile): boolean => {
  if (tab === 'teacher_portal') {
    return profile?.authUser?.role === 'teacher';
  }
  return true;
};

export const getStageName = (tab: TabType): string => {
  switch (tab) {
    case 'teacher_portal': return 'ระบบสารสนเทศสำหรับครูผู้สอน (Teacher Only)';
    case 'zone1_basics': return 'ด่าน 1: ทำความรู้จักการสืบค้น';
    case 'zone2_spells': return 'ด่าน 2: แหล่งข้อมูล & คาถาสืบค้น';
    case 'zone3_trust': return 'ด่าน 3: เทคนิคสืบค้น & ประเมินความน่าเชื่อถือ';
    case 'zone4_cases': return 'ด่าน 4: แฟ้มคดีปริศนาข้อมูลลับ';
    case 'zone5_sandbox': return 'ด่าน 5: จำลองสืบค้น & ผู้ช่วยสารวัตร AI';
    case 'zone6_exam': return 'ด่าน 6: ภารกิจสุดท้าย นักสืบค้นข้อมูลมือโปร';
    case 'boss_battle': return 'ศึกบอสใหญ่: จอมวายร้ายดาร์กบัก';
    default: return 'ด่านเรียนรู้';
  }
};
