const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.applicationDefault(), // Render 환경 변수로 서비스 키 설정 필요
});
const db = admin.firestore();

app.post("/submitPost", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "내용을 입력하세요." });

  try {
    await db.collection("posts").add({
      text,
      timestamp: Date.now(),
    });
    res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "서버 오류 발생" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ 서버 작동 중");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중`);
});
