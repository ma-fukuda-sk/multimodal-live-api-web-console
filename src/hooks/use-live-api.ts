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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MultimodalLiveAPIClientConnection, // 接続情報のための型定義
  MultimodalLiveClient, // Multimodal Live APIクライアント
} from "../lib/multimodal-live-client";
import { LiveConfig } from "../multimodal-live-types"; // Live APIの設定のための型定義
import { AudioStreamer } from "../lib/audio-streamer"; // オーディオストリーミングのためのクラス
import { audioContext } from "../lib/utils"; // AudioContextを取得するための関数
import VolMeterWorket from "../lib/worklets/vol-meter"; // 音量メーターのWorklet

// useLiveAPIフックの戻り値の型定義
export type UseLiveAPIResults = {
  client: MultimodalLiveClient; // Multimodal Live APIクライアントインスタンス
  setConfig: (config: LiveConfig) => void; // Live APIの設定を更新する関数
  config: LiveConfig; // 現在のLive APIの設定
  connected: boolean; // 接続状態
  connect: () => Promise<void>; // 接続を開始する関数
  disconnect: () => Promise<void>; // 接続を切断する関数
  volume: number; // 現在の音量レベル
};

// Multimodal Live APIを使用するためのカスタムフック
export function useLiveAPI({
  url, // APIのエンドポイントURL
  apiKey, // APIキー
}: MultimodalLiveAPIClientConnection): UseLiveAPIResults {
  const client = useMemo(
    () => new MultimodalLiveClient({ url, apiKey }), // MultimodalLiveClientインスタンスを作成。依存配列により、urlとapiKeyが変更された場合のみ再作成される
    [url, apiKey]
  );
  const audioStreamerRef = useRef<AudioStreamer | null>(null); // AudioStreamerインスタンスを保持するRef

  const [connected, setConnected] = useState(false); // 接続状態を管理するState
  const [config, setConfig] = useState<LiveConfig>({
    model: "models/gemini-2.0-flash-exp", // デフォルトのモデルを設定
  });
  const [volume, setVolume] = useState(0); // 音量レベルを管理するState

  // サーバーからスピーカーへのオーディオストリーミングを登録
  useEffect(() => {
    if (!audioStreamerRef.current) { // audioStreamerがまだ初期化されていない場合
      audioContext({ id: "audio-out" }).then((audioCtx: AudioContext) => { // AudioContextを取得
        audioStreamerRef.current = new AudioStreamer(audioCtx); // AudioStreamerを初期化
        audioStreamerRef.current
          .addWorklet<any>("vumeter-out", VolMeterWorket, (ev: any) => { // 音量メーターWorkletを追加
            setVolume(ev.data.volume); // 音量レベルを更新
          })
          .then(() => {
            // Workletの追加が成功した場合の処理 (ここでは何もしていない)
          });
      });
    }
  }, [audioStreamerRef]); // audioStreamerRefが変更された場合のみ再実行

  useEffect(() => {
    const onClose = () => {
      setConnected(false); // 接続が閉じられたら、接続状態をfalseに更新
    };

    const stopAudioStreamer = () => audioStreamerRef.current?.stop(); // audioストリーミングを停止する関数

    const onAudio = (data: ArrayBuffer) =>
      audioStreamerRef.current?.addPCM16(new Uint8Array(data)); // audioデータを受信した際の処理

    client
      .on("close", onClose) // closeイベントのリスナーを追加
      .on("interrupted", stopAudioStreamer) // interruptedイベントのリスナーを追加
      .on("audio", onAudio); // audioイベントのリスナーを追加

    return () => {
      // クリーンアップ関数：コンポーネントがアンマウントされる際にリスナーを削除
      client
        .off("close", onClose)
        .off("interrupted", stopAudioStreamer)
        .off("audio", onAudio);
    };
  }, [client]); // clientが変更された場合のみ再実行

  const connect = useCallback(async () => {
    console.log(config); // 接続設定をコンソールに出力
    if (!config) {
      throw new Error("config has not been set"); // 設定が未設定の場合エラーをスロー
    }
    client.disconnect(); // 既存の接続を切断
    await client.connect(config); // 新しい接続を開始
    setConnected(true); // 接続状態をtrueに更新
  }, [client, setConnected, config]); // client, setConnected, configが変更された場合のみ再生成

  const disconnect = useCallback(async () => {
    client.disconnect(); // 接続を切断
    setConnected(false); // 接続状態をfalseに更新
  }, [setConnected, client]); // setConnected, clientが変更された場合のみ再生成


  return {
    client, // Multimodal Live APIクライアントインスタンス
    config, // 現在のLive API設定
    setConfig, // Live API設定を更新する関数
    connected, // 接続状態
    connect, // 接続を開始する関数
    disconnect, // 接続を切断する関数
    volume, // 現在の音量レベル
  };
}
