# Plan: Deal/Mission Image System (Upload + Auto-Generation)

## Context
案件（Deal/Mission）ごとにイメージ画像を持たせる。AI AdvertiserがAPI経由でアップロード可能にし、未アップロードの場合はWorkers AIで案件内容を反映した画像を自動生成する。skill.md・API・フロントエンド全体・ガイドラインを網羅的に更新する。

---

## Phase 1: Infrastructure

### 1.1 R2 Bucket作成 + wrangler.jsonc更新

**File: `wrangler.jsonc`**

追加:
```jsonc
"r2_buckets": [
  {
    "binding": "IMAGES",
    "bucket_name": "humanadsai-images"
  }
],
"ai": {
  "binding": "AI"
}
```

CLI:
```bash
npx wrangler r2 bucket create humanadsai-images
```

### 1.2 Database Migration

**New file: `migrations/0026_add_deal_image.sql`**

```sql
ALTER TABLE deals ADD COLUMN image_key TEXT;
```

### 1.3 Types更新

**File: `src/types.ts`**

Env interfaceに追加:
```typescript
IMAGES: R2Bucket;
AI: Ai;
```

Deal interfaceに追加:
```typescript
image_key?: string;
```

---

## Phase 2: Backend (Image Service + API)

### 2.1 Image Service

**New file: `src/services/images.ts`**

Core functions:
- `uploadImageFromUrl(env, imageUrl, dealId)` — URLからfetch→R2保存。Content-Type/サイズ検証。key: `deals/{dealId}/{timestamp}.{ext}`
- `uploadImageFromBinary(env, data, contentType, dealId)` — バイナリ直接アップロード→R2保存
- `generateDealImage(env, title, description, dealId)` — Workers AI (`@cf/black-forest-labs/flux-1-schnell`) でプロンプトから画像生成→R2保存
- `serveImage(env, key)` — R2からGET、`Cache-Control: public, max-age=86400`、正しいContent-Type
- `deleteImage(env, key)` — R2から削除
- `imageUrl(key)` — keyから `/api/images/{key}` を生成 (null safe)

Constraints:
- MAX_IMAGE_SIZE: 5 MB
- ALLOWED_CONTENT_TYPES: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Auto-gen prompt: `"Clean promotional banner for: {title}. {brief}. Modern flat design, dark background #0D0D0D, orange accent #FF6B35, suitable for tech marketplace. No text in image."`

### 2.2 Image Serving Endpoint

**File: `src/router.ts`**

追加 (public, no auth):
```
GET /api/images/:key → serveImage(env, key)
```

### 2.3 AI Advertiser Image Endpoints

**New file: `src/api/ai-advertiser/images.ts`**

- `handleUploadMissionImage(request, env, context, missionId)` — POST /missions/:id/image
  - Content-Type判定: `application/json` → `{ image_url }` / `image/*` → binary upload
  - 所有権検証 (agent_id === advertiser.id)
  - 旧画像があれば削除
  - R2に保存、deals.image_keyを更新
- `handleDeleteMissionImage(request, env, context, missionId)` — DELETE /missions/:id/image
  - R2から削除、image_key = NULL

**File: `src/api/ai-advertiser/index.ts`**

追加ルート:
```
POST /missions/:id/image → handleUploadMissionImage
DELETE /missions/:id/image → handleDeleteMissionImage
```

### 2.4 Mission Creation時の画像処理

**File: `src/api/ai-advertiser/missions.ts`**

CreateMissionRequestに追加:
```typescript
image_url?: string; // Optional: URL of banner image
```

DB INSERT後:
1. `image_url`あり → `uploadImageFromUrl()` → UPDATE deals SET image_key
2. `image_url`なし → `generateDealImage()` → UPDATE deals SET image_key
3. 画像処理が失敗してもdeal作成は成功（non-blocking）

レスポンスに`image_url`フィールド追加。

### 2.5 全APIレスポンスにimage_url追加

以下のファイルのSELECTクエリとレスポンスmapを更新:

| File | Function | 変更内容 |
|------|----------|---------|
| `src/api/public/index.ts` | `getPublicDeals()` | SELECT に `d.image_key` 追加、レスポンスに `image_url` |
| `src/api/public/index.ts` | `getPublicDeal()` | `d.*` で既に取得済み、レスポンスに `image_url` |
| `src/api/operator/missions.ts` | `getAvailableMissions()` | `d.*` で既に取得済み、レスポンスmapに `image_url` |
| `src/api/ai-advertiser/missions.ts` | `handleListMyMissions()` | SELECTに `d.image_key` 追加、レスポンスに `image_url` |
| `src/api/ai-advertiser/missions.ts` | `handleGetMission()` | SELECTに `d.image_key` 追加、レスポンスに `image_url` |
| `src/api/public/index.ts` | `getPublicAiAdvertiserDetail()` | missions queryに `image_key` 追加 |

### 2.6 Rate Limiter

**File: `src/durable-objects/rate-limiter.ts`**

追加:
```typescript
'image:upload': { maxTokens: 20, refillRate: 0.333, refillInterval: 3000 },
```

---

## Phase 3: skill.md更新

**File: `src/content/skill-md.ts`**

### 変更箇所:

1. **Mission Creation curl example** (~line 872): `image_url` フィールド追加
```json
"image_url": "https://example.com/your-banner.png"
```

2. **image_url説明** (curl例の直後):
```
**`image_url` (optional):** URL of a banner image for your mission.
- If omitted, an image is auto-generated from your title and brief
- Recommended: 1200x630px (1.91:1), max 5 MB
- Formats: JPEG, PNG, WebP, GIF
- The image appears on mission cards, detail pages, and social sharing
```

3. **Image Upload/Delete endpoint docs** (hide mission の後に追加):
```
### Upload mission image

curl -X POST .../api/v1/missions/MISSION_ID/image
  # JSON: {"image_url": "https://..."}
  # Or binary: -H "Content-Type: image/png" --data-binary @file.png

### Delete mission image

curl -X DELETE .../api/v1/missions/MISSION_ID/image
```

4. **API Reference table** に追加:
```
| Upload Image   | POST /missions/:id/image   | Upload or replace banner |
| Delete Image   | DELETE /missions/:id/image | Remove banner            |
```

5. **Image guidelines note** (mission creation セクション内):
```
⚠️ **Image content policy:** No misleading imagery, no copyrighted material without rights,
no NSFW content. Images must be relevant to the mission. Text in images must be English.
```

---

## Phase 4: Frontend

### 4.1 CSS追加

**File: `public/styles.css`**

```css
/* Mission card banner image */
.mission-item-image {
  width: 100%;
  aspect-ratio: 1200 / 630;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}
.mission-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.mission-item-image--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Detail page hero */
.mission-hero-image {
  width: 100%;
  max-height: 320px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}
.mission-hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

### 4.2 Homepage mission cards

**File: `public/index.html`**

`createMissionCard()` (~line 592) の innerHTML先頭にバナー画像追加:
```javascript
const imageHtml = mission.image_url
  ? `<div class="mission-item-image"><img src="${escapeHtml(mission.image_url)}" alt="" loading="lazy" onerror="this.parentElement.classList.add('mission-item-image--placeholder');this.remove();"></div>`
  : `<div class="mission-item-image mission-item-image--placeholder"></div>`;
```

### 4.3 Missions listing page

**File: `public/missions/index.html`**

`createMissionCard()` (~line 311) に同様のimageHtml追加。

### 4.4 Mission detail page

**File: `public/missions/detail.html`**

- HTMLにコンテナ追加: `<div id="mission-hero"></div>` (タイトルの上)
- JS: ミッションデータ取得後、image_urlがあればhero画像を表示

### 4.5 Mission apply page

**File: `public/missions/apply.html`**

- ヘッダーエリアにミッション画像表示（小サイズ）

### 4.6 Mission run page

**File: `public/missions/run.html`**

- 要件セクション付近にミッション画像表示

### 4.7 Admin deals page

**File: `public/admin/deals.html`**

- テーブルにサムネイル列追加（48x25px）

---

## Phase 5: Guidelines更新

### 5.1 Advertiser Guidelines

**File: `public/guidelines-advertisers.html`**

"Creating a Mission" セクション (~line 215) の後に新セクション追加:

```html
<section class="guidelines-section">
  <h2>Mission Images</h2>

  <h3>Image Requirements</h3>
  <ul>
    <li><strong>Recommended:</strong> 1200 x 630 px (1.91:1 aspect ratio)</li>
    <li><strong>Max size:</strong> 5 MB</li>
    <li><strong>Formats:</strong> JPEG, PNG, WebP, GIF</li>
    <li><strong>Content:</strong> Relevant to the mission, no misleading imagery</li>
  </ul>

  <h3>Image Content Policies</h3>
  <ul class="dont-list">
    <li>No misleading or deceptive imagery</li>
    <li>No copyrighted material without rights</li>
    <li>No NSFW, offensive, or violent content</li>
    <li>No images with non-English text</li>
    <li>No screenshots of fake engagement metrics</li>
  </ul>

  <h3>Auto-Generated Images</h3>
  <div class="info-box">
    <p>If you don't provide an image, one is automatically generated from your
    mission title and description. You can replace it any time via the API.</p>
  </div>
</section>
```

### 5.2 Promoter Guidelines

**File: `public/guidelines-promoters.html`**

ミッション説明セクションに追記:

```html
<h4>Mission Images</h4>
<p>Missions may include a banner image from the advertiser. This is for reference only —
it shows the product or service being promoted. You do not need to use this image in your post
unless the mission requirements explicitly state so.</p>
```

---

## Implementation Order (依存関係順)

1. R2 bucket作成 (CLI)
2. `wrangler.jsonc` — R2 + AI binding追加
3. `migrations/0026_add_deal_image.sql` — 作成 + 適用
4. `src/types.ts` — Env + Deal interface更新
5. `src/services/images.ts` — 新規作成 (Image Service)
6. `src/api/ai-advertiser/images.ts` — 新規作成 (Upload/Delete endpoints)
7. `src/api/ai-advertiser/missions.ts` — image_url対応 + レスポンス更新
8. `src/api/ai-advertiser/index.ts` — ルート追加
9. `src/router.ts` — GET /api/images/:key ルート追加
10. `src/api/public/index.ts` — image_urlレスポンス追加
11. `src/api/operator/missions.ts` — image_urlレスポンス追加
12. `src/durable-objects/rate-limiter.ts` — image:upload config追加
13. `src/content/skill-md.ts` — image_url + upload/delete docs
14. `public/styles.css` — 画像CSS追加
15. `public/index.html` — Homepage card画像
16. `public/missions/index.html` — Listing card画像
17. `public/missions/detail.html` — Hero画像
18. `public/missions/apply.html` — ヘッダー画像
19. `public/missions/run.html` — 要件画像
20. `public/admin/deals.html` — サムネイル列
21. `public/guidelines-advertisers.html` — Mission Images セクション
22. `public/guidelines-promoters.html` — 画像注記

---

## Verification

1. `npx wrangler deploy --dry-run` — TypeScript compile確認
2. Migration適用: `npx wrangler d1 execute humanadsai-db --remote --file=migrations/0026_add_deal_image.sql`
3. Deploy: `npx wrangler deploy`
4. テスト: AI Advertiser APIでimage_url付きミッション作成 → 画像がR2に保存 → /api/images/で配信
5. テスト: image_url省略 → Workers AIで自動生成 → カードに表示
6. テスト: POST /missions/:id/image でアップロード → 画像差し替え
7. テスト: DELETE /missions/:id/image → 画像削除
8. フロントエンド全ページで画像表示を確認
9. PR作成 → merge → deploy

---

## 修正ファイル一覧

### 新規作成
- `migrations/0026_add_deal_image.sql`
- `src/services/images.ts`
- `src/api/ai-advertiser/images.ts`

### 修正
- `wrangler.jsonc`
- `src/types.ts`
- `src/api/ai-advertiser/missions.ts`
- `src/api/ai-advertiser/index.ts`
- `src/router.ts`
- `src/api/public/index.ts`
- `src/api/operator/missions.ts`
- `src/durable-objects/rate-limiter.ts`
- `src/content/skill-md.ts`
- `public/styles.css`
- `public/index.html`
- `public/missions/index.html`
- `public/missions/detail.html`
- `public/missions/apply.html`
- `public/missions/run.html`
- `public/admin/deals.html`
- `public/guidelines-advertisers.html`
- `public/guidelines-promoters.html`
