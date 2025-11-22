/**
 * Image processing utilities
 * @module shared/utils/image
 */

import sharp from 'sharp';
import { logger } from './logger.utils';

const MAX_IMAGE_SIZE = 512; // Maximum width/height in pixels
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max file size
const QUALITY = 85; // WebP quality (0-100)
const OUTPUT_MIME_TYPE = 'image/webp';
const VALID_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);

type UploadableFile = Pick<Blob, 'arrayBuffer' | 'size' | 'type'> & { readonly name?: string };

function getMimeType(file: UploadableFile): string {
  if (file.type) {
    return file.type;
  }
  if (!file.name) {
    return '';
  }
  const extension = file.name.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return '';
  }
}

function ensureValidFile(file: UploadableFile) {
  if (!file.size || Number.isNaN(file.size)) {
    throw new Error('Image file is empty.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB limit`);
  }
  const mimeType = getMimeType(file);
  if (!VALID_TYPES.has(mimeType)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
  }
  return mimeType;
}

/**
 * Process and compress an image file.
 * Resizes to max 512x512, converts to WebP, and returns a Buffer.
 */
export async function processProfileImage(file: UploadableFile): Promise<Buffer> {
  try {
    const mimeType = ensureValidFile(file);

    // Convert File/Blob to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image with sharp - normalize orientation, resize, and convert to WebP
    const processedBuffer = await sharp(buffer)
      .rotate() // Honor EXIF orientation
      .resize(MAX_IMAGE_SIZE, MAX_IMAGE_SIZE, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })
      .toBuffer();

    logger.debug('Image processed successfully', {
      originalSize: file.size,
      processedSize: processedBuffer.length,
      compressionRatio: file.size
        ? ((1 - processedBuffer.length / file.size) * 100).toFixed(2) + '%'
        : undefined,
      originalMime: mimeType,
      outputMime: OUTPUT_MIME_TYPE,
    });

    return processedBuffer;
  } catch (error) {
    logger.error('Failed to process image', { error });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to process image');
  }
}

function toTimestamp(value?: Date | string | null): string | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value.getTime().toString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime().toString();
}

export function buildAvatarUrl(user: {
  id: string;
  hasImage?: boolean;
  updatedAt?: Date | string | null;
}): string | null {
  if (!user.hasImage) {
    return null;
  }
  const version = toTimestamp(user.updatedAt);
  const basePath = `/api/v1/users/${user.id}/avatar`;
  return version ? `${basePath}?v=${version}` : basePath;
}
