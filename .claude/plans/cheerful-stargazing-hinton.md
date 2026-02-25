# Paid済みミッションにTX詳細を表示 + APIレスポンスに追加

## Context
Paid済みのミッション詳細ページ (`/missions/detail?id=xxx`) で、現在は「Payment Complete / You earned $X.XX」しか表示されていない。トランザクション情報（TX hash、チェーン、トークン、金額、確認日時、ブロックエクスプローラーリンク）が表示されておらず、透明性が不十分。

APIレスポンス（`GET /api/missions/my`）でも `payout_tx_hash` はDBから取得しているが、レスポンスに含めていない。

## 現状分析

### DBスキーマ（schema.sql）
- `missions` テーブル: `payout_tx_hash`, `payout_confirmed_at`, `auf_tx_hash`, `auf_confirmed_at`, `paid_at`
- `payments` テーブル: `tx_hash`, `amount_cents`, `chain`, `token`, `status`, `confirmed_at`, `to_address`, `payout_mode`

### API側
- **`src/api/operator/missions.ts` (getMyMissions)**:
  - SQLで `m.payout_tx_hash` を取得済みだが、レスポンスに含めていない
  - `is_simulated` フラグは含まれている
- **`src/api/ai-advertiser/submissions.ts`**: payments テーブルから詳細なTX情報を返している（参考パターン）
- **`src/config/payout.ts`**: `getExplorerTxUrl(chain, txHash, isTestnet)` が既に存在 — エクスプローラーURL生成にそのまま使える

### フロントエンド
- **`public/missions/detail.html`**:
  - `paid-section` (line 466-474): 「Payment Complete / You earned $X.XX」のみ
  - TX hash、チェーン、トークン情報の表示なし

### ドキュメント
- **`src/content/skill-md.ts`**: Submission objectに `payout_status` はあるが payment 詳細は別エンドポイント
- **`public/guidelines-promoters.html`** (line 259): 「All payments are on-chain and verifiable. You can check the transaction on a block explorer.」と書いてあるが、実際にリンクを提供していない
- **`public/guidelines-advertisers.html`**: payout flowの説明あり

---

## 変更箇所

### 1. `src/api/operator/missions.ts` — APIレスポンスにTX詳細追加

**getMyMissions** (line 388-455):
- SQLクエリに `payments` テーブルをJOINして `chain`, `token`, `to_address` を取得
- レスポンスに以下を追加:

```
payment: {
  payout_tx_hash: string | null,
  payout_confirmed_at: string | null,
  chain: string | null,
  token: string | null,
  to_address: string | null,
  is_simulated: boolean,
  explorer_url: string | null,  // getExplorerTxUrl() で生成
}
```

具体的には:
- SQLに `LEFT JOIN payments p ON p.mission_id = m.id AND p.payment_type = 'payout'` を追加
- レスポンスオブジェクトの `is_simulated` を `payment` オブジェクト内に移動
- 既存の `is_simulated` フィールドは後方互換のために残す

### 2. `public/missions/detail.html` — Paid Section にTX詳細表示

**paid-section** (line 466-474) を拡張:
- TX hash（短縮表示: `0x1234...abcd`）
- エクスプローラーリンク（`View on Etherscan →`）— 実TXのみ
- チェーン名 + トークン名（例: `Sepolia • hUSD`）
- 受取アドレス（短縮）
- 確認日時
- Simulatedの場合は `SIMULATED` バッジ + 「Ledger-based (no on-chain TX)」表示

**updateUI()** (line 608-731) に処理追加:
- `mission.payment` オブジェクトからTX情報を取得
- paid-section 内のHTML要素にデータをセット

### 3. `public/missions/my.html` — Paid カードにTXサマリー追加

**createMissionCard()** の paid/paid_complete セクションに:
- TX hashの短縮表示 + エクスプローラーリンク（ある場合）
- Simulated の場合は `SIMULATED` バッジ（既存実装あり）

### 4. `src/content/skill-md.ts` — Submission object 更新

**Submission object** (line 1119-1139):
- `payment` フィールドを追加（paid 状態の場合のみ）

### 5. `public/guidelines-promoters.html` — 支払い確認方法の補足

line 259 付近の「All payments are on-chain and verifiable」の後に:
- 「Your mission detail page shows the transaction hash and a link to view it on the block explorer」を追加

---

## ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `src/api/operator/missions.ts` | `payment` オブジェクトをレスポンスに追加（TX hash, chain, token, explorer URL） |
| `public/missions/detail.html` | paid-section にTX詳細カード追加、updateUI()にTXデータ処理追加 |
| `public/missions/my.html` | paid カードにTX hash短縮表示とエクスプローラーリンク追加 |
| `src/content/skill-md.ts` | Submission objectに `payment` フィールドの説明追加 |
| `public/guidelines-promoters.html` | TX確認手段の説明を補足 |

---

## 実装詳細

### API レスポンス形式（getMyMissions）

```js
{
  // ... existing fields ...
  is_simulated: boolean,  // 後方互換
  payment: {
    payout_tx_hash: "0xabc123..." | null,
    payout_confirmed_at: "2026-02-07T12:06:00Z" | null,
    chain: "sepolia" | null,
    token: "hUSD" | null,
    to_address: "0x1234..." | null,
    is_simulated: false,
    explorer_url: "https://sepolia.etherscan.io/tx/0xabc123..." | null
  }
}
```

### フロントエンドTX表示

paid-section のHTMLイメージ:
```
┌────────────────────────────────────┐
│  ✓ Payment Complete                │
│  You earned  $5.00                 │
│                                    │
│  ── Transaction Details ────────── │
│  TX: 0x1234...abcd  [View on ↗]   │
│  Chain: Sepolia • hUSD             │
│  To: 0xABCD...1234                 │
│  Confirmed: Feb 7, 2026            │
└────────────────────────────────────┘
```

Simulated の場合:
```
┌────────────────────────────────────┐
│  ✓ Payment Complete  [SIMULATED]   │
│  You earned  $5.00                 │
│                                    │
│  Ledger-based payment (no on-chain │
│  transaction). Test mode only.     │
└────────────────────────────────────┘
```

---

## 検証

1. `wrangler dev` でローカル起動
2. Paid済みミッションの詳細ページを開く（例: `/missions/detail?id=ca232c9a45e04a78a2cd7e5b9802b553`）
3. TX詳細セクションが表示されることを確認
4. エクスプローラーリンクが正しいURLであることを確認
5. Simulated TXの場合、エクスプローラーリンクが表示されないことを確認
6. My Missions ページで paid カードにTX情報が表示されることを確認
7. API レスポンスに `payment` オブジェクトが含まれることを curl で確認
