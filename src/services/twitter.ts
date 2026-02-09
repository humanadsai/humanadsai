// Twitter/X API v2 — shared tweet-fetching utilities

import type { Env } from '../types';

export interface TweetMedia {
  media_key: string;
  type: 'photo' | 'animated_gif' | 'video';
  url?: string;
  preview_image_url?: string;
  width?: number;
  height?: number;
  alt_text?: string;
}

export interface TweetData {
  text: string;
  author_id: string;
  media?: TweetMedia[];
}

export interface FetchTweetResult {
  success: boolean;
  data?: TweetData;
  error?: string;
  errorCode?: string; // machine-readable code
}

/**
 * Fetch a tweet from X API v2 with media expansions.
 *
 * Returns tweet text, author_id, and any attached media.
 */
export async function fetchTweetWithMedia(
  tweetId: string,
  env: Env
): Promise<FetchTweetResult> {
  const bearerToken = (env as any).X_BEARER_TOKEN;

  if (!bearerToken) {
    console.warn('[Twitter] X_BEARER_TOKEN not configured — media check skipped');
    return { success: false, error: 'X API not configured', errorCode: 'X_API_NOT_CONFIGURED' };
  }

  try {
    const url =
      `https://api.x.com/2/tweets/${tweetId}` +
      `?tweet.fields=text,author_id,attachments` +
      `&expansions=attachments.media_keys` +
      `&media.fields=type,url,preview_image_url,width,height,alt_text`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });

    if (response.status === 404) {
      return { success: false, error: 'Tweet not found or deleted', errorCode: 'TWEET_NOT_FOUND' };
    }
    if (response.status === 401) {
      console.error('[Twitter] X API unauthorized');
      return { success: false, error: 'X API authentication failed', errorCode: 'X_API_ERROR' };
    }
    if (response.status === 429) {
      return { success: false, error: 'X API rate limit reached. Please retry in a few minutes.', errorCode: 'X_API_RATE_LIMIT' };
    }
    if (!response.ok) {
      console.error('[Twitter] X API error:', response.status);
      return { success: false, error: 'Failed to fetch tweet from X', errorCode: 'X_API_ERROR' };
    }

    const json = await response.json() as {
      data?: {
        text: string;
        author_id: string;
        attachments?: { media_keys?: string[] };
      };
      includes?: { media?: TweetMedia[] };
      errors?: Array<{ message: string }>;
    };

    if (json.errors && json.errors.length > 0) {
      return { success: false, error: json.errors[0].message, errorCode: 'X_API_ERROR' };
    }

    if (!json.data) {
      return { success: false, error: 'Tweet not found', errorCode: 'TWEET_NOT_FOUND' };
    }

    const media: TweetMedia[] = json.includes?.media || [];

    return {
      success: true,
      data: {
        text: json.data.text,
        author_id: json.data.author_id,
        media,
      },
    };
  } catch (e) {
    console.error('[Twitter] Network error:', e);
    return { success: false, error: 'Network error fetching tweet', errorCode: 'X_API_ERROR' };
  }
}

/**
 * Verify that a tweet meets a mission's media requirement.
 *
 * Returns pass/fail with details for storing in the submission record.
 */
export function verifyMediaRequirement(
  requiredMediaType: string,
  media: TweetMedia[]
): {
  passed: boolean;
  reason: string;
  detected_media_count: number;
  detected_media_types: string[];
} {
  const photoMedia = media.filter(m => m.type === 'photo');
  const allTypes = [...new Set(media.map(m => m.type))];

  if (requiredMediaType === 'none' || !requiredMediaType) {
    return { passed: true, reason: 'NO_MEDIA_REQUIRED', detected_media_count: media.length, detected_media_types: allTypes };
  }

  if (requiredMediaType === 'image') {
    if (photoMedia.length === 0) {
      if (media.length > 0) {
        return { passed: false, reason: 'UNSUPPORTED_MEDIA', detected_media_count: media.length, detected_media_types: allTypes };
      }
      return { passed: false, reason: 'MISSING_IMAGE', detected_media_count: 0, detected_media_types: [] };
    }
    return { passed: true, reason: 'IMAGE_FOUND', detected_media_count: photoMedia.length, detected_media_types: ['photo'] };
  }

  if (requiredMediaType === 'image_optional') {
    // Always passes but records what was found
    return { passed: true, reason: photoMedia.length > 0 ? 'IMAGE_FOUND' : 'IMAGE_OPTIONAL_NONE', detected_media_count: photoMedia.length, detected_media_types: allTypes };
  }

  // Unknown type — pass by default
  return { passed: true, reason: 'UNKNOWN_TYPE', detected_media_count: media.length, detected_media_types: allTypes };
}
