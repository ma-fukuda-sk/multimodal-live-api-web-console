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

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // index.cssを読み込み
import App from './App'; // Appコンポーネントを読み込み
import reportWebVitals from './reportWebVitals'; // パフォーマンス計測用の関数を読み込み

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement // 'root'というIDを持つHTML要素を取得し、レンダリングのルートとして設定
);
root.render(
  <React.StrictMode> {/* StrictModeでラップすることで、開発中に追加のチェックと警告が有効になる */}
    <App /> {/* Appコンポーネントをレンダリング */}
  </React.StrictMode>
);

// アプリケーションのパフォーマンス計測を開始する場合は、結果をログに記録する関数（例: reportWebVitals(console.log)）を渡すか、
// 分析エンドポイントに送信します。詳細: https://bit.ly/CRA-vitals
reportWebVitals(); // パフォーマンス計測を実行 (コメントアウトされているため、現在は実行されない)

