const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

const DB_FILE = "proofs.json";

function saveProof(proof) {
  let data = [];
  if (fs.existsSync(DB_FILE)) {
    data = JSON.parse(fs.readFileSync(DB_FILE));
  }
  data.push(proof);
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}
app.get("/", (req, res) => {
  res.send("VerifyReal backend is running");
});
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/upload", upload.single("file"), (req, res) => {
  const file = fs.readFileSync(req.file.path);

  const hash = crypto.createHash("sha256").update(file).digest("hex");

  const proof = {
    proofId: "vr_" + Date.now(),
    hash,
    createdAt: new Date().toISOString(),
    filename: req.file.originalname
  };

  saveProof(proof);

  res.json(proof);
});

app.get("/proof/:id", (req, res) => {
  if (!fs.existsSync(DB_FILE)) return res.json({ error: "Not found" });

  const data = JSON.parse(fs.readFileSync(DB_FILE));
  const proof = data.find(p => p.proofId === req.params.id);

  if (!proof) return res.json({ error: "Not found" });

  res.json(proof);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
