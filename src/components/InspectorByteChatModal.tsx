import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  Search, 
  HelpCircle, 
  Lightbulb, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { playClickSound, playCorrectSound, playSearchSound } from '../utils/sound';

interface InspectorByteChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  time: string;
  suggestions?: string[];
}

export const InspectorByteChatModal: React.FC<InspectorByteChatModalProps> = ({
  isOpen,
  onClose,
  studentName,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `สวัสดีครับคุณนักสืบ ${studentName}! 🤖✨ ผมสารวัตรไบต์ AI ผู้ช่วยสืบค้นสารสนเทศประจำการ มีข้อสงสัยเรื่องการตั้งคีย์เวิร์ด คาถาตัวดำเนินการ หรืออยากได้คำใบ้ข้อสอบ ถามผมได้เลยครับ!`,
      time: 'ตอนนี้',
      suggestions: [
        '🔍 ช่วยแต่งคำค้นหา "สัตว์ป่าสงวน"',
        '✨ คาถา site:.go.th ใช้ทำอะไร?',
        '🛡️ วิธีจับผิดข่าวปลอม Fake News',
        '💡 ขอเทคนิคสอบให้ได้ 100% เต็ม',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = (userText: string) => {
    if (!userText.trim()) return;

    playClickSound();
    const newMsg: Message = {
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      let newSuggestions: string[] = [];

      const lower = userText.toLowerCase();

      if (lower.includes('สัตว์ป่า') || lower.includes('สมเสร็จ')) {
        reply = 'สำหรับการสืบข้อมูลสัตว์ป่าสงวน ผมแนะนำให้ใช้คำค้น: `"สัตว์ป่าสงวน" site:.go.th` ครับ! เพราะจะได้ข้อมูลทางการจากกรมอุทยานแห่งชาติ สัตว์ป่า และพันธุ์พืช ที่ถูกต้อง 100% เลยครับ 🌿🐾';
        newSuggestions = ['อยากรู้นามสกุล .go.th คืออะไร', 'เครื่องหมาย "" ทำงานยังไง'];
      } else if (lower.includes('site:') || lower.includes('go.th') || lower.includes('โดเมน')) {
        reply = 'คาถา `site:.go.th` หรือ `site:.ac.th` ใช้บังคับให้ Google ค้นหาเฉพาะเว็บไซต์ภาครัฐหรือสถาบันการศึกษาครับ ช่วยตัดเว็บปลอมหรือเว็บบอร์ดหลอกลวงทิ้งไปได้หมดจดเลยครับ! 🌐🛡️';
        newSuggestions = ['แล้ว filetype:pdf ล่ะ?', 'เครื่องหมายลบ - ใช้อย่างไร'];
      } else if (lower.includes('ข่าวปลอม') || lower.includes('fake') || lower.includes('ตรวจ')) {
        reply = 'หลักการตรวจข่าวปลอมง่ายๆ คือใช้หลัก 5W1H ครับ: ตรวจดูว่าใครเป็นคนเขียน (Who) มีหลักฐานหรือไม่ (What) เผยแพร่เมื่อไร (When) และอย่าลืมเทียบข้อมูลกับสำนักข่าวทางการอย่างน้อย 2-3 แหล่งนะครับ! 🔍';
        newSuggestions = ['ขอดูตัวอย่างคดีจริง', 'ไปสอบวัดระดับ'];
      } else if (lower.includes('สอบ') || lower.includes('ข้อสอบ') || lower.includes('คำใบ้')) {
        reply = 'เคล็ดลับพิชิตข้อสอบ ป.5 ให้ได้ 100%: จำไว้ว่าถ้าต้องการค้นหาคำเฉพาะที่ติดกันให้ใส่เครื่องหมายอัญประกาศ `"..."`, ถ้าจะตัดคำให้ใส่เครื่องหมายลบ `-`, และเว็บหน่วยงานรัฐจะลงท้ายด้วย `.go.th` เสมอครับ สู้ๆ นะครับ! 🎓⭐';
        newSuggestions = ['พาไปหน้าข้อสอบ', 'ขอบคุณมากครับ'];
      } else {
        reply = `ยอดเยี่ยมมากครับคุณนักสืบ ${studentName}! ในฐานะนักสืบดิจิทัล การเลือกคีย์เวิร์ดที่กระชับและใช้ตัวดำเนินการค้นหา เช่น เครื่องหมายอัญประกาศ "" หรือ site: จะช่วยให้เราพบความจริงได้รวดเร็วและแม่นยำที่สุดครับ! 🚀`;
        newSuggestions = ['อยากลองค้นหาใน Sandbox', 'เปิดสมุดบันทึก'];
      }

      setIsTyping(false);
      playCorrectSound();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: newSuggestions,
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/20 text-white flex flex-col h-[85vh] max-h-[620px] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-md shadow-cyan-500/30">
              <img
                src="/images/cute_robot_mascot_1788247457628.jpg"
                alt="Inspector Byte AI"
                className="w-full h-full object-cover rounded-[14px]"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">สารวัตรไบต์ AI</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                  ผู้ช่วยสืบค้น
                </span>
              </div>
              <p className="text-[11px] text-cyan-300">พร้อมให้คำแนะนำตลอด 24 ชม.</p>
            </div>
          </div>

          <button
            onClick={() => { playClickSound(); onClose(); }}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs'
                    : 'bg-slate-800/95 border border-cyan-500/30 text-slate-200 rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className="text-[10px] text-slate-400 block text-right mt-1.5 opacity-75">
                  {msg.time}
                </span>
              </div>

              {/* Suggestions */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                  {msg.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSendMessage(sug)}
                      className="px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-cyan-950 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 text-[11px] font-medium transition-all text-left"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-cyan-300 text-xs bg-slate-800/80 p-3 rounded-2xl border border-cyan-500/30 w-fit animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>สารวัตรไบต์กำลังวิเคราะห์ข้อมูล...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="พิมพ์คำถามหรือขอคำใบ้เรื่องการสืบค้นข้อมูล..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-cyan-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
