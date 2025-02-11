const express = require("express");
const cors = require("cors");

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();

// CORS設定
app.use(cors({
  origin: "https://multimodal-live-api-web-console-wheat.vercel.app", // 許可するオリジン
  methods: ["GET", "POST", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"], 
}));

app.use(express.json());

// `/api/get-recipe`エンドポイント
app.post("/api/get-recipe", async (req, res) => {
  const { dish_name } = req.body;

  if (!dish_name) {
    return res.status(400).json({ error: "dish_name is required" });
  }

  try {
    const response = await fetch(
      "https://menu-search-api-945363991313.asia-northeast1.run.app/search",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "x-api-key": process.env.API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: dish_name }),
      }
    );

    if (!response.ok) {
      throw new Error(`Cloud Run API request failed with status ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error calling Cloud Run API:", error);
    res.status(500).json({ error: "Failed to fetch data from Cloud Run API" });
  }
});

// `/api/post-reception`エンドポイントの追加
app.post("/api/post-reception", async (req, res) => {
  const { name, number } = req.body;

  if (!name || number == null) {
    return res.status(400).json({ error: "name と number は必須です" });
  }

  try {
    console.log(`Received reservation: 名前=${name}, 人数=${number}`);
    res.status(200).json({ name, number });
  } catch (error) {
    console.error("Error during reservation processing:", error);
    res.status(500).json({ error: "予約処理に失敗しました" });
  }
});

// `Vercel` のサーバーレス関数としてエクスポート
module.exports = app;
