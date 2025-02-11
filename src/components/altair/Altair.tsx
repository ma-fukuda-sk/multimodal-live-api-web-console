/**
 * Copyright 2024 Google LLC
 *
 * Apache License, Version 2.0 ("ライセンス") に基づきライセンスされています。
 * このファイルを使用する場合は、ライセンスに従わなければなりません。
 * ライセンスのコピーは以下から入手できます:
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * 適用される法律または書面による同意がない限り、このソフトウェアは
 * "現状有姿"で提供され、明示的または黙示的な保証を伴いません。
 * ライセンスに基づく権利および制限については、ライセンスを参照してください。
 */
import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

const declaration: FunctionDeclaration = {
  name: "render_altair",
  description: "Altair グラフを JSON 形式で表示します。",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      json_graph: {
        type: SchemaType.STRING,
        description:
          "レンダリングするグラフの JSON 文字列表現。JSON オブジェクトではなく、文字列である必要があります。",
      },
    },
    required: ["json_graph"],
  },
};

function AltairComponent() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig } = useLiveAPIContext();

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: 'あなたは私の役に立つアシスタントです。グラフを作成するよう依頼された場合は、提供された "render_altair" 関数を使用してください。追加情報を求めず、最善の判断で作成してください。',
          },
        ],
      },
      tools: [
        // 無料枠のクォータがある検索ツール
        { googleSearch: {} },
        { functionDeclarations: [declaration] },
      ],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      console.log(`ツール呼び出しを受信`, toolCall);
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name,
      );
      if (fc) {
        const str = (fc.args as any).json_graph;
        setJSONString(str);
      }
      // ツール呼び出しのレスポンスデータを送信
      // この場合、成功したことを示す
      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls.map((fc) => ({
                response: { output: { success: true } },
                id: fc.id,
              })),
            }),
          200,
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      vegaEmbed(embedRef.current, JSON.parse(jsonString));
    }
  }, [embedRef, jsonString]);
  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);
