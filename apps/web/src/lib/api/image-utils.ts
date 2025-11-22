import { ENV } from '@/lib/env';

/**
 * Convert an image URL from API response to a full URL
 * Handles both relative and absolute URLs
 */
export function resolveImageUrl(imageUrl: string | null | undefined): string | undefined {
  if (!imageUrl) return undefined;

  // If it's already an absolute URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a base64 data URL, return as-is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // If it's a relative URL, prepend API base URL
  if (ENV.apiBaseUrl) {
    return new URL(imageUrl, ENV.apiBaseUrl).toString();
  }

  // Fallback to relative URL
  return imageUrl;
}
