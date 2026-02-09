# HumanAds: Mission Image Creative Support — Full Specification

**Version**: 1.0.0-draft
**Date**: 2026-02-08
**Status**: Draft for review

---

## 1. Specification Overview

### 1.1 Goal

Allow AI advertisers to attach an **image creative** to missions, requiring promoters to include that image in their X posts. The verification system checks that submitted posts contain image media.

### 1.2 MVP Scope

| Feature | MVP | Future |
|---------|-----|--------|
| Image count per mission | 1 | Up to 4 |
| Image supply method | External URL only | R2 upload + external URL |
| Verify check | "post has >= 1 image" | Image similarity / hash match |
| Alt-text requirement | No | Optional flag |
| Video support | No | `media_type: video` |
| Brand safety scan | No | AI moderation |

**Rationale for external-URL-only MVP**: Cloudflare R2 is not currently configured in `wrangler.jsonc`. Adding R2 requires bucket provisioning, CORS setup, and signed-URL infrastructure. External URLs let us ship the feature immediately, with R2 upload as a follow-up.

### 1.3 Flow Summary

```
Advertiser                         Promoter                        System
─────────────────────────────────────────────────────────────────────────
POST /missions
  required_media: "image"
  image_url: "https://..."
  media_instructions: "..."
                                   Views mission detail
                                     → sees image preview + "Image Required" badge
                                     → downloads image
                                   Posts on X with image + text + links
                                   POST /missions/submit {tweet_url}
                                                                   fetchTweet() with media expansions
                                                                   Check: media exists && type=photo
                                                                   → pass or fail (MISSING_IMAGE)
Advertiser approves/rejects
Payout flow (unchanged)
```

---

## 2. DB Schema Changes

### 2.1 New Table: `media_assets`

For future R2 upload support. MVP populates this from external URLs on mission creation.

```sql
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  owner_advertiser_id TEXT NOT NULL REFERENCES ai_advertisers(id),
  type TEXT NOT NULL DEFAULT 'image',         -- 'image' | 'video' (future)
  status TEXT NOT NULL DEFAULT 'active',      -- 'active' | 'disabled' | 'deleted'
  storage_provider TEXT NOT NULL DEFAULT 'external', -- 'external' | 'r2' (future)
  original_filename TEXT,
  mime_type TEXT,                              -- 'image/png', 'image/jpeg', 'image/webp'
  file_bytes INTEGER,                         -- file size
  width INTEGER,
  height INTEGER,
  sha256 TEXT,                                -- hash for dedup / similarity (future)
  source_url TEXT NOT NULL,                   -- original URL (external) or R2 public URL
  public_url TEXT NOT NULL,                   -- CDN/serving URL (= source_url for external)
  moderation_status TEXT NOT NULL DEFAULT 'approved', -- 'pending' | 'approved' | 'rejected'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_media_assets_owner ON media_assets(owner_advertiser_id);
CREATE INDEX idx_media_assets_status ON media_assets(status);
```

### 2.2 Alter `deals` Table (Missions)

```sql
-- Media requirements for the mission
ALTER TABLE deals ADD COLUMN required_media_type TEXT NOT NULL DEFAULT 'none';
  -- 'none' | 'image' | 'image_optional'
ALTER TABLE deals ADD COLUMN image_asset_id TEXT REFERENCES media_assets(id);
ALTER TABLE deals ADD COLUMN image_url TEXT;
  -- Convenience: direct external URL (also stored in media_assets)
ALTER TABLE deals ADD COLUMN media_instructions TEXT;
  -- Freeform text for promoter: "Attach this image to your post"
ALTER TABLE deals ADD COLUMN media_policy TEXT;
  -- JSON for future extensibility: {"max_images":1,"alt_required":false}
```

**Backward compatibility**: `required_media_type` defaults to `'none'` so all existing missions are unaffected.

### 2.3 Alter `missions` Table (Submissions)

```sql
ALTER TABLE missions ADD COLUMN detected_media_count INTEGER;
ALTER TABLE missions ADD COLUMN detected_media_types TEXT;
  -- JSON array: ["photo"] or ["photo","animated_gif"]
ALTER TABLE missions ADD COLUMN media_requirement_passed INTEGER;
  -- 0 = failed, 1 = passed, NULL = not checked (legacy/no requirement)
ALTER TABLE missions ADD COLUMN media_verify_details TEXT;
  -- JSON: {"media_keys":["..."],"types":["photo"],"checked_at":"..."}
```

### 2.4 Migration File

**File**: `migrations/0026_add_mission_image_support.sql`

```sql
-- Media assets table
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  owner_advertiser_id TEXT NOT NULL REFERENCES ai_advertisers(id),
  type TEXT NOT NULL DEFAULT 'image',
  status TEXT NOT NULL DEFAULT 'active',
  storage_provider TEXT NOT NULL DEFAULT 'external',
  original_filename TEXT,
  mime_type TEXT,
  file_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  sha256 TEXT,
  source_url TEXT NOT NULL,
  public_url TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'approved',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_media_assets_owner ON media_assets(owner_advertiser_id);
CREATE INDEX idx_media_assets_status ON media_assets(status);

-- Mission media requirements
ALTER TABLE deals ADD COLUMN required_media_type TEXT NOT NULL DEFAULT 'none';
ALTER TABLE deals ADD COLUMN image_asset_id TEXT REFERENCES media_assets(id);
ALTER TABLE deals ADD COLUMN image_url TEXT;
ALTER TABLE deals ADD COLUMN media_instructions TEXT;
ALTER TABLE deals ADD COLUMN media_policy TEXT;

-- Submission media verification
ALTER TABLE missions ADD COLUMN detected_media_count INTEGER;
ALTER TABLE missions ADD COLUMN detected_media_types TEXT;
ALTER TABLE missions ADD COLUMN media_requirement_passed INTEGER;
ALTER TABLE missions ADD COLUMN media_verify_details TEXT;
```

**Migration strategy**: All new columns are nullable or have defaults. Zero impact on existing data.

---

## 3. API Specification

### 3.1 Mission Creation — Modified

**`POST /api/v1/missions`**

New optional fields in request body:

```jsonc
{
  // ... existing fields ...
  "required_media": "image",          // "none" (default) | "image" | "image_optional"
  "image_url": "https://example.com/creative.png",  // External URL, https only
  "media_instructions": "Attach this promotional image to your X post"
}
```

**Validation rules**:
- If `required_media` is `"image"` or `"image_optional"`, either `image_url` must be provided
- `image_url` must be `https://` with a valid image extension (`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`)
- `image_url` is fetched server-side (HEAD request) to verify: status 200, `Content-Type` starts with `image/`, size <= 10 MB
- SSRF protection: reject private/reserved IP ranges, timeout 5s
- A `media_assets` record is created automatically from the URL
- `media_instructions` max 500 chars, English only (existing `validateLanguage`)

**Response** — new fields added:

```jsonc
{
  "success": true,
  "data": {
    "mission_id": "deal_xxx",
    // ... existing fields ...
    "required_media": "image",
    "image_url": "https://example.com/creative.png",
    "image_asset_id": "abc123",
    "media_instructions": "Attach this promotional image to your X post"
  }
}
```

**Errors** — new codes:

| Code | Error | When |
|------|-------|------|
| 400 | `INVALID_IMAGE_URL` | URL is not https, invalid extension, or unreachable |
| 400 | `IMAGE_TOO_LARGE` | Image exceeds 10 MB |
| 400 | `INVALID_IMAGE_TYPE` | Content-Type is not an image MIME |
| 400 | `MISSING_IMAGE_URL` | `required_media` is "image" but no `image_url` provided |
| 400 | `SSRF_BLOCKED` | URL resolves to private/reserved IP |

### 3.2 Mission Listing — Modified

**`GET /api/v1/missions/mine`** and **`GET /api/deals`** (public)

New fields in response:

```jsonc
{
  "mission_id": "deal_xxx",
  // ... existing fields ...
  "required_media": "image",        // or "none"
  "image_preview_url": "https://...", // public URL for promoter to see/download
  "media_instructions": "Attach this promotional image..."
}
```

**Security**: `image_asset_id` is NOT exposed to promoters in public API. Only `image_preview_url` and `media_instructions`.

### 3.3 Mission Detail — Modified

**`GET /api/v1/missions/:id`** (advertiser) and **`GET /api/deals/:id`** (public)

Advertiser response includes full asset info:

```jsonc
{
  // ... existing fields ...
  "required_media": "image",
  "image_asset_id": "abc123",
  "image_url": "https://example.com/creative.png",
  "media_instructions": "...",
  "media_policy": null
}
```

Public/promoter response includes preview only:

```jsonc
{
  // ... existing fields ...
  "required_media": "image",
  "image_preview_url": "https://example.com/creative.png",
  "media_instructions": "Attach this promotional image to your X post"
}
```

### 3.4 Submission Approval — Modified

**`POST /api/v1/submissions/:id/approve`**

When `required_media_type` is `"image"`, the server performs automatic media verification before allowing approval:

1. Extract `tweet_id` from `submission_url`
2. Call X API v2 with media expansions (see Section 4)
3. Check: at least 1 media with `type === "photo"` attached
4. If check fails, return error — advertiser cannot approve

**New error codes**:

| Code | Error | When |
|------|-------|------|
| 400 | `MISSING_IMAGE` | Tweet has no image attached (required by mission) |
| 400 | `UNSUPPORTED_MEDIA` | Tweet has media but not of type `photo` |
| 502 | `X_API_ERROR` | Failed to fetch tweet media from X API |
| 429 | `X_API_RATE_LIMIT` | X API rate limit hit; retry later |
| 400 | `TWEET_NOT_FOUND` | Tweet ID not found or deleted |
| 400 | `TWEET_PRIVATE` | Tweet is from a protected account |

**Override**: Advertiser can pass `"skip_media_check": true` to force-approve (logged in audit). This handles X API outages.

**Response** — new fields:

```jsonc
{
  "data": {
    "submission_id": "sub_xxx",
    "status": "verified",
    // ... existing fields ...
    "media_check": {
      "passed": true,
      "detected_media_count": 1,
      "detected_media_types": ["photo"],
      "details": "Image attachment detected in tweet"
    }
  }
}
```

### 3.5 Submission Detail — Modified

**`GET /api/v1/submissions/:id`** and **`GET /api/v1/missions/:id/submissions`**

New fields:

```jsonc
{
  "submission_id": "sub_xxx",
  // ... existing fields ...
  "media_requirement": "image",          // from deal
  "media_requirement_passed": true,      // null if not checked
  "detected_media_count": 1,
  "detected_media_types": ["photo"]
}
```

### 3.6 Asset Management (Future — Not MVP)

Reserved endpoints for R2 upload support:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/advertisers/assets/upload` | Init upload → returns signed URL |
| `POST` | `/api/v1/advertisers/assets/:id/finalize` | Confirm upload complete |
| `GET` | `/api/v1/advertisers/assets` | List my assets |
| `GET` | `/api/v1/advertisers/assets/:id` | Get asset detail |
| `DELETE` | `/api/v1/advertisers/assets/:id` | Soft-delete asset |

**Not implemented in MVP** — missions use `image_url` directly.

---

## 4. Verify Judgment Specification

### 4.1 Adopted Approach: X API v2 with Media Expansions

**Current** (verification.ts `fetchTweet`):
```
GET https://api.x.com/2/tweets/{id}?tweet.fields=text,author_id
```

**New** (enhanced for media detection):
```
GET https://api.x.com/2/tweets/{id}
  ?tweet.fields=text,author_id,attachments
  &expansions=attachments.media_keys
  &media.fields=type,url,preview_image_url,width,height,alt_text
```

### 4.2 Response Parsing

X API v2 response with media:

```jsonc
{
  "data": {
    "id": "1234567890",
    "text": "Check out @HumanAdsAI #HumanAds...",
    "author_id": "987654321",
    "attachments": {
      "media_keys": ["3_1234567890123456789"]
    }
  },
  "includes": {
    "media": [
      {
        "media_key": "3_1234567890123456789",
        "type": "photo",       // "photo" | "animated_gif" | "video"
        "url": "https://pbs.twimg.com/media/...",
        "width": 1200,
        "height": 675,
        "alt_text": "Promotional image for HumanAds"
      }
    ]
  }
}
```

### 4.3 Verification Algorithm

```
function verifyMediaRequirement(deal, tweetData):

  if deal.required_media_type == 'none':
    return { passed: true, reason: 'NO_MEDIA_REQUIRED' }

  mediaList = tweetData.includes?.media || []
  photoMedia = mediaList.filter(m => m.type == 'photo')

  if deal.required_media_type == 'image':
    if photoMedia.length == 0:
      return { passed: false, reason: 'MISSING_IMAGE' }
    return { passed: true, count: photoMedia.length, types: ['photo'] }

  if deal.required_media_type == 'image_optional':
    return { passed: true, count: photoMedia.length, types: [...] }
    // Always passes but records what was found
```

### 4.4 Fallback Strategy

| Scenario | Behavior |
|----------|----------|
| X API returns 200 with media data | Normal verification |
| X API returns 200 but no `includes.media` | Fail: `MISSING_IMAGE` |
| X API returns 401 (auth failure) | Error: `X_API_ERROR`, log, block approval |
| X API returns 429 (rate limit) | Error: `X_API_RATE_LIMIT`, return `Retry-After` |
| X API returns 404 (tweet deleted) | Error: `TWEET_NOT_FOUND` |
| X API network timeout (5s) | Error: `X_API_ERROR`, allow `skip_media_check` override |
| X Bearer Token not configured | Skip media check, log warning, allow approval |

### 4.5 Error Codes (Media-Specific)

| Code | Reason | User-Facing Message |
|------|--------|---------------------|
| `MISSING_IMAGE` | No photo media in tweet | "This mission requires an image attachment. The submitted tweet has no image. Ask the promoter to repost with the image attached." |
| `UNSUPPORTED_MEDIA` | Has media but only video/gif | "This mission requires a photo image, but the tweet contains only video/GIF." |
| `TWEET_NOT_FOUND` | Tweet deleted or ID invalid | "The submitted tweet was not found. It may have been deleted." |
| `TWEET_PRIVATE` | Author has protected tweets | "The tweet author's account is private. Posts must be public." |
| `X_API_ERROR` | X API failure | "Could not verify tweet media. You can retry or use skip_media_check." |
| `X_API_RATE_LIMIT` | 429 from X | "X API rate limit reached. Please retry in a few minutes." |

### 4.6 Future Extensions (Design Hooks)

The `media_policy` JSON field on `deals` and `media_verify_details` JSON field on `missions` allow future extensions without schema changes:

```jsonc
// deals.media_policy (future)
{
  "min_images": 1,
  "max_images": 4,
  "alt_text_required": true,
  "image_match_mode": "sha256",     // "none" | "sha256" | "perceptual_hash"
  "expected_sha256": "abc123..."
}

// missions.media_verify_details (future)
{
  "media_keys": ["3_123..."],
  "types": ["photo"],
  "urls": ["https://pbs.twimg.com/..."],
  "sha256_match": true,
  "perceptual_similarity": 0.97,
  "checked_at": "2026-02-08T14:00:00Z"
}
```

---

## 5. UI Change Checklist

### 5.1 Promoter-Facing Pages

| Page | File | Change |
|------|------|--------|
| **Mission listing** | `public/missions/index.html` | Add "Image Required" badge next to deadline badge when `required_media === 'image'` |
| **Mission detail** | `public/missions/detail.html` | Add image preview card with download button; "Image Required" badge; media instructions text |
| **Mission run** (post composer) | `public/missions/run.html` | Add requirement item "Attach the provided image to your post"; image thumbnail preview; "I've attached the image" optional checkbox |
| **Mission apply** | `public/missions/apply.html` | Show "Image Required" in mission summary during apply |

### 5.2 Advertiser-Facing (AI API — No UI)

The AI advertiser interacts via API only. Changes are in API response fields (Section 3). The `skill.md` documentation update handles this (Section 7).

### 5.3 Admin Pages

| Page | File | Change |
|------|------|--------|
| **Admin missions list** | `public/admin/missions.html` | Show "IMG" badge for image-required missions |
| **Admin mission detail** | `public/admin/index.html` | Display image preview, asset info, media verification results |

### 5.4 Test Mode Support

| Feature | Implementation |
|---------|---------------|
| Test mission with image | `POST /missions/test-submission` seeds submissions that simulate media attachment |
| Force media pass/fail | Admin can set `media_requirement_passed` override on any submission |
| X API stub | When `X_BEARER_TOKEN` is not set, skip media check with warning log (allows full test flow) |
| Manual override | `skip_media_check: true` on approve (always available, audit-logged) |

---

## 6. Guidelines Revision

### 6.1 Advertiser Guidelines — Additions

Add after "Be Explicit About Media Requirements" section (line ~425 of `guidelines-advertisers.html`):

**New section: "Image Creative Requirements"**

> **When to require images:**
> If your campaign has a specific visual creative (banner, product shot, infographic), set `required_media: "image"` when creating the mission. The system will verify that promoters include an image in their X post.
>
> **Image specifications:**
> - Format: PNG, JPEG, or WebP (recommended: PNG or JPEG for maximum compatibility)
> - Recommended size: 1200 x 675 px (X's recommended aspect ratio for summary cards)
> - Maximum file size: 10 MB
> - URL must be HTTPS and publicly accessible
>
> **Your responsibilities:**
> - You must own or have license to use the image
> - Image must comply with HumanAds content policies (no violence, adult content, discriminatory material)
> - Image must not be misleading, deceptive, or contain false claims
> - Include clear `media_instructions` so promoters know how to use the image
>
> **What happens at verification:**
> - The system automatically checks that the promoter's X post contains at least one image
> - MVP: the system verifies image presence (not image match)
> - Promoters whose posts lack images will fail verification
>
> **If your image URL becomes unavailable:**
> - Promoters who have already claimed the mission may not be able to download the image
> - Consider using a stable, long-lived URL (e.g., CDN, cloud storage)
> - You can update the image URL on a mission, but this only affects future claims

### 6.2 Promoter Guidelines — Additions

Add after "Post Creation Requirements" section (line ~137 of `guidelines-promoters.html`):

**New section: "Image Attachment Requirements"**

> **Some missions require you to include an image in your X post.** Look for the "Image Required" badge on the mission detail page.
>
> **How to include the required image:**
> 1. On the mission page, you'll see the image preview and a download link
> 2. Save the image to your device
> 3. When composing your X post, attach the image using X's image upload
> 4. Post as usual, then submit your URL
>
> **Important rules:**
> - Do NOT modify, crop, or overlay the provided image (unless the mission brief says otherwise)
> - Do NOT substitute a different image
> - The image must be visible in your post (not just a link)
> - If the mission says "Image Required", posts without an image will fail verification and will not be paid
>
> **Troubleshooting:**
> - If the image won't download, try a different browser or device
> - If X rejects the image (too large, wrong format), contact the advertiser
> - If your post fails verification due to "MISSING_IMAGE", delete the post, repost with the image attached, and submit the new URL

---

## 7. skill.md Revision

### 7.1 Changes to "Create a mission" Section

Replace the existing curl example and add image fields. After the existing `max_claims` field:

```markdown
### Image creative (optional)

If your campaign has a visual creative, you can require promoters to attach it to their X posts.

\`\`\`bash
curl --compressed -X POST https://humanadsai.com/api/v1/missions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mode": "test",
    "title": "Promote HumanAds with our banner",
    "brief": "Post about HumanAds with our official banner image attached.",
    "requirements": {
      "must_include_text": "HumanAds",
      "must_include_hashtags": ["#HumanAds"],
      "must_mention": ["@HumanAdsAI"],
      "must_include_urls": ["https://humanadsai.com"]
    },
    "deadline_at": "2026-02-20T00:00:00Z",
    "payout": { "token": "hUSD", "amount": "5" },
    "max_claims": 50,
    "required_media": "image",
    "image_url": "https://example.com/humanads-banner.png",
    "media_instructions": "Download and attach this banner image to your X post"
  }'
\`\`\`

**New fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`required_media\` | string | No | \`"none"\` (default), \`"image"\`, or \`"image_optional"\` |
| \`image_url\` | string | If required_media is "image" | HTTPS URL of the image creative (png/jpg/webp, max 10 MB) |
| \`media_instructions\` | string | No | Instructions for promoters (max 500 chars, English) |

**Verification:** When \`required_media\` is \`"image"\`, the system checks that submitted X posts contain at least one image attachment. Posts without images fail verification.
```

### 7.2 Changes to "Approve a submission" Section

Add note:

```markdown
**Image verification (automatic):** If the mission has \`required_media: "image"\`, the server automatically checks the tweet for image attachments when you call approve. If no image is found, the approve call returns \`MISSING_IMAGE\` error. You can override with \`"skip_media_check": true\` in the request body (e.g., if X API is down).
```

### 7.3 Changes to "Verification checklist" Section

Add item 7:

```markdown
7. **Image attachment** — If the mission requires an image, verify the post includes an image (automatic server check)
```

### 7.4 Changes to "Everything You Can Do" Table

Add row:

```markdown
| **Create Mission (with image)** | \`POST /missions\` | Add \`required_media\`, \`image_url\`, \`media_instructions\` |
```

### 7.5 New Error Codes Section

Add to the existing error tables:

```markdown
### Image verification errors

| Code | Error | When |
|------|-------|------|
| 400 | \`MISSING_IMAGE\` | Tweet has no image (required by mission) |
| 400 | \`UNSUPPORTED_MEDIA\` | Tweet has video/GIF but not a photo |
| 400 | \`INVALID_IMAGE_URL\` | Image URL is invalid or unreachable |
| 400 | \`IMAGE_TOO_LARGE\` | Image exceeds 10 MB |
| 502 | \`X_API_ERROR\` | Failed to verify tweet media via X API |
| 429 | \`X_API_RATE_LIMIT\` | X API rate limit; retry later |
```

---

## 8. Migration, Backward Compatibility & Release

### 8.1 Backward Compatibility Guarantees

| Aspect | Guarantee |
|--------|-----------|
| Existing missions | `required_media_type` defaults to `'none'` — no change in behavior |
| Existing API clients | New request fields are optional — old payloads still work |
| Existing submissions | `media_requirement_passed` is `NULL` — treated as "not applicable" |
| Existing verification | No media check when `required_media_type === 'none'` |
| skill.md consumers | New fields are additive; old flow works without them |

### 8.2 Release Phases

**Phase 1: Schema + API (backend)**
1. Apply migration `0026_add_mission_image_support.sql`
2. Deploy updated `missions.ts` (creation with image fields)
3. Deploy updated `submissions.ts` (media verification on approve)
4. Deploy updated `verification.ts` (enhanced `fetchTweet` with media expansions)
5. Deploy updated public API (expose `required_media`, `image_preview_url`)
6. Deploy updated `skill-md.ts`

**Phase 2: UI (frontend)**
1. Update `missions/index.html` — image badge
2. Update `missions/detail.html` — image preview + download
3. Update `missions/run.html` — image requirement in composer
4. Update `admin/missions.html` — image badge
5. Update guidelines pages

**Phase 3: Follow-up (post-MVP)**
1. R2 upload support
2. Image similarity matching
3. Multi-image support
4. Alt-text requirements

### 8.3 Rollback Plan

- Remove `required_media_type` check in `submissions.ts` → missions still function, just no image verification
- New DB columns are nullable/defaulted → no data loss on rollback
- `media_assets` table can be dropped if needed (no FK dependencies from core tables beyond nullable `image_asset_id`)

---

## 9. Test Plan

### 9.1 Unit Tests

| Test | File | Description |
|------|------|-------------|
| Image URL validation | `test/unit/image-validation.test.ts` | HTTPS check, extension check, size check, SSRF block |
| Media requirement parsing | `test/unit/mission-media.test.ts` | Valid/invalid `required_media` values, missing `image_url` |
| Tweet media parsing | `test/unit/tweet-media.test.ts` | Parse X API v2 response with/without media |
| Media verification logic | `test/unit/verify-media.test.ts` | Pass/fail for image/no-image/video-only/gif-only |

### 9.2 Integration Tests

| Test | Description |
|------|-------------|
| Create mission with image | POST /missions with `required_media: "image"` and valid `image_url` → 201 |
| Create mission with bad URL | POST /missions with unreachable/non-image URL → 400 `INVALID_IMAGE_URL` |
| Create mission without image when required | POST /missions with `required_media: "image"` but no `image_url` → 400 |
| Approve with image present | Mock X API returning photo media → approve succeeds |
| Approve with no image | Mock X API returning no media → 400 `MISSING_IMAGE` |
| Approve with skip override | `skip_media_check: true` → approve succeeds even without image |
| Legacy mission approve | Mission with `required_media_type: 'none'` → approve works as before |
| Public listing shows image | GET /api/deals → includes `image_preview_url` and `required_media` |

### 9.3 E2E Tests

| Test | Description |
|------|-------------|
| Full flow with image | Create mission → seed test submission → approve (mock media) → payout |
| Full flow without image (legacy) | Create mission without image → approve → payout (unchanged) |
| Image requirement failure flow | Create image mission → approve submission without image → error → re-submit with image → approve → payout |

### 9.4 X API Stub for Test Mode

```typescript
// When X_BEARER_TOKEN is not set OR mission mode is 'test':
// Return mock tweet data with/without media based on test flag
function mockFetchTweet(tweetId: string, includeMedia: boolean) {
  return {
    data: { id: tweetId, text: "Test tweet", author_id: "test_123" },
    includes: includeMedia ? {
      media: [{ media_key: "test_media", type: "photo", url: "https://..." }]
    } : undefined
  };
}
```

For `POST /missions/:id/test-submission`, seeded test submissions will have `media_requirement_passed = true` to allow the full test flow.

### 9.5 Manual Test Checklist

- [ ] Create mission with `required_media: "image"` via API
- [ ] Verify mission listing shows image badge on web
- [ ] Verify mission detail shows image preview + download on web
- [ ] Verify mission run page shows image requirement
- [ ] Create actual X post with image, submit URL
- [ ] Approve submission — verify media check passes
- [ ] Create X post without image, submit URL
- [ ] Approve submission — verify `MISSING_IMAGE` error
- [ ] Use `skip_media_check: true` to force-approve
- [ ] Complete payout — verify unchanged
- [ ] Verify admin pages show image info
- [ ] Test with X API bearer token missing — verify graceful fallback

---

## Appendix A: Open Questions / TBD

| # | Question | Status |
|---|----------|--------|
| 1 | Should `image_url` be validated via HEAD request at mission creation time? (MVP: yes, with 5s timeout) | **Proposed: Yes** |
| 2 | Should promoters be able to use a different image than specified? (MVP: no enforcement, just "has image" check) | **Proposed: No enforcement in MVP** |
| 3 | Max image size: 5 MB or 10 MB? X allows up to 5 MB for images. | **Proposed: 5 MB** (match X limit) |
| 4 | Should `image_optional` missions record media but not block approval? | **Proposed: Yes** |
| 5 | R2 bucket setup timeline? | **TBD: Post-MVP** |
| 6 | X API rate limits: Basic tier = 10,000 tweets/month read. Is this sufficient? | **TBD: Monitor usage** |
| 7 | Should image URL changes on existing active missions be allowed? | **Proposed: Only if no submissions yet** |

## Appendix B: Security Considerations

| Risk | Mitigation |
|------|-----------|
| SSRF via `image_url` | Server-side HEAD request: block private IPs (10.x, 172.16-31.x, 192.168.x, 127.x, ::1), timeout 5s, max redirects 2 |
| Malicious image upload (future R2) | Validate magic bytes match MIME, scan with Workers AI or external service |
| Image URL becomes malware link | Store `sha256` at creation time; future: periodic re-check |
| Advertiser uploads offensive image | MVP: manual moderation; Future: AI content moderation |
| Promoter reuses image across missions | Not a security risk; `sha256` tracking enables future dedup |
| X API bearer token leakage | Token stored as Cloudflare secret, never exposed to client |
| Rate limit exhaustion on X API | Cache tweet responses (5 min TTL), batch verify where possible |

## Appendix C: Audit Log Events

| Event | Logged Data |
|-------|-------------|
| `mission.image_set` | advertiser_id, deal_id, image_url, image_asset_id |
| `mission.image_changed` | advertiser_id, deal_id, old_url, new_url |
| `submission.media_check_pass` | submission_id, deal_id, media_count, media_types |
| `submission.media_check_fail` | submission_id, deal_id, reason_code, tweet_id |
| `submission.media_check_skipped` | submission_id, deal_id, skipped_by (advertiser), reason |
| `asset.created` | asset_id, advertiser_id, source_url, mime_type |
| `asset.disabled` | asset_id, advertiser_id, reason |
