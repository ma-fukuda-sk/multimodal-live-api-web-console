// import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
// import { useEffect, useState, memo } from "react";
// import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
// import { ToolCall } from "../../multimodal-live-types";

// // 関数宣言
// const getRecipe: FunctionDeclaration = {
//   name: "get_recipe",
//   description: "料理のレシピを取得します。",
//   parameters: {
//     type: SchemaType.OBJECT,
//     properties: {
//       dish_name: {
//         type: SchemaType.STRING,
//         description: "レシピを知りたい料理名",
//       },
//     },
//     required: ["dish_name"],
//   },
// };

// function KitchenTrainerComponent() {
//   const { client, setConfig } = useLiveAPIContext();
//   const [recipeData, setRecipeData] = useState<string | null>(null);

//   useEffect(() => {
//     setConfig({
//       model: "models/gemini-2.0-flash-exp",
//       generationConfig: {
//         responseModalities: "audio",
//         speechConfig: {
//           voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
//         },
//       },
//       systemInstruction: {
//         parts: [
//           {
//             text: "あなたは料理の専門家です。質問には必ず`get_recipe` 関数を使ってレシピを取得して回答してください。",
//           },
//         ],
//       },
//       tools: [{ functionDeclarations: [getRecipe] }],
//     });
//   }, [setConfig]);

//   useEffect(() => {
//     const onToolCall = async (toolCall: ToolCall) => {
//       console.log("ツール呼び出しを受信:", toolCall);

//       const fc = toolCall.functionCalls.find((fc) => fc.name === getRecipe.name);
//       if (fc) {
//         const dishName = (fc.args as any).dish_name;
//         console.log("取得した料理名:", dishName);

//         try {
//           console.log("リクエスト送信開始...");
//           const response = await fetch("https://stunning-doodle-9r9wrppp474hx77g-5000.app.github.dev/api/get-recipe", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ dish_name: dishName }),
//           });

//           console.log("レスポンスステータス:", response.status);

//           if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//           }

//           const data = await response.json();
//           console.log("取得したデータ:", data);

//           const recipe = JSON.stringify(data, null, 2);
//           console.log("整形されたレシピデータ:", recipe);

//           setRecipeData(recipe);

//           client.sendToolResponse({
//             functionResponses: [
//               {
//                 response: { output: recipe },
//                 id: fc.id,
//               },
//             ],
//           });
//         } catch (error) {
//           console.error("レシピの取得に失敗しました:", error);
//           setRecipeData(null);
//           client.sendToolResponse({
//             functionResponses: [
//               {
//                 response: { output: "レシピの取得に失敗しました。" },
//                 id: fc.id,
//               },
//             ],
//           });
//         }
//       } else {
//         console.warn("対応するfunctionCallが見つかりませんでした:", toolCall);
//       }
//     };

//     client.on("toolcall", onToolCall);
//     return () => {
//       client.off("toolcall", onToolCall);
//     };
//   }, [client]);

//   return (
//     <div>
//     {recipeData ? (
//       <>
//         {/* JSON.parse(recipeData)?.results?.length > 0 でチェック */}
//         {JSON.parse(recipeData)?.results?.length > 0 ? ( 
//           <table style={{ width: "100%" }}>
//             <tbody>
//               <tr>
//                 <td style={{ width: "20%", fontWeight: "bold" }}>メニュー名:</td>
//                 <td style={{ width: "80%" }}>
//                   {/* オプショナルチェーンを追加 */}
//                   {JSON.parse(recipeData)?.results[0]?.document?.structData?.Title} 
//                 </td>
//               </tr>
//               <tr>
//                 <td style={{ width: "20%", fontWeight: "bold", verticalAlign: "top" }}>品目量:</td>
//                 <td style={{ width: "80%", whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
//                   {/* オプショナルチェーンを追加 */}
//                   {JSON.parse(recipeData)?.results[0]?.document?.structData?.Item_Quantity}
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         ) : (
//           <p>レシピが見つかりませんでした。</p>
//         )}
//         <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>{recipeData}</pre>
//       </>
//     ) : (
//       <p>レシピを読み込んでいます...</p>
//     )}
//   </div>
//   );
// }

// export const KitchenTrainer = memo(KitchenTrainerComponent);

import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useState, memo } from "react";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

// 関数宣言
const getRecipe: FunctionDeclaration = {
  name: "get_recipe",
  description: "料理のレシピを取得します。",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      dish_name: {
        type: SchemaType.STRING,
        description: "レシピを知りたい料理名",
      },
    },
    required: ["dish_name"],
  },
};

function KitchenTrainerComponent() {
  const { client, setConfig } = useLiveAPIContext();
  const [recipeData, setRecipeData] = useState<string | null>(null);

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          // voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: "あなたは料理の専門家です。質問には必ず`get_recipe` 関数を使ってレシピを取得して回答してください。",
          },
        ],
      },
      tools: [{ functionDeclarations: [getRecipe] }],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = async (toolCall: ToolCall) => {
      console.log("ツール呼び出しを受信:", toolCall);

      const fc = toolCall.functionCalls.find((fc) => fc.name === getRecipe.name);
      if (fc) {
        const dishName = (fc.args as any).dish_name;
        console.log("取得した料理名:", dishName);

        try {
          console.log("リクエスト送信開始...");
          const response = await fetch(
            "https://stunning-doodle-9r9wrppp474hx77g-5000.app.github.dev/api/get-recipe",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ dish_name: dishName }),
            }
          );

          console.log("レスポンスステータス:", response.status);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log("取得したデータ:", data);

          const recipe = JSON.stringify(data, null, 2);
          console.log("整形されたレシピデータ:", recipe);

          setRecipeData(recipe);

          client.sendToolResponse({
            functionResponses: [
              {
                response: { output: recipe },
                id: fc.id,
              },
            ],
          });
        } catch (error) {
          console.error("レシピの取得に失敗しました:", error);
          setRecipeData(null);
          client.sendToolResponse({
            functionResponses: [
              {
                response: { output: "レシピの取得に失敗しました。" },
                id: fc.id,
              },
            ],
          });
        }
      } else {
        console.warn("対応するfunctionCallが見つかりませんでした:", toolCall);
      }
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  return (
    <div>
    {recipeData ? (
      <>
        {/* JSON 内で必要な情報を取得するため、context.results をチェック */}
        {JSON.parse(recipeData)?.context?.results?.length > 0 ? (
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td style={{ width: "20%", fontWeight: "bold" }}>メニュー名:</td>
                <td style={{ width: "80%" }}>
                  {
                    JSON.parse(recipeData)?.context?.results[0]?.document
                      ?.structData?.Title
                  }
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: "20%",
                    fontWeight: "bold",
                    verticalAlign: "top",
                  }}
                >
                  品目量:
                </td>
                <td
                  style={{
                    width: "80%",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                  }}
                >
                  {
                    JSON.parse(recipeData)?.context?.results[0]?.document
                      ?.structData?.Item_Quantity
                  }
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    width: "20%",
                    fontWeight: "bold",
                    verticalAlign: "top",
                  }}
                >
                  作り方:
                </td>
                <td
                  style={{
                    width: "80%",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                  }}
                >
                  {JSON.parse(recipeData)?.answer}
                </td>
              </tr>
              {/* 画像表示用の行を追加 */}
              <tr>
                <td style={{ width: "20%", fontWeight: "bold" }}>メニュー画像:</td>
                <td style={{ width: "80%" }}>
                  {/* IDを取得してURL生成 */}
                  <img
                    src={`https://storage.cloud.google.com/manual_images/${
                      JSON.parse(recipeData)?.context?.results[0]?.document
                        ?.structData?.ID
                    }.jpeg`}
                    alt="メニュー画像"
                    style={{ maxWidth: "300px", height: "auto", border: "1px solid #ccc" }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>レシピが見つかりませんでした。</p>
        )}
      </>
    ) : (
      <p>分からないレシピがあったら話しかけてくださいね！</p>
    )}
  </div>
  );
}

export const KitchenTrainer = memo(KitchenTrainerComponent);
