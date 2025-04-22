const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 환경 변수에서 JSON 문자열 파싱 + 줄바꿈 복원
const raw = process.env.FIREBASE_KEY_JSON;
const serviceAccount = JSON.parse(raw);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// ✅ 게시글 등록 (제목 + 본문)
app.post("/submitPost", async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "제목과 내용을 모두 입력해주세요." });
  }

  try {
    await db.collection("posts").add({
      title,
      content,
      timestamp: Date.now()
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("🔥 Firestore 저장 실패:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});

// ✅ 글 목록 불러오기 (검색 또는 기본 출력용)
app.get("/posts", async (req, res) => {
  try {
    const snapshot = await db.collection("posts").orderBy("timestamp", "desc").get();
    const posts = snapshot.docs.map(doc => doc.data());
    res.status(200).json(posts);
  } catch (err) {
    console.error("글 불러오기 실패:", err);
    res.status(500).json({ error: "글 불러오기 오류" });
  }
});

// ✅ 서버 상태 확인
app.get("/", (req, res) => {
  res.send("✅ Render 백엔드 서버 정상 작동 중");
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
