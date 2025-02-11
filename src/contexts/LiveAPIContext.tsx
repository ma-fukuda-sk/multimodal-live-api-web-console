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

import { createContext, FC, ReactNode, useContext } from "react";
import { useLiveAPI, UseLiveAPIResults } from "../hooks/use-live-api"; // useLiveAPIフックと、その戻り値の型定義をインポート

// Live APIのコンテキストを作成。初期値はundefined
const LiveAPIContext = createContext<UseLiveAPIResults | undefined>(undefined);

// LiveAPIProviderのpropsの型定義
export type LiveAPIProviderProps = {
  children: ReactNode; // 子コンポーネント
  url?: string; // APIのエンドポイントURL（オプション）
  apiKey: string; // APIキー
};

// Live APIのコンテキストプロバイダーコンポーネント
export const LiveAPIProvider: FC<LiveAPIProviderProps> = ({
  url,
  apiKey,
  children,
}) => {
  const liveAPI = useLiveAPI({ url, apiKey }); // useLiveAPIフックを使用して、Live APIの接続情報を取得

  // LiveAPIContext.Providerで子コンポーネントをラップし、liveAPIの値をコンテキストに提供
  return (
    <LiveAPIContext.Provider value={liveAPI}>
      {children}
    </LiveAPIContext.Provider>
  );
};

// Live APIのコンテキストにアクセスするためのカスタムフック
export const useLiveAPIContext = () => {
  const context = useContext(LiveAPIContext); // useContextフックを使用してコンテキストの値を取得

  // コンテキストがundefinedの場合、エラーをスロー
  if (!context) {
    throw new Error("useLiveAPIContextはLiveAPIProviderの中で使用されなければなりません。"); // LiveAPIProviderの中で使用する必要があることを示すエラーメッセージ
  }
  return context; // コンテキストの値を返す
};
