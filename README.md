# マルチモーダルライブ API - Webコンソール

このリポジトリは、WebSocket経由で[Multimodal Live API](<[https://ai.google.dev/gemini-api](https://ai.google.dev/api/multimodal-live)>) を使用するReactベースのスターターアプリです。ストリーミングオーディオ再生、マイク・ウェブカメラ・画面キャプチャなどのユーザーメディア録画、および開発を支援する統合ログビューのモジュールを提供します。

[![Multimodal Live API Demo](readme/thumbnail.png)](https://www.youtube.com/watch?v=J_q7JY1XxFE)

Watch the demo of the Multimodal Live API [here](https://www.youtube.com/watch?v=J_q7JY1XxFE).

## 利用方法

使用を開始するには、まず無料の [Gemini API キー](https://aistudio.google.com/apikey) を作成し、.env ファイルに追加します。その後、以下のコマンドを実行します。


```
$ npm install && npm start
```

このリポジトリの他のブランチには、いくつかのサンプルアプリケーションを用意しています。

- [demos/GenExplainer](https://github.com/google-gemini/multimodal-live-api-web-console/tree/demos/genexplainer)
- [demos/GenWeather](https://github.com/google-gemini/multimodal-live-api-web-console/tree/demos/genweather)
- [demos/GenList](https://github.com/google-gemini/multimodal-live-api-web-console/tree/demos/genlist)

## 例

以下は、Google検索のgroundingを使用し、[vega-embed](https://github.com/vega/vega-embed)を使ってグラフをレンダリングするアプリケーション全体の例です。


```typescript
import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";

export const declaration: FunctionDeclaration = {
  name: "render_altair",
  description: "Displays an altair graph in json format.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      json_graph: {
        type: SchemaType.STRING,
        description:
          "JSON STRING representation of the graph to render. Must be a string, not a json object",
      },
    },
    required: ["json_graph"],
  },
};

export function Altair() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig } = useLiveAPIContext();

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      systemInstruction: {
        parts: [
          {
            text: 'You are my helpful assistant. Any time I ask you for a graph call the "render_altair" function I have provided you. Dont ask for additional information just make your best judgement.',
          },
        ],
      },
      tools: [{ googleSearch: {} }, { functionDeclarations: [declaration] }],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      console.log(`got toolcall`, toolCall);
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name
      );
      if (fc) {
        const str = (fc.args as any).json_graph;
        setJSONString(str);
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
```

## 開発について

このプロジェクトは[Create React App](https://github.com/facebook/create-react-app)でブートストラップされています。 プロジェクトは以下で構成されています。


- WebSocketとフロントエンド間の通信を容易にするイベントエミッターWebSocketクライアント
- 音声入出力処理のための通信層
- アプリケーションの構築とログの表示を開始するためのボイラープレートビュー

## 利用可能なスクリプト

プロジェクトディレクトリでは、以下のコマンドを実行できます:

### `npm start`

開発モードでアプリを実行します\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

編集するとページがリロードされます。 
コンソールにlintエラーも表示されます。



### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

本番用のアプリを build フォルダにビルドします。 本番モードでReactを正しくバンドルし、ビルドを最適化して最高のパフォーマンスを実現します。

ビルドは縮小され、ファイル名にはハッシュが含まれます。 アプリをデプロイする準備ができました。

詳細については、[デプロイメント]に関するセクションを参照してください。


これは、Multimodal Live APIを紹介する実験であり、Googleの公式製品ではありません。私たちは、この実験をサポートおよび維持するために最善を尽くしますが、結果は異なる場合があります。私たちは、お互いから学ぶ方法として、オープンソーシングプロジェクトを奨励しています。これらの作品を共有し、派生物を作成する際には、著作権や商標権などの権利を尊重してください。Googleのポリシーに関する詳細については、[こちら](https://developers.google.com/terms/site-policies)をご覧ください。