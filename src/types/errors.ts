/**
 * Custom error classes for better error handling
 */

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiClientError';
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

export class CsrfTokenError extends ApiClientError {
  constructor(message = 'CSRF token invalid or expired') {
    super(message, 'CSRF_INVALID', 403);
    this.name = 'CsrfTokenError';
  }
}

export class RateLimitError extends ApiClientError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT', 403);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends ApiClientError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiClientError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class DuplicateOrderError extends ApiClientError {
  constructor(message = 'Duplicate order') {
    super(message, 'DUPLICATE_ORDER', 409);
    this.name = 'DuplicateOrderError';
  }
}
