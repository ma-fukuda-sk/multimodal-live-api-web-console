// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// const app = express();

// // CORS設定
// app.use(cors({
//   origin: "https://stunning-doodle-9r9wrppp474hx77g-3000.app.github.dev", // 許可するオリジン
//   methods: ["GET", "POST", "OPTIONS"], // 許可するHTTPメソッド
//   allowedHeaders: ["Content-Type", "Authorization", "x-api-key"], // 許可するヘッダー
// }));

// // プリフライトリクエスト処理
// app.options("*", (req, res) => {
//   res.header("Access-Control-Allow-Origin", "https://stunning-doodle-9r9wrppp474hx77g-3000.app.github.dev");
//   res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");
//   res.sendStatus(200);
// });

// // JSONリクエストのパース
// app.use(express.json());

// // `/api/get-recipe`エンドポイント
// app.post("/api/get-recipe", async (req, res) => {
//   const { dish_name } = req.body;

//   if (!dish_name) {
//     return res.status(400).json({ error: "dish_name is required" });
//   }

//   try {
//     const response = await fetch(
//       "https://menu-search-api-945363991313.asia-northeast1.run.app/search",
//       {
//         method: "POST",
//         headers: {
//           accept: "application/json",
//           "x-api-key": "A9kLm4jN1PzW8X5qR2dM7uGp0yVcKt3ZBxHwEsQfYiOb6JvL4CnXr9TqP6U2Ss9N", // 環境変数からAPIキーを取得
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ query: dish_name }),
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`Cloud Run API request failed with status ${response.status}`);
//     }

//     const data = await response.json();
//     res.status(200).json(data);
//   } catch (error) {
//     console.error("Error calling Cloud Run API:", error);
//     res.status(500).json({ error: "Failed to fetch data from Cloud Run API" });
//   }
// });

// // サーバー起動
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });


const express = require("express");
const cors = require("cors");
require("dotenv").config();

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();

// CORS設定
app.use(cors({
  origin: "https://stunning-doodle-9r9wrppp474hx77g-3000.app.github.dev", // 許可するオリジン
  methods: ["GET", "POST", "OPTIONS"], // 許可するHTTPメソッド
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"], // 許可するヘッダー
}));

// プリフライトリクエスト処理
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://stunning-doodle-9r9wrppp474hx77g-3000.app.github.dev");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");
  res.sendStatus(200);
});

// JSONリクエストのパース
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
          "x-api-key": "A9kLm4jN1PzW8X5qR2dM7uGp0yVcKt3ZBxHwEsQfYiOb6JvL4CnXr9TqP6U2Ss9N", // 環境変数からAPIキーを取得
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

  // 入力チェック
  if (!name || number == null) {
    return res.status(400).json({ error: "name と number は必須です" });
  }

  try {
    // ここでデータベースへの登録処理を実施する（プレースホルダー）
    // 例: await db.insertReservation({ name, number });
    console.log(`Received reservation: 名前=${name}, 人数=${number}`);

    // 登録処理は省略し、受け取ったデータをそのままレスポンスで返す
    res.status(200).json({ name, number });
  } catch (error) {
    console.error("Error during reservation processing:", error);
    res.status(500).json({ error: "予約処理に失敗しました" });
  }
});

// サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
