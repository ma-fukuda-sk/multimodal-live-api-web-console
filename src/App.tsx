/**
 * Copyright 2024 Google LLC
 *
 * Apacheライセンスバージョン2.0（以下「ライセンス」）に基づいてライセンスされています。
 * ライセンスに準拠する場合を除き、本ソフトウェアを使用することはできません。
 * ライセンスのコピーは以下から取得できます。
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * 適用法で要求されている場合、あるいは書面で合意されている場合を除き、
 * 本ソフトウェアは現状のまま配布され、明示的または黙示的な保証または条件は一切提供されません。
 * ライセンスに基づいて許諾される権利と制限事項については、ライセンスを参照してください。
 */

import { useRef, useState } from "react";
import "./App.scss"; // アプリケーション全体のスタイルシートをインポート
import { LiveAPIProvider } from "./contexts/LiveAPIContext"; // LiveAPIのコンテキストプロバイダーをインポート
import SidePanel from "./components/side-panel/SidePanel"; // サイドパネルコンポーネントをインポート
// import { Altair } from "./components/altair/Altair"; // Altairコンポーネントをインポート
import ControlTray from "./components/control-tray/ControlTray"; // コントロールトレイコンポーネントをインポート
import cn from "classnames"; // classnamesユーティリティをインポート
// import { KitchenTrainer } from "./components/kitchen-trainer/Kitchen-trainer";
import { Receptionist } from "./components/receptionist/Receptionist";


const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string; // 環境変数からAPIキーを取得
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env"); // APIキーが設定されていない場合、エラーをスロー
}

const host = "generativelanguage.googleapis.com"; // APIのホスト名
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`; // APIのエンドポイントURI

function App() {
  // ビデオ表示用のRef。Webカメラまたは画面キャプチャのストリームを表示するために使用
  const videoRef = useRef<HTMLVideoElement>(null);
  // 表示するビデオストリーム（画面キャプチャ、Webカメラ、またはnull）を管理するState。nullの場合は非表示
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY}> {/* Live APIのコンテキストプロバイダー */}
        <div className="streaming-console">
          <SidePanel /> {/* サイドパネルコンポーネント */}
          <main>
            <div className="main-app-area">
              {/* メインアプリケーション領域 */}
              {/* <Altair /> Altairコンポーネント */}
              {/* <KitchenTrainer /> */}
              <Receptionist />
              <video
                className={cn("stream", {
                  hidden: !videoRef.current || !videoStream, // videoRefがnullまたはvideoStreamがnullの場合は非表示
                })}
                ref={videoRef} // video要素への参照
                autoPlay // 自動再生
                playsInline // インライン再生
              />
            </div>

            <ControlTray
              videoRef={videoRef} // videoRefを渡す
              supportsVideo={true} // ビデオをサポート
              onVideoStreamChange={setVideoStream} // ビデオストリームが変更されたときのハンドラ
            >
              {/* カスタムボタンを追加する領域 */}
            </ControlTray> {/* コントロールトレイコンポーネント */}
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default App;
