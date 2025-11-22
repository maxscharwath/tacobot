import { ENV } from '@/lib/env';

/**
 * Resolve image URL using the same logic as API requests
 */
export function resolveImageUrl(imageUrl: string | null | undefined): string | undefined {
  if (!imageUrl) return undefined;
  
  // Use same logic as buildUrl in http.ts
  if (ENV.apiBaseUrl) {
    return new URL(imageUrl, ENV.apiBaseUrl).toString();
  }
  
  return imageUrl;
}

