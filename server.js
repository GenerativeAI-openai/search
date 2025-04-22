const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 환경변수에서 JSON 문자열을 읽고 줄바꿈 복원
const raw = process.env.FIREBASE_KEY_JSON;
const serviceAccount = JSON.parse(raw);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// 글 저장 API
app.post("/submitPost", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "내용을 입력해주세요." });
  }

  try {
    await db.collection("posts").add({
      text,
      timestamp: Date.now()
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("🔥 Firestore 저장 실패:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// 상태 확인용
app.get("/", (req, res) => {
  res.send("✅ Render 백엔드 서버가 정상 작동 중입니다.");
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
