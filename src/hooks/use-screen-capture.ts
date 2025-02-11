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

import { useState, useEffect } from "react";
import { UseMediaStreamResult } from "./use-media-stream-mux"; // メディアストリームの操作結果の型定義をインポート

// 画面キャプチャを操作するためのカスタムフック
export function useScreenCapture(): UseMediaStreamResult {
  const [stream, setStream] = useState<MediaStream | null>(null); // キャプチャされたメディアストリームを保持するState。初期値はnull
  const [isStreaming, setIsStreaming] = useState(false); // ストリーミング中かどうかを示すState。初期値はfalse

  // ストリームの状態変化を監視するuseEffect
  useEffect(() => {
    // ストリームが終了したときの処理
    const handleStreamEnded = () => {
      setIsStreaming(false); // ストリーミング中フラグをfalseに設定
      setStream(null); // ストリームをnullに設定
    };

    if (stream) {
      // ストリームが存在する場合、各トラックに終了イベントリスナーを追加
      stream
        .getTracks()
        .forEach((track) => track.addEventListener("ended", handleStreamEnded));

      // クリーンアップ関数：コンポーネントがアンマウントされる際にリスナーを削除
      return () => {
        stream
          .getTracks()
          .forEach((track) =>
            track.removeEventListener("ended", handleStreamEnded)
          );
      };
    }
  }, [stream]); // streamが変更された場合のみ再実行

  // 画面キャプチャを開始する関数
  const start = async () => {
    // const controller = new CaptureController();  // 将来的な拡張のためコメントアウトされている
    // controller.setFocusBehavior("no-focus-change"); // 将来的な拡張のためコメントアウトされている
    // 画面キャプチャのメディアストリームを取得
    const mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: true, // videoトラックを取得
      // controller // 将来的な拡張のためコメントアウトされている
    });
    setStream(mediaStream); // 取得したストリームをstateに設定
    setIsStreaming(true); // ストリーミング中フラグをtrueに設定
    return mediaStream; // 取得したストリームを返す
  };

  // 画面キャプチャを停止する関数
  const stop = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop()); // 各トラックを停止
      setStream(null); // ストリームをnullに設定
      setIsStreaming(false); // ストリーミング中フラグをfalseに設定
    }
  };

  // 戻り値として返すオブジェクト
  const result: UseMediaStreamResult = {
    type: "screen", // ストリームの種類は"screen"
    start, // キャプチャ開始関数
    stop, // キャプチャ停止関数
    isStreaming, // ストリーミング中かどうか
    stream, // メディアストリーム
  };

  return result; // 操作結果を返す
}
