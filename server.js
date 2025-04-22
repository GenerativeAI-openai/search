const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 환경변수에 저장된 Firebase 서비스 계정 키(JSON)를 파싱
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

// Firebase Admin SDK 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// 글 저장 엔드포인트
app.post("/submitPost", async (req, res) => {
  const { text } = req.body;

  // 유효성 검사
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "내용을 입력해주세요." });
  }

  try {
    await db.collection("posts").add({
      text,
      timestamp: Date.now()
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("🔥 Firestore 저장 실패:", error);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// 상태 확인용 루트 페이지
app.get("/", (req, res) => {
  res.send("✅ Render 백엔드 서버가 정상 작동 중입니다.");
});

// 포트 설정
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
