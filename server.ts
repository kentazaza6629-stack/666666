import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Configure multer for saving uploaded video to public/lesson.mp4
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const pubDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(pubDir)) {
      fs.mkdirSync(pubDir, { recursive: true });
    }
    cb(null, pubDir);
  },
  filename: (_req, _file, cb) => {
    cb(null, "lesson.mp4");
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 * 1024 }, // up to 300MB
});

// Initialize Gemini client lazily
let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "InfoQuest Detective Server" });
});

// Upload and set lesson video
app.post("/api/upload-video", upload.single("video"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "กรุณาแนบไฟล์วิดีโอ" });
    }

    const publicPath = path.join(process.cwd(), "public", "lesson.mp4");
    const distPath = path.join(process.cwd(), "dist", "lesson.mp4");

    // Sync to dist folder as well if dist exists
    if (fs.existsSync(path.join(process.cwd(), "dist"))) {
      try {
        fs.copyFileSync(publicPath, distPath);
      } catch (copyErr) {
        console.warn("Could not copy to dist:", copyErr);
      }
    }

    const timestamp = Date.now();
    return res.json({
      success: true,
      message: "อัปโหลดและเปลี่ยนวิดีโอบทเรียนสำเร็จเรียบร้อยแล้ว!",
      videoUrl: `/lesson.mp4?v=${timestamp}`,
      size: req.file.size,
    });
  } catch (err: any) {
    console.error("Video upload error:", err);
    return res.status(500).json({ success: false, error: err?.message || "เกิดข้อผิดพลาดในการบันทึกวิดีโอ" });
  }
});

// AI Detective Assistant Endpoint
app.post("/api/detective-ai", async (req, res) => {
  try {
    const { message, context, detectiveName } = req.body;

    const name = detectiveName || "นักสืบจิ๋ว";
    const systemInstruction = `
คุณคือ "สารวัตรไบต์" (Inspector Byte) หุ่นยนต์นักสืบและครูผู้ช่วยสอนวิชาวิทยาการคำนวณ ระดับชั้นประถมศึกษาปีที่ 5 (ป.5) ในแอปพลิเคชัน "InfoQuest ป.5 – นักสืบข้อมูลจิ๋ว"

บุคลิกและหน้าที่ของคุณ:
1. พูดจาสุภาพ อ่อนโยน สนุกสนาน ตื่นเต้น ใช้สรรพนามเรียกเด็กว่า "นักสืบ ${name}" หรือ "นักสืบจิ๋ว" และแทนตัวเองว่า "สารวัตรไบต์"
2. สอนเรื่อง: หน่วยการเรียนรู้ที่ 3 ข้อมูลสารสนเทศ (วิทยาการคำนวณ ป.5)
   - การสืบค้นข้อมูลด้วยคำสำคัญ (Keyword) ที่ตรงประเด็น
   - เทคนิคตัวดำเนินการค้นหา เช่น เครื่องหมายคำพูด "..." (ค้นหาตรงตัว), เครื่องหมายลบ - (ตัดคำไม่ต้องการ), AND (+), OR, site: (ระบุโดเมน เช่น site:.go.th, site:.ac.th), filetype: (ระบุชนิดไฟล์ เช่น filetype:pdf)
   - การประเมินความน่าเชื่อถือของข้อมูล (ผู้แต่ง, วันที่, แหล่งที่มา, ข้อเท็จจริง vs ข้อคิดเห็น)
   - ความหมายของโดเมนเนม (.go.th ภาครัฐ, .ac.th การศึกษา, .or.th องค์กรไม่แสวงกำไร, .co.th บริษัทธุรกิจ)
3. ให้คำแนะนำ ช่วยใบ้คำค้นหา และสร้างแรงบันดาลใจ ตอบกระชับ เข้าใจง่าย มีตัวอย่างประกอบ เหมาะกับเด็ก ป.5 ไม่วิชาการจนน่าเบื่อ
4. หากนักเรียนถามนอกเรื่อง ให้ตอบสั้นๆ และชวนกลับมาทำภารกิจสืบข้อมูลอย่างเป็นมิตร
`;

    const client = getGeminiClient();

    if (!client) {
      // High-quality smart offline fallback
      const smartFallback = getSmartFallbackResponse(message, name);
      return res.json({ response: smartFallback, isFallback: true });
    }

    const promptText = `
บริบทปัจจุบันของนักเรียน: ${context || "หน้าสำนักงานสืบสวน"}
คำถาม/ข้อความจากนักสืบ ${name}: "${message}"

กรุณาตอบคำถามในฐานะสารวัตรไบต์อย่างสนุกสนานและให้ความรู้:
`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "สารวัตรไบต์ได้รับสัญญาณแล้ว! ลองใช้คำสำคัญ (Keyword) ที่เจาะจงดูนะ!";
    res.json({ response: replyText, isFallback: false });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Provide fallback gracefully
    const fallbackText = `สารวัตรไบต์ขอแนะนำ: สำหรับการสืบค้นข้อมูลที่มีประสิทธิภาพ ให้เลือกคำสำคัญ (Keyword) สั้น กระชับ ตรงประเด็น และอย่าลืมตรวจสอบแหล่งที่มาที่เป็น .go.th หรือ .ac.th ด้วยนะ!`;
    res.json({ response: fallbackText, isFallback: true, error: error.message });
  }
});

// Search Query Evaluator Endpoint
app.post("/api/evaluate-query", async (req, res) => {
  try {
    const { query, missionGoal } = req.body;
    const client = getGeminiClient();

    if (!client) {
      return res.json(evaluateQueryLocally(query, missionGoal));
    }

    const prompt = `
ในฐานะผู้เชี่ยวชาญการสอนค้นหาข้อมูล ป.5:
ภารกิจที่ต้องค้นหา: "${missionGoal}"
คำค้นหา (Query) ที่นักเรียนพิมพ์: "${query}"

ให้ประเมินคำค้นหานี้ในรูปแบบ JSON:
{
  "score": ตัวเลขคะแนน 1-10,
  "verdict": "ยอดเยี่ยม" | "พอใช้ได้" | "ต้องปรับปรุง",
  "feedback": "คำแนะนำสั้นๆ สไตล์นักสืบ",
  "recommendedKeywords": ["คำค้นหาที่ดีกว่า 1", "คำค้นหาที่ดีกว่า 2"],
  "operatorsUsed": ["เครื่องหมายที่ตรวจพบ เช่น \"\", -, site:, filetype:"]
}
`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err) {
    res.json(evaluateQueryLocally(req.body.query, req.body.missionGoal));
  }
});

// Fallback logic helpers
function getSmartFallbackResponse(message: string, name: string): string {
  const msg = (message || "").toLowerCase();
  if (msg.includes("สวัสดี") || msg.includes("หวัดดี") || msg.includes("hello")) {
    return `สวัสดีครับนักสืบ ${name}! 🔍 สารวัตรไบต์ยินดีต้อนรับสู่ศูนย์บัญชาการ InfoQuest พร้อมจะออกล่าเบาะแสข้อมูลหรือยัง? มีอะไรให้สารวัตรช่วยถามได้เลยนะ!`;
  }
  if (msg.includes("คำสำคัญ") || msg.includes("keyword") || msg.includes("คีย์เวิร์ด")) {
    return `💡 **เคล็ดลับคำสำคัญ (Keyword) โดยสารวัตรไบต์:**\n1. ตัดคำฟุ่มเฟือยออก เช่น "อยากรู้ว่า", "ทำไม", "ที่ไหน"\n2. ใช้คำเจาะจง เช่น แทนที่จะค้น "สัตว์" ให้ค้น "สมเสร็จ สัตว์ป่าสงวน"\n3. ใช้คำภาษาไทยหรืออังกฤษที่ตรงกับหัวข้อครับ!`;
  }
  if (msg.includes("เครื่องหมาย") || msg.includes("operator") || msg.includes("สูตร") || msg.includes("คำพูด")) {
    return `🔮 **คาถาสืบค้นลับของยอดนักสืบ:**\n- \`"คำค้น"\` = ค้นหาคำนั้นแบบติดกันเป๊ะๆ\n- \`-คำ\` = ตัดผลลัพธ์ที่มีคำนี้ทิ้ง\n- \`site:.go.th\` = ค้นเฉพาะเว็บราชการที่น่าเชื่อถือ\n- \`filetype:pdf\` = ค้นหาเอกสาร PDF สมบูรณ์แบบ!`;
  }
  if (msg.includes("น่าเชื่อถือ") || msg.includes("จริงไหม") || msg.includes("fake") || msg.includes("ปลอม")) {
    return `🛡️ **เกราะป้องกันข่าวปลอม (4 เช็กฉบับนักสืบ):**\n1. **ใครเขียน?** มีชื่อผู้เชี่ยวชาญไหม\n2. **เมื่อไหร่?** ข้อมูลอัปเดตไหม\n3. **เว็บอะไร?** โดเมน .go.th หรือ .ac.th มีความน่าเชื่อถือสูงมาก\n4. **เทียบ 3 แหล่ง!** อย่าเชื่อข้อมูลจากเว็บเดียวเด็ดขาดครับ!`;
  }
  return `ยอดเยี่ยมมากนักสืบ ${name}! 🌟 การเป็นนักสืบข้อมูลที่ดี ต้องรู้จักคิดวิเคราะห์ ใช้คำค้นที่กระชับ และตรวจสอบความน่าเชื่อถือทุกครั้ง สารวัตรพร้อมลุยภารกิจไปพร้อมกับเธอแล้ว!`;
}

function evaluateQueryLocally(query: string = "", missionGoal: string = "") {
  let score = 6;
  const operators: string[] = [];
  if (query.includes('"')) {
    score += 2;
    operators.push('เครื่องหมายคำพูด ("...")');
  }
  if (query.includes("site:")) {
    score += 2;
    operators.push("site: (ระบุโดเมน)");
  }
  if (query.includes("filetype:")) {
    score += 1;
    operators.push("filetype: (ระบุไฟล์)");
  }
  if (query.includes("-")) {
    score += 1;
    operators.push("เครื่องหมายลบ (-)");
  }
  if (query.length > 2 && query.length < 35) {
    score = Math.min(10, score + 1);
  }

  score = Math.min(10, Math.max(4, score));

  return {
    score,
    verdict: score >= 8 ? "ยอดเยี่ยม" : score >= 6 ? "พอใช้ได้" : "ต้องปรับปรุง",
    feedback: score >= 8
      ? "คำค้นหานี้กระชับ เจาะจง และใช้เทคนิคสืบค้นได้อย่างเฉียบคม!"
      : "ลองใช้คำสำคัญที่เฉพาะเจาะจงขึ้น หรือเพิ่มเทคนิคตัวดำเนินการ เช่น เครื่องหมายคำพูด หรือ site: นะครับ",
    recommendedKeywords: [
      `"${query.replace(/["-]/g, "").trim()}"`,
      `${query.trim()} site:.go.th`,
      `${query.trim()} filetype:pdf`,
    ],
    operatorsUsed: operators,
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`InfoQuest Detective server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
