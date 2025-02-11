import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useState, memo } from "react";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

// 受付用の関数宣言
const postReception: FunctionDeclaration = {
  name: "post_reception",
  description: "席の予約を行います",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      name: {
        type: SchemaType.STRING,
        description: "お客様の名前",
      },
      number: {
        type: SchemaType.NUMBER,
        description: "予約人数",
      },
    },
    required: ["name", "number"],
  },
};

function ReceptionistComponent() {
  const { client, setConfig } = useLiveAPIContext();
  // 予約が確定した結果（APIから返されたデータ）を保持
  const [reservationData, setReservationData] = useState<string | null>(null);
  // ユーザー入力の予約内容を保持（最終確認待ち）
  const [pendingReservation, setPendingReservation] = useState<{ name: string; number: number } | null>(null);
  // 対応する functionCall の情報を保持（toolResponse の返信に必要）
  const [pendingFc, setPendingFc] = useState<{ id: string } | null>(null);

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
            text: "あなたは受付係です。自分から話し始めてください。こちらから、『いらっしゃいませ、お客様何名でしょうか？』とお伺いしてください。お客様から名前と人数を聞いたら、必ず`post_reception` 関数を使用して予約内容を取得し、最終確認の上、予約登録を行ってください。お客様の人数の数字は日本語読みしてください。いち、に、さん、よん・・・",
          },
        ],
      },
      tools: [{ functionDeclarations: [postReception] }],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = async (toolCall: ToolCall) => {
      console.log("ツール呼び出しを受信:", toolCall);

      const fc = toolCall.functionCalls.find((fc) => fc.name === postReception.name);
      if (fc) {
        const { name, number } = fc.args as any;
        console.log("取得したお客様情報:", name, number);
        // まずは予約情報を pending 状態として保持し、確認画面を表示
        setPendingReservation({ name, number });
        setPendingFc({ id: fc.id });
        // AI の音声で確認メッセージを発声
        client.sendToolResponse({
          functionResponses: [
            {
              response: {
                output: `予約内容確認: お名前は ${name} さん、予約人数は ${number} 名です。こちらの内容でよろしいでしょうか？`,
              },
              id: fc.id,
            },
          ],
        });
      } else {
        console.warn("対応する functionCall が見つかりませんでした:", toolCall);
      }
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  // ユーザーが「はい、予約する」ボタンを押したときの処理
  const confirmReservation = async () => {
    if (!pendingReservation || !pendingFc) return;
    try {
      console.log("予約登録API呼び出し開始...");
      const response = await fetch(
        `${API_BASE_URL}/api/post-reception`,  // 環境変数からURLを取得
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pendingReservation),
        }
      );

      console.log("レスポンスステータス:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("取得した予約データ:", data);
      const reservation = JSON.stringify(data, null, 2);
      console.log("整形された予約データ:", reservation);

      setReservationData(reservation);
      // 予約が確定したので、もともとの functionCall に対してツールレスポンスを送信
      client.sendToolResponse({
        functionResponses: [
          {
            response: { output: reservation },
            id: pendingFc.id,
          },
        ],
      });
    } catch (error) {
      console.error("予約の登録に失敗しました:", error);
      setReservationData(null);
      client.sendToolResponse({
        functionResponses: [
          {
            response: { output: "予約の登録に失敗しました。" },
            id: pendingFc.id,
          },
        ],
      });
    } finally {
      // 確認待ち状態をクリア
      setPendingReservation(null);
      setPendingFc(null);
    }
  };

  // キャンセル時の処理
  const cancelReservation = () => {
    if (pendingFc) {
      client.sendToolResponse({
        functionResponses: [
          {
            response: { output: "予約登録をキャンセルしました。" },
            id: pendingFc.id,
          },
        ],
      });
    }
    setPendingReservation(null);
    setPendingFc(null);
  };

  return (
    <div>
      {pendingReservation && (
        <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <h3>予約内容の確認</h3>
          <p>
            <strong>お名前:</strong> {pendingReservation.name}
          </p>
          <p>
            <strong>予約人数:</strong> {pendingReservation.number}
          </p>
          <p>この内容で予約登録いたします。よろしいでしょうか？</p>
          <button onClick={confirmReservation}>はい、予約する</button>
          <button onClick={cancelReservation} style={{ marginLeft: "1rem" }}>
            キャンセル
          </button>
        </div>
      )}
      {reservationData ? (
        <>
          {(() => {
            try {
              const parsedData = JSON.parse(reservationData);
              return (
                <table style={{ width: "100%" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "30%", fontWeight: "bold" }}>お名前:</td>
                      <td style={{ width: "70%" }}>{parsedData.name}</td>
                    </tr>
                    <tr>
                      <td style={{ width: "30%", fontWeight: "bold" }}>予約人数:</td>
                      <td style={{ width: "70%" }}>{parsedData.number}</td>
                    </tr>
                    {parsedData.confirmation && (
                      <tr>
                        <td style={{ width: "30%", fontWeight: "bold" }}>確認番号:</td>
                        <td style={{ width: "70%" }}>{parsedData.confirmation}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              );
            } catch (e) {
              return <p>予約情報: {reservationData}</p>;
            }
          })()}
        </>
      ) : (
        <p>お名前とご予約人数を教えてください！</p>
      )}
    </div>
  );
}

export const Receptionist = memo(ReceptionistComponent);
