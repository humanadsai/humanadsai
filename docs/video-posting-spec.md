# HumanAds 動画自動投稿機能 MVP仕様書

Remotion + Postiz 連携による YouTube / Instagram 定期投稿自動化

---

## 1. MVP要件定義

### 1-1. スコープ

| 区分 | 内容 |
|------|------|
| **IN** | 管理画面での台本登録、テンプレ選択、Remotion Lambda レンダリング、Postiz連携（下書き/予約/即時）、YouTube/Instagram対応、ステータス管理、リトライ |
| **OUT** | 高度なAI編集UI、音声合成の感情制御、字幕校正UI、マルチテナント権限、TikTok本格対応 |

### 1-2. 技術スタック

| コンポーネント | 技術 | 理由 |
|------------|------|------|
| 管理画面 | 既存 admin HTML + vanilla JS | 統一性、追加依存なし |
| バックエンド | Cloudflare Workers + D1 | 既存基盤 |
| 動画生成 | Remotion Lambda (AWS) | 分散レンダリング、15-30秒/本、$0.02-0.05/本 |
| 投稿管理 | Postiz Cloud API | セルフホスト不要、API経由で下書き/予約/即時投稿 |
| 動画ストレージ | Remotion Lambda → S3 → Postiz upload | Lambda出力をそのまま利用 |
| ジョブ管理 | D1テーブル + Workers Cron (*/5分) | 既存基盤内で完結、外部キュー不要 |

### 1-3. アーキテクチャ概要

```
管理画面 (admin/video.html)
    │
    ▼
CF Worker API (/api/admin/video-posts/*)
    │
    ├── 台本 → スライドJSON変換（ルールベース）
    │
    ├── Remotion Lambda renderMediaOnLambda()
    │       │
    │       ▼
    │   AWS Lambda (分散レンダリング)
    │       │
    │       ├── Webhook → CF Worker /api/webhooks/remotion
    │       └── 出力: S3 MP4 (1080x1920, H.264)
    │
    ├── Postiz API
    │       ├── POST /upload (動画アップロード)
    │       └── POST /posts (下書き/予約/即時)
    │
    └── D1 (状態管理)
        ├── video_posts
        ├── video_post_targets
        ├── video_render_jobs
        └── video_job_events
```

---

## 2. 画面仕様

### 2-1. 画面一覧

| 画面 | パス | 説明 |
|------|------|------|
| 投稿一覧 | admin タブ「Video Posts」 | 全投稿の一覧・フィルタ・詳細遷移 |
| 投稿作成 | モーダル or インライン | 台本入力→テンプレ選択→投稿設定→送信 |
| 投稿詳細 | モーダル or インライン展開 | ステータス・ログ・プレビュー・リトライ |

### 2-2. 投稿作成画面

既存admin画面のタブ内にモーダル表示。直線的なステップUI。

**Step 1: 基本情報**

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| internal_title | text | ○ | 内部管理用タイトル（max 100字） |
| template_type | select | ○ | `slideshow` / `explainer` |
| script_text | textarea | ○ | 台本本文（max 10,000字） |

**Step 2: 投稿設定**

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| platforms | checkbox | ○ (1つ以上) | YouTube / Instagram |
| publish_mode | radio | ○ | draft / publish_now / scheduled |
| scheduled_at | datetime-local | 予約時○ | JST表示、DB保存はUTC |
| caption_text | textarea | - | 未入力なら台本冒頭から自動生成 |
| hashtags_text | text | - | 未入力ならテンプレ補完 |
| yt_title | text | YT選択時○ | YouTube動画タイトル（2-100字） |
| yt_visibility | select | YT選択時 | public / unlisted / private（default: unlisted） |
| bgm_preset | select | - | none / upbeat / calm / corporate（default: none） |

**Step 3: 確認 → 送信**
- 入力内容サマリ表示
- 「レンダリング開始」ボタン

### 2-3. 投稿一覧画面

admin `index.html` に新タブ「Video Posts」を追加。

**テーブルカラム:**

| カラム | 表示 |
|--------|------|
| ID | 先頭8文字 (monospace) |
| タイトル | internal_title (truncate) |
| テンプレート | slideshow / explainer バッジ |
| 投稿先 | YouTube / Instagram アイコン |
| モード | draft / scheduled / now バッジ |
| ステータス | 色付きバッジ |
| 予約日時 | JST表示（予約時のみ） |
| 作成日時 | relative time |
| アクション | 詳細 / リトライ |

**フィルタ:**
- ステータス: all / rendering / postiz_draft / scheduled / published / failed
- 投稿先: all / youtube / instagram

### 2-4. 投稿詳細画面

一覧の行展開 or モーダル。

**表示内容:**
- 入力内容（台本、テンプレ、設定）
- 全体ステータス + 投稿先別ステータス
- レンダリングジョブ情報（進捗、所要時間、コスト）
- 動画プレビュー（S3 URL → video要素で再生）
- Postiz送信結果（postiz_post_id、エラー）
- 投稿先ごとの状態（published_url or error）
- イベントログ（時系列）
- リトライボタン（段階別: render / postiz / publish）

---

## 3. API / ジョブ仕様

### 3-1. 管理画面API

すべて `requireAdmin` ミドルウェア経由。

| Method | Endpoint | 説明 |
|--------|----------|------|
| `POST` | `/api/admin/video-posts` | 投稿作成（台本→ジョブ投入） |
| `GET` | `/api/admin/video-posts` | 投稿一覧（フィルタ対応） |
| `GET` | `/api/admin/video-posts/:id` | 投稿詳細 |
| `POST` | `/api/admin/video-posts/:id/retry` | リトライ（body: `{stage: "render"|"postiz"|"publish"}`) |
| `DELETE` | `/api/admin/video-posts/:id` | 投稿削除（soft delete） |
| `POST` | `/api/webhooks/remotion` | Remotion Lambda webhook受信 |

#### `POST /api/admin/video-posts` リクエスト

```json
{
  "internal_title": "HumanAds紹介動画 Week3",
  "template_type": "slideshow",
  "script_text": "HumanAdsは、AIと人間をつなぐ...",
  "platforms": ["youtube", "instagram"],
  "publish_mode": "scheduled",
  "scheduled_at": "2026-03-01T12:00:00+09:00",
  "caption_text": "",
  "hashtags_text": "#HumanAds #AI #Web3",
  "yt_title": "HumanAdsとは？AI×人間の広告マーケットプレイス",
  "yt_visibility": "public",
  "bgm_preset": "upbeat"
}
```

#### `POST /api/admin/video-posts` レスポンス (201)

```json
{
  "success": true,
  "data": {
    "video_post_id": "vp_abc123...",
    "status": "queued_render",
    "render_job_id": "vr_def456...",
    "slides_count": 8,
    "estimated_duration_sec": 24
  }
}
```

#### `POST /api/webhooks/remotion` (Remotion Lambda Webhook)

Remotion Lambda からの完了通知を受信。
- ヘッダ `X-Remotion-Status`: `success` | `timeout` | `error`
- ヘッダ `X-Remotion-Signature`: HMAC SHA-512 署名（検証必須）
- Body には `outputUrl`, `renderId`, `costs`, `errors` 等を含む

処理:
1. 署名検証
2. render_job の status 更新
3. 成功時: `output_video_url` を保存、video_post の status を `render_succeeded` へ
4. 失敗時: error_message を保存、status を `render_failed` へ
5. イベントログ記録

### 3-2. ジョブパイプライン

台本投入から投稿完了まで、以下のジョブが順次実行される。
Workers Cron (`*/5 * * * *`) でポーリング処理。

```
① BuildVideoPayload
   台本テキスト → スライドJSON変換（ルールベース）
   同期処理（API リクエスト内で即時実行）

② RenderRemotionVideo
   renderMediaOnLambda() 呼び出し → renderId 取得
   Webhook で完了通知 or Cron でポーリング

③ UploadToPostiz
   S3の動画ファイルを Postiz /upload へアップロード
   postiz_media_id, postiz_media_path を保存

④ CreatePostizPost
   Postiz /posts API で投稿データ作成
   mode に応じて draft / schedule / now
   postiz_post_id を保存

⑤ SyncPostStatus (Cron)
   Postiz の投稿状態を定期確認（published_url 取得等）
```

**ジョブ共通仕様:**

| 項目 | 値 |
|------|------|
| 最大リトライ回数 | 3 |
| タイムアウト | render: 300秒、upload/postiz: 60秒 |
| 冪等性 | render_id / postiz_post_id の存在チェックで二重実行防止 |
| エラーログ | video_job_events テーブルに記録 |
| 失敗通知 | 管理画面のステータス表示（将来: Slack通知） |

### 3-3. 台本 → スライド変換ルール（BuildVideoPayload）

**入力:** `script_text` (プレーンテキスト)

**変換ルール (MVP):**
1. 空行で段落分割
2. 各段落を1スライドにマッピング
3. 1スライドの文字数上限: 80字。超過時は句点「。」で分割
4. 句点で分割できない場合は読点「、」で分割
5. 冒頭スライドは「フック」として強調スタイル適用
6. 最終スライドにCTA（固定テンプレ: アカウント名 + ハッシュタグ）を自動追加
7. `---` (ハイフン3つ以上)は章区切りとして扱う（explainer テンプレ用）

**出力: Remotion InputProps JSON**

```json
{
  "templateType": "slideshow",
  "title": "HumanAdsとは？",
  "slides": [
    {
      "type": "hook",
      "text": "AIが広告を出す時代。",
      "subtext": "",
      "durationSec": 3,
      "bgPreset": "gradient_blue"
    },
    {
      "type": "body",
      "text": "HumanAdsは、AIエージェントが広告主として...",
      "subtext": "",
      "durationSec": 4,
      "bgPreset": "solid_dark"
    },
    {
      "type": "chapter_title",
      "text": "仕組み",
      "subtext": "",
      "durationSec": 2,
      "bgPreset": "gradient_purple"
    },
    {
      "type": "cta",
      "text": "今すぐチェック",
      "subtext": "humanadsai.com",
      "durationSec": 4,
      "bgPreset": "brand"
    }
  ],
  "caption": "HumanAdsは、AIと人間をつなぐ...",
  "hashtags": ["#HumanAds", "#AI", "#Web3"],
  "bgmPreset": "upbeat",
  "stylePreset": "dark",
  "outroCta": {
    "text": "Follow @HumanAdsAI",
    "url": "https://humanadsai.com"
  },
  "metadata": {
    "totalDurationSec": 24,
    "totalSlides": 8,
    "fps": 30,
    "width": 1080,
    "height": 1920,
    "codec": "h264"
  }
}
```

### 3-4. Remotion 連携仕様

**テンプレートコンポジション:**

```tsx
// remotion/src/Root.tsx
<Composition
  id="Slideshow"
  component={SlideshowTemplate}
  width={1080}
  height={1920}
  fps={30}
  schema={slideshowSchema}
  calculateMetadata={({ props }) => ({
    durationInFrames: props.slides.reduce((sum, s) => sum + s.durationSec * 30, 0),
  })}
/>

<Composition
  id="Explainer"
  component={ExplainerTemplate}
  width={1080}
  height={1920}
  fps={30}
  schema={explainerSchema}
  calculateMetadata={/* 同様 */}
/>
```

**レンダリング呼び出し (CF Worker → Lambda):**

```typescript
import { renderMediaOnLambda } from '@remotion/lambda/client';

const { renderId, bucketName } = await renderMediaOnLambda({
  region: 'ap-northeast-1',  // 東京リージョン
  functionName: 'humanads-remotion-render',
  composition: templateType === 'slideshow' ? 'Slideshow' : 'Explainer',
  serveUrl: REMOTION_SERVE_URL,  // S3にデプロイ済みバンドル
  codec: 'h264',
  inputProps: slidesPayload,
  webhook: {
    url: 'https://humanadsai.com/api/webhooks/remotion',
    secret: REMOTION_WEBHOOK_SECRET,
    customData: { videoPostId, renderJobId },
  },
  forceWidth: 1080,
  forceHeight: 1920,
  crf: 18,
  jpegQuality: 80,
  privacy: 'public',
  timeoutInMilliseconds: 240000,
  maxRetries: 1,
});
```

**日本語フォント:** Remotion Lambda は Noto Sans CJK をデフォルトで内蔵。
追加で `@remotion/google-fonts/NotoSansJP` を使用して明示的にロード。

### 3-5. Postiz 連携仕様

**認証:** APIキー（Cloudflare Secret `POSTIZ_API_KEY`）

```
Authorization: <api-key>
```

**動画アップロード:**

```typescript
// S3 URLからファイルを取得 → Postiz へ multipart upload
const videoBlob = await fetch(s3VideoUrl).then(r => r.blob());
const form = new FormData();
form.append('file', videoBlob, 'video.mp4');

const uploadRes = await fetch('https://api.postiz.com/public/v1/upload', {
  method: 'POST',
  headers: { 'Authorization': POSTIZ_API_KEY },
  body: form,
});
const { id: mediaId, path: mediaPath } = await uploadRes.json();
```

**投稿作成:**

```typescript
const postBody = {
  type: publishMode,  // "draft" | "schedule" | "now"
  date: scheduledAtUtc,
  shortLink: false,
  posts: []
};

// YouTube ターゲット
if (platforms.includes('youtube')) {
  postBody.posts.push({
    integration: { id: POSTIZ_YOUTUBE_INTEGRATION_ID },
    value: [{
      content: captionText,
      image: [{ id: mediaId, path: mediaPath }],
    }],
    settings: {
      __type: 'youtube',
      title: ytTitle,
      type: ytVisibility,
      selfDeclaredMadeForKids: 'no',
      tags: hashtags.map(h => ({ value: h, label: h })),
    },
  });
}

// Instagram ターゲット
if (platforms.includes('instagram')) {
  postBody.posts.push({
    integration: { id: POSTIZ_INSTAGRAM_INTEGRATION_ID },
    value: [{
      content: `${captionText}\n\n${hashtags.join(' ')}`,
      image: [{ id: mediaId, path: mediaPath }],
    }],
    settings: {
      __type: 'instagram',
      post_type: 'post',  // 動画はReelとして自動判定
    },
  });
}

const postRes = await fetch('https://api.postiz.com/public/v1/posts', {
  method: 'POST',
  headers: {
    'Authorization': POSTIZ_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(postBody),
});
```

**レスポンス（成功時）:**

```json
[
  { "postId": "post-yt-123", "integration": "youtube-integration-id" },
  { "postId": "post-ig-456", "integration": "instagram-integration-id" }
]
```

**レート制限:** 30リクエスト/時。
週1-2本の運用では問題なし（1本あたり upload + posts = 2リクエスト）。

**注意事項:**
- Postiz の「draft」はPostiz上の下書きであり、YouTube Studio/Instagram上の下書きではない
- 動画はPostizが公開処理時にプラットフォームへアップロードする
- `.mp4` 拡張子は小文字必須（大文字だと400エラー）
- API はベータ版。破壊的変更の可能性あり

---

## 4. DB設計

### 4-1. `video_posts`

```sql
CREATE TABLE IF NOT EXISTS video_posts (
  id TEXT PRIMARY KEY,                    -- 'vp_' + 16byte hex
  internal_title TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'slideshow',  -- slideshow | explainer
  template_version TEXT DEFAULT 'v1',
  script_text TEXT NOT NULL,
  slides_json TEXT,                       -- BuildVideoPayload 出力JSON
  slides_count INTEGER DEFAULT 0,
  caption_text TEXT,
  hashtags_text TEXT,
  yt_title TEXT,
  yt_visibility TEXT DEFAULT 'unlisted',  -- public | unlisted | private
  cta_text TEXT,
  bgm_preset TEXT DEFAULT 'none',
  aspect_ratio TEXT DEFAULT '9:16',
  status TEXT NOT NULL DEFAULT 'draft_input',
  publish_mode TEXT NOT NULL DEFAULT 'draft',  -- draft | publish_now | scheduled
  scheduled_at TEXT,                      -- UTC ISO 8601
  retry_count INTEGER DEFAULT 0,
  created_by TEXT,                        -- operator.id
  visibility TEXT DEFAULT 'visible',      -- visible | deleted
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_video_posts_status ON video_posts(status);
CREATE INDEX idx_video_posts_visibility ON video_posts(visibility);
CREATE INDEX idx_video_posts_created ON video_posts(created_at);
```

### 4-2. `video_post_targets`

```sql
CREATE TABLE IF NOT EXISTS video_post_targets (
  id TEXT PRIMARY KEY,                    -- 'vt_' + 16byte hex
  video_post_id TEXT NOT NULL REFERENCES video_posts(id),
  platform TEXT NOT NULL,                 -- youtube | instagram
  postiz_integration_id TEXT,             -- Postiz側のintegration ID
  postiz_post_id TEXT,                    -- Postiz側のpost ID
  postiz_media_id TEXT,                   -- Postiz側のmedia ID
  postiz_media_path TEXT,                 -- Postiz側のmedia URL
  target_status TEXT NOT NULL DEFAULT 'pending',
  published_url TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_video_post_targets_post ON video_post_targets(video_post_id);
CREATE INDEX idx_video_post_targets_status ON video_post_targets(target_status);
```

### 4-3. `video_render_jobs`

```sql
CREATE TABLE IF NOT EXISTS video_render_jobs (
  id TEXT PRIMARY KEY,                    -- 'vr_' + 16byte hex
  video_post_id TEXT NOT NULL REFERENCES video_posts(id),
  remotion_render_id TEXT,                -- Lambda renderId
  remotion_bucket TEXT,                   -- S3 bucket name
  remotion_region TEXT DEFAULT 'ap-northeast-1',
  remotion_composition TEXT,              -- Slideshow | Explainer
  input_payload_json TEXT,                -- Remotion inputProps (JSON)
  render_status TEXT NOT NULL DEFAULT 'queued',
  output_video_url TEXT,                  -- S3 public URL
  output_thumbnail_url TEXT,
  duration_sec REAL,
  render_cost_usd REAL,
  started_at TEXT,
  completed_at TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_video_render_jobs_post ON video_render_jobs(video_post_id);
CREATE INDEX idx_video_render_jobs_status ON video_render_jobs(render_status);
```

### 4-4. `video_job_events`

```sql
CREATE TABLE IF NOT EXISTS video_job_events (
  id TEXT PRIMARY KEY,                    -- 've_' + 16byte hex
  video_post_id TEXT NOT NULL REFERENCES video_posts(id),
  job_type TEXT NOT NULL,                 -- build | render | upload | postiz_send | publish | sync
  event_type TEXT NOT NULL,               -- queued | started | success | failed | retry
  message TEXT,
  metadata_json TEXT,                     -- 補足データ（エラー詳細、コスト等）
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_video_job_events_post ON video_job_events(video_post_id);
CREATE INDEX idx_video_job_events_type ON video_job_events(job_type, event_type);
```

---

## 5. ステータス遷移図

### 5-1. 全体ステータス (`video_posts.status`)

```
draft_input
    │
    ▼  (「レンダリング開始」ボタン押下)
queued_render
    │
    ▼  (Remotion Lambda 呼び出し成功)
rendering
    │
    ├──成功──▶ render_succeeded
    │              │
    │              ▼  (Postiz アップロード開始)
    │         uploading_to_postiz
    │              │
    │              ├──成功──▶ queued_postiz
    │              │              │
    │              │              ▼  (Postiz /posts 呼び出し)
    │              │         sending_to_postiz
    │              │              │
    │              │              ├─ mode=draft ──▶ postiz_draft_created ──[完了]
    │              │              ├─ mode=scheduled ──▶ scheduled ──▶ published
    │              │              └─ mode=now ──▶ publishing ──▶ published
    │              │              │
    │              │              └──失敗──▶ postiz_failed ──[リトライ可]
    │              │
    │              └──失敗──▶ upload_failed ──[リトライ可]
    │
    └──失敗──▶ render_failed ──[リトライ可]

publish_failed ──[リトライ可]
```

### 5-2. 投稿先別ステータス (`video_post_targets.target_status`)

```
pending
  │
  ▼
uploading ──失敗──▶ upload_failed
  │
  ▼
uploaded
  │
  ▼
sending ──失敗──▶ send_failed
  │
  ├─ draft ──▶ draft_created [完了]
  ├─ scheduled ──▶ scheduled ──▶ published [完了]
  └─ now ──▶ publishing ──▶ published [完了]
                    │
                    └──失敗──▶ publish_failed
```

---

## 6. エラーハンドリング仕様

### 6-1. エラー分類

| 段階 | エラーコード | ユーザー向けメッセージ | リトライ可 | 対応 |
|------|------------|---------------------|----------|------|
| **台本解析** | `SCRIPT_EMPTY` | 台本が空です | - | 入力バリデーション |
| | `SCRIPT_TOO_LONG` | 台本が10,000字を超えています | - | 入力バリデーション |
| | `SLIDE_PARSE_FAILED` | 台本のスライド分割に失敗しました | - | 台本を修正して再作成 |
| **レンダリング** | `RENDER_TIMEOUT` | 動画生成がタイムアウトしました | ○ | リトライ or サポート |
| | `RENDER_LAMBDA_ERROR` | 動画生成サービスでエラーが発生しました | ○ | リトライ |
| | `RENDER_COMPOSITION_NOT_FOUND` | テンプレートが見つかりません | - | テンプレート設定確認 |
| | `RENDER_WEBHOOK_INVALID` | Webhook署名が無効です | - | 設定確認 |
| **アップロード** | `UPLOAD_FETCH_FAILED` | 生成動画の取得に失敗しました | ○ | S3接続確認 |
| | `UPLOAD_POSTIZ_FAILED` | Postizへの動画アップロードに失敗しました | ○ | リトライ |
| | `UPLOAD_TOO_LARGE` | 動画ファイルが大きすぎます | - | 動画設定調整 |
| **Postiz送信** | `POSTIZ_AUTH_EXPIRED` | Postiz認証が切れています | - | 管理者がPostiz設定を確認 |
| | `POSTIZ_CHANNEL_DISABLED` | 投稿先チャネルが無効です | - | Postizでチャネル再接続 |
| | `POSTIZ_RATE_LIMITED` | Postiz APIレート制限に達しました | ○ | 自動リトライ（5分後） |
| | `POSTIZ_API_ERROR` | Postiz APIエラーが発生しました | ○ | リトライ |
| **投稿** | `PUBLISH_PLATFORM_ERROR` | SNSプラットフォームでエラーが発生しました | ○ | エラー内容確認→リトライ |
| | `PUBLISH_PERMISSION_DENIED` | 投稿権限がありません | - | SNSアカウント設定確認 |
| | `SCHEDULE_DATE_PAST` | 予約日時が過去です | - | 日時を再設定 |

### 6-2. エラー表示仕様

管理画面の投稿詳細で、以下を表示:

```
┌─────────────────────────────────────┐
│ ⚠️ レンダリング失敗                    │
│                                     │
│ エラー: 動画生成がタイムアウトしました     │
│ 発生: 2026-02-25 15:30 JST          │
│ 段階: Remotionレンダリング             │
│ 試行: 2/3回                          │
│                                     │
│ [技術詳細を表示]                       │
│ render_id: abc123                    │
│ Lambda timeout after 240s            │
│                                     │
│ [レンダリングをリトライ]                 │
└─────────────────────────────────────┘
```

### 6-3. リトライ仕様

| リトライ対象 | 最大回数 | 間隔 | 冪等性保証 |
|------------|---------|------|----------|
| レンダリング | 3 | 手動 or 即時 | 新しい render_id で実行 |
| Postizアップロード | 3 | 手動 or 5分後自動 | media_id 存在チェック（あればスキップ） |
| Postiz投稿作成 | 3 | 手動 or 5分後自動 | postiz_post_id 存在チェック（あればスキップ） |
| 公開 | 2 | 手動のみ | postiz_post_id で既存投稿を確認 |

**二重投稿防止:**
- Postiz送信前に `video_post_targets.postiz_post_id` を確認
- 既にpost_idが存在する場合は新規作成をスキップし、状態同期のみ実行
- レンダリングは毎回新しいジョブとして実行（前回の出力は上書き）

---

## 7. 実装ステップ

### Phase 1: 下書き作成まで（推奨2-3週間）

**目標:** 台本入力 → 動画生成 → Postiz下書き保存の一連フローが動く

| ステップ | 内容 | 工数目安 |
|---------|------|---------|
| 1-1 | DBマイグレーション（4テーブル） | 0.5日 |
| 1-2 | 台本→スライドJSON変換ロジック (`src/api/admin/video.ts`) | 1日 |
| 1-3 | Remotionプロジェクト作成 + Slideshowテンプレート | 2-3日 |
| 1-4 | Remotion Lambda デプロイ (AWS) | 1日 |
| 1-5 | CF Worker → Lambda 呼び出し + Webhook受信 | 1-2日 |
| 1-6 | Postiz連携（upload + posts API） | 1-2日 |
| 1-7 | 管理画面UI（作成フォーム + 一覧 + 詳細） | 2-3日 |
| 1-8 | ステータス管理 + イベントログ | 1日 |
| 1-9 | E2Eテスト（手動） | 1日 |

**Phase 1 完了条件:**
- 管理画面で台本入力 → Slideshowテンプレで動画生成される
- 生成動画がPostizに下書きとして保存される
- YouTube / Instagram 両方に下書き作成できる
- ステータスが管理画面で確認できる
- 失敗時にエラー内容が見える

### Phase 2: 予約投稿 + リトライ（1-2週間）

| ステップ | 内容 | 工数目安 |
|---------|------|---------|
| 2-1 | 予約投稿対応（Postiz schedule モード） | 0.5日 |
| 2-2 | Workers Cron ジョブ（状態同期） | 1日 |
| 2-3 | リトライ機能（段階別） | 1-2日 |
| 2-4 | Explainer テンプレート追加 | 2日 |
| 2-5 | キャプション/ハッシュタグ テンプレ自動生成 | 0.5日 |
| 2-6 | BGM対応 | 1日 |

**Phase 2 完了条件:**
- 予約日時指定で投稿がスケジュールされる
- 失敗したジョブをリトライできる
- Explainerテンプレートが使える

### Phase 3: 自動投稿 + 改善（1-2週間）

| ステップ | 内容 | 工数目安 |
|---------|------|---------|
| 3-1 | 即時投稿モード | 0.5日 |
| 3-2 | Postiz状態同期 Cron（published_url取得） | 1日 |
| 3-3 | 投稿履歴・分析ダッシュボード | 1-2日 |
| 3-4 | Slack/Discord 失敗通知 | 0.5日 |
| 3-5 | テンプレート追加の仕組み整備 | 1日 |
| 3-6 | サムネイル自動生成（renderStill） | 1日 |

---

## 8. 工数見積もり

### 最小構成（Phase 1 のみ）

| 区分 | 工数 |
|------|------|
| バックエンド (CF Worker + Lambda連携) | 5-6日 |
| Remotionテンプレート開発 | 2-3日 |
| AWS Lambda セットアップ | 1日 |
| 管理画面UI | 2-3日 |
| テスト・調整 | 1-2日 |
| **合計** | **11-15日** |

### 推奨構成（Phase 1 + 2）

| 区分 | 工数 |
|------|------|
| Phase 1 | 11-15日 |
| Phase 2 追加分 | 5-7日 |
| **合計** | **16-22日** |

### ランニングコスト（月間見積もり）

| 項目 | 週2本 (月8本) | 週5本 (月20本) |
|------|-------------|--------------|
| Remotion Lambda | $0.16-0.40 | $0.40-1.00 |
| AWS S3 ストレージ | $0.05 | $0.10 |
| Postiz Cloud (Standard) | $29/月 | $29/月 |
| CF Workers (既存) | $0 (既存プラン内) | $0 |
| **月間合計** | **~$30** | **~$31** |

※ Remotion ライセンス: 3人以下の企業は無料

---

## 9. リスク一覧と回避策

| # | リスク | 影響度 | 発生確率 | 回避策 |
|---|--------|--------|---------|--------|
| 1 | **Postiz認証切れ** | 高 | 中 | SNSのOAuthトークンが失効するとPostiz側で再認証が必要。管理画面で `POSTIZ_CHANNEL_DISABLED` エラーを表示し、Postizダッシュボードへのリンクを提供。Cronジョブで定期的にチャネル状態をチェック |
| 2 | **Postiz API 破壊的変更** | 高 | 低 | API はベータ版。Postiz SDK (`@postiz/node`) を使用し、バージョン固定。レスポンス形式変更をラッパー関数で吸収 |
| 3 | **Remotion Lambda タイムアウト** | 中 | 低 | 240秒タイムアウト設定。60秒のスライドショーなら15-30秒で完了するため余裕あり。失敗時は自動リトライ |
| 4 | **レンダリング負荷（同時実行）** | 中 | 低 | 週1-2本なので問題なし。将来的に同時実行制限（Durable Object でセマフォ）を追加 |
| 5 | **二重投稿** | 高 | 中 | postiz_post_id の冪等性チェック。リトライ時は既存投稿の存在確認を先行。UIで「送信中」はボタン無効化 |
| 6 | **日本語文字化け** | 中 | 低 | Lambda に Noto Sans CJK がデフォルト内蔵。テンプレートで `@remotion/google-fonts/NotoSansJP` を明示的にロード。E2Eテストで確認 |
| 7 | **Postiz レート制限 (30req/hr)** | 低 | 低 | 週2本なら4-6リクエスト/週。バッチ投稿で1リクエストに複数プラットフォームをまとめる |
| 8 | **S3動画URLの公開範囲** | 中 | - | Lambda出力を `privacy: 'public'` にしているが、管理者のみが参照する前提。必要に応じて署名URL（presigned URL）に変更 |
| 9 | **Instagram Reels 自動判定** | 低 | 中 | Postiz API に明示的な Reel 設定なし。動画の縦型 (9:16) + 短尺で自動的にReelとして扱われる想定。実テストで確認が必要 |
| 10 | **CF Worker 実行時間制限** | 中 | 低 | Worker は Lambda 呼び出し（非同期）とWebhook受信（軽量）のみ。重い処理はしない。Postiz upload は動画サイズ次第で30秒超の可能性あり→タイムアウト延長 or 分割 |

---

## 10. テンプレート仕様

### 10-1. テンプレートA: Slideshow（スライドショー）

```
┌──────────────────────┐
│                      │
│   [背景: グラデ/単色]  │
│                      │
│   ┌──────────────┐   │
│   │              │   │
│   │  大見出し      │   │
│   │  テキスト      │   │
│   │              │   │
│   └──────────────┘   │
│                      │
│   小テキスト（任意）   │
│                      │
│   ── プログレスバー ── │
└──────────────────────┘
  1080 x 1920 (9:16)
```

**固定要素:**
- 背景: グラデーション or 単色（プリセット5種: `gradient_blue`, `gradient_purple`, `solid_dark`, `solid_white`, `brand`）
- テキスト: Noto Sans JP Bold (大見出し 48-64px) + Regular (小テキスト 24-32px)
- トランジション: フェードイン (0.5秒)
- プログレスバー: 下部に薄いバー（全体の進行表示）
- 最終スライド: CTA + ロゴ

**スライドタイプ:**

| type | 表示 | デフォルト秒数 |
|------|------|-------------|
| `hook` | 大文字、中央配置、強調背景 | 3秒 |
| `body` | 標準テキスト、中央配置 | 4秒 |
| `emphasis` | 数字や結論を大きく表示 | 3秒 |
| `cta` | CTA文言 + URL + ロゴ | 4秒 |

### 10-2. テンプレートB: Explainer（解説動画）

```
┌──────────────────────┐
│  Chapter 1 / 3       │
│  ━━━━━━━━━━━━━━━━━━  │
│                      │
│   章タイトル          │
│                      │
│   ┌──────────────┐   │
│   │ 本文テキスト   │   │
│   │ (左寄せ)      │   │
│   │              │   │
│   └──────────────┘   │
│                      │
│   ── プログレスバー ── │
└──────────────────────┘
```

**追加スライドタイプ:**

| type | 表示 | デフォルト秒数 |
|------|------|-------------|
| `chapter_title` | 章番号 + タイトル、全画面 | 2秒 |
| `body` | 本文テキスト（左寄せ、行間広め） | 5秒 |
| `emphasis` | 数値・結論を強調（中央大文字） | 3秒 |
| `summary` | まとめスライド（箇条書き） | 5秒 |

### 10-3. テンプレート管理方針

- `template_type` + `template_version` で管理
- Remotion側: composition ID で選択（`Slideshow`, `Explainer`）
- 新テンプレート追加時は新しい composition を追加するだけ（既存に影響なし）
- DB の `template_version` で同一テンプレートの改版を追跡

---

## 11. キャプション / ハッシュタグ生成

### 自動生成ルール（MVP）

**キャプション:**
1. `caption_text` が入力されていればそのまま使用
2. 未入力の場合、`script_text` の先頭200字を使用
3. YouTube: 説明文（`content`フィールド）に使用、5000字上限
4. Instagram: キャプションに使用、2200字上限

**ハッシュタグ:**
1. `hashtags_text` が入力されていればそのまま使用
2. 未入力の場合、固定テンプレを適用:
   - 共通: `#HumanAds #HumanAdsAI`
   - YouTube追加: `#Shorts #AI #Web3`
   - Instagram追加: `#AImarketing #Web3marketing`
3. Instagram では `caption_text` 末尾にハッシュタグを改行2つ + 結合で追加
4. YouTube では `settings.tags` に配列として設定

**プラットフォーム差分吸収:**

| 項目 | YouTube | Instagram |
|------|---------|-----------|
| タイトル | `settings.title` (2-100字) | なし（キャプション冒頭が表示名） |
| 説明文 | `content` (5000字) | `content` = キャプション (2200字) |
| ハッシュタグ | `settings.tags[]` | キャプション末尾に結合 |
| 公開設定 | `settings.type` (public/unlisted/private) | なし（常にpublic） |
| サムネイル | `settings.thumbnail` (別途upload) | 自動（動画の1フレーム目） |
| 動画形式 | MP4, 最大128GB | MP4, 最大1GB, 最大90秒(Reel) |

---

## 12. バリデーション仕様

### 投稿作成時

| フィールド | ルール | エラーメッセージ |
|-----------|--------|--------------|
| internal_title | 必須、1-100字 | タイトルは1-100字で入力してください |
| template_type | 必須、`slideshow` or `explainer` | テンプレートを選択してください |
| script_text | 必須、1-10,000字 | 台本を入力してください（10,000字以内） |
| platforms | 1つ以上選択 | 投稿先を1つ以上選択してください |
| publish_mode | 必須 | 投稿モードを選択してください |
| scheduled_at | 予約時必須、未来日時 | 予約日時は現在より後の日時を指定してください |
| yt_title | YouTube選択時必須、2-100字 | YouTubeタイトルは2-100字で入力してください |
| caption_text | 任意、0-5,000字 | キャプションは5,000字以内で入力してください |
| hashtags_text | 任意、0-500字 | ハッシュタグは500字以内で入力してください |

### レンダリング前チェック

| チェック | エラー |
|---------|--------|
| slides_json が生成済み | スライド変換が未完了です |
| slides_count > 0 | 台本からスライドを生成できませんでした |
| 同一 video_post に対するアクティブなレンダリングジョブがない | 既にレンダリング中です |

### Postiz送信前チェック

| チェック | エラー |
|---------|--------|
| output_video_url が存在する | 動画が生成されていません |
| Postiz API キーが設定済み | Postiz連携が設定されていません |
| 対象プラットフォームの integration_id が設定済み | 投稿先チャネルが設定されていません |

---

## 13. 外部連携の確認項目

### Remotion

| 項目 | 仕様 |
|------|------|
| 実行方式 | AWS Lambda（分散レンダリング） |
| リージョン | `ap-northeast-1`（東京） |
| テンプレート管理 | S3にバンドルをデプロイ（`deploySite()`） |
| フォント | Noto Sans JP（Lambda層にデフォルト内蔵） + `@remotion/google-fonts/NotoSansJP` |
| 性能 | 60秒動画 → 15-30秒でレンダリング完了 |
| コスト | $0.02-0.05/本 |
| 出力 | H.264 MP4, 1080x1920, CRF 18, 30fps |

### Postiz

| 項目 | 仕様 |
|------|------|
| 認証 | APIキー（`Authorization` ヘッダ） |
| ワークスペース | 1組織 = 1ワークスペース |
| チャネル指定 | `integration.id` で指定（GET /integrations で取得） |
| 下書き作成 | `type: "draft"` — Postiz上の下書き（プラットフォーム下書きではない） |
| 予約投稿 | `type: "schedule"` + `date` (UTC ISO 8601) |
| 動画アップロード | `POST /upload` multipart/form-data、MP4小文字必須 |
| レート制限 | 30リクエスト/時 |
| YouTube差分 | `settings.__type: "youtube"` + title, type, tags |
| Instagram差分 | `settings.__type: "instagram"` + post_type |
| エラー | 400 (不正形式), 401 (認証失敗), 409 (IG競合), 429 (レート制限) |

### 環境変数 / シークレット（Cloudflare Dashboard で設定）

| 変数名 | 用途 |
|--------|------|
| `POSTIZ_API_KEY` | Postiz API認証キー |
| `POSTIZ_YOUTUBE_INTEGRATION_ID` | Postiz上のYouTubeチャネルID |
| `POSTIZ_INSTAGRAM_INTEGRATION_ID` | Postiz上のInstagramチャネルID |
| `REMOTION_SERVE_URL` | S3にデプロイ済みRemotionバンドルURL |
| `REMOTION_WEBHOOK_SECRET` | Webhook HMAC検証用シークレット |
| `AWS_ACCESS_KEY_ID` | Lambda呼び出し用 |
| `AWS_SECRET_ACCESS_KEY` | Lambda呼び出し用 |
| `REMOTION_LAMBDA_FUNCTION` | Lambda関数名 |
| `REMOTION_S3_BUCKET` | レンダリング出力先バケット |
| `REMOTION_AWS_REGION` | Lambda リージョン |

---

## 14. セキュリティ

| 項目 | 対応 |
|------|------|
| 管理画面アクセス | `requireAdmin` ミドルウェア（既存） |
| API認証情報 | Cloudflare Secrets（平文保存しない） |
| Webhook検証 | `X-Remotion-Signature` HMAC SHA-512 検証 |
| S3動画URL | `privacy: 'public'`（管理者のみ参照。必要に応じて presigned URL） |
| 操作ログ | `video_job_events` テーブルに全操作を記録 |
| 入力サニタイズ | script_text のHTMLエスケープ（Remotion内で React が自動処理） |

---

## 15. 受け入れ条件

### 必須完了条件（Phase 1）

- [ ] 管理画面で台本を入力し、テンプレート選択して動画生成できる
- [ ] 生成動画をPostizへ送信できる
- [ ] YouTube 向けに下書き保存できる
- [ ] Instagram 向けに下書き保存できる
- [ ] 投稿ステータスが管理画面で確認できる
- [ ] エラー内容が管理画面で確認できる
- [ ] レンダリング失敗時にリトライできる
- [ ] Postiz送信失敗時にリトライできる

### 品質条件

- [ ] 同一操作の重複実行で二重投稿しない（冪等性）
- [ ] 主要エラーで管理画面が沈黙しない（何が起きたか分かる）
- [ ] 日本語テキストが文字化けしない
- [ ] 60秒の動画が5分以内にレンダリング完了する

### Phase 2 完了条件

- [ ] 予約投稿が設定できる（Postiz経由）
- [ ] Explainerテンプレートが使える
- [ ] 全段階でリトライ可能

---

## 付録A: Remotion プロジェクト構成

```
remotion/
├── package.json
├── tsconfig.json
├── remotion.config.ts
├── src/
│   ├── Root.tsx                    # Composition 定義
│   ├── schemas.ts                  # Zod スキーマ
│   ├── templates/
│   │   ├── Slideshow.tsx           # スライドショーテンプレート
│   │   ├── Explainer.tsx           # 解説テンプレート
│   │   └── components/
│   │       ├── Slide.tsx           # 個別スライド
│   │       ├── ProgressBar.tsx     # 進行バー
│   │       ├── CTA.tsx             # CTAスライド
│   │       └── Transition.tsx      # トランジション
│   ├── styles/
│   │   ├── presets.ts              # 背景プリセット定義
│   │   └── fonts.ts               # フォントロード
│   └── utils/
│       └── timing.ts              # フレーム計算ユーティリティ
└── public/
    ├── fonts/                      # フォントファイル（バックアップ）
    └── audio/                      # BGMプリセット
        ├── upbeat.mp3
        ├── calm.mp3
        └── corporate.mp3
```

## 付録B: Workers Cron ジョブ仕様

既存の `schedule: */15 * * * *` に追加、または新しい `*/5 * * * *` Cronを追加。

```typescript
// src/scheduled.ts (既存ファイルに追加)

async function processVideoJobs(env: Env) {
  // 1. render_succeeded → uploading_to_postiz
  //    S3動画をPostizにアップロード
  const readyToUpload = await env.DB
    .prepare("SELECT * FROM video_posts WHERE status = 'render_succeeded' AND visibility = 'visible' LIMIT 3")
    .all();

  for (const post of readyToUpload.results) {
    await uploadToPostiz(post, env);
  }

  // 2. queued_postiz → sending_to_postiz
  //    Postiz /posts API で投稿作成
  const readyToSend = await env.DB
    .prepare("SELECT * FROM video_posts WHERE status = 'queued_postiz' AND visibility = 'visible' LIMIT 3")
    .all();

  for (const post of readyToSend.results) {
    await createPostizPost(post, env);
  }

  // 3. scheduled / published 状態同期
  const scheduled = await env.DB
    .prepare("SELECT * FROM video_posts WHERE status IN ('scheduled', 'publishing') AND visibility = 'visible' LIMIT 5")
    .all();

  for (const post of scheduled.results) {
    await syncPostStatus(post, env);
  }
}
```

## 付録C: 台本入力例と変換結果

**入力台本:**
```
HumanAdsは、AIと人間をつなぐ新しい広告マーケットプレイスです。

---

AIエージェントが広告主として予算を設定し、人間のプロモーターがX(Twitter)で実際に投稿します。投稿が検証されると、自動的に報酬が支払われます。

---

使い方は簡単。ウォレットを作成し、hUSDトークンを取得して、ミッションを作成するだけ。AIエージェントでも人間でも、誰でも広告主になれます。

今すぐHumanAdsをチェックしてみませんか？
```

**変換結果 (slides_json):**
```json
{
  "templateType": "explainer",
  "slides": [
    {
      "type": "hook",
      "text": "HumanAdsは、AIと人間をつなぐ新しい広告マーケットプレイスです。",
      "durationSec": 4
    },
    {
      "type": "chapter_title",
      "text": "仕組み",
      "durationSec": 2
    },
    {
      "type": "body",
      "text": "AIエージェントが広告主として予算を設定し、人間のプロモーターがX(Twitter)で実際に投稿します。",
      "durationSec": 5
    },
    {
      "type": "body",
      "text": "投稿が検証されると、自動的に報酬が支払われます。",
      "durationSec": 4
    },
    {
      "type": "chapter_title",
      "text": "使い方",
      "durationSec": 2
    },
    {
      "type": "body",
      "text": "ウォレットを作成し、hUSDトークンを取得して、ミッションを作成するだけ。",
      "durationSec": 4
    },
    {
      "type": "emphasis",
      "text": "AIエージェントでも人間でも、誰でも広告主になれます。",
      "durationSec": 4
    },
    {
      "type": "cta",
      "text": "今すぐチェック",
      "subtext": "humanadsai.com\n@HumanAdsAI",
      "durationSec": 4
    }
  ],
  "metadata": {
    "totalDurationSec": 29,
    "totalSlides": 8
  }
}
```
