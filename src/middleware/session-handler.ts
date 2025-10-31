/**
 * Session handling middleware - Auto-creates sessions transparently
 * @module middleware/session-handler
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sessionService } from '../services';
import { logger } from '../utils/logger';

// Extend Express Request to include sessionId
declare global {
  namespace Express {
    interface Request {
      sessionId: string;
    }
  }
}

/**
 * Session handler middleware
 * Extracts sessionId from header/query or creates new one
 */
export async function sessionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Try to get sessionId from:
    // 1. X-Session-Id header
    // 2. sessionId query parameter
    // 3. Auto-generate new UUID
    let sessionId =
      req.headers['x-session-id'] as string ||
      req.query.sessionId as string ||
      uuidv4();

    // Check if session exists
    const sessionExists = await sessionService.hasSession(sessionId);

    if (!sessionExists) {
      // Auto-create session
      logger.info('Auto-creating session', { sessionId });
      await sessionService.createSession({
        sessionId,
        metadata: {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          createdFrom: 'auto',
        },
      });
    }

    // Attach sessionId to request
    req.sessionId = sessionId;

    // Send sessionId back in response header
    res.setHeader('X-Session-Id', sessionId);

    next();
  } catch (error) {
    logger.error('Session handler error', { error });
    next(error);
  }
}

/**
 * Optional: Session cleanup middleware (for DELETE operations)
 */
export async function sessionCleanup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Store original send function
  const originalSend = res.send;

  // Override send to cleanup after successful order
  res.send = function (body: unknown): Response {
    // If this was a successful order creation, optionally mark session for cleanup
    if (req.method === 'POST' && req.path.includes('/orders')) {
      const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
      if ((responseBody as { success?: boolean }).success) {
        // Optional: Schedule session deletion after 1 hour
        setTimeout(() => {
          void sessionService.deleteSession(req.sessionId);
        }, 60 * 60 * 1000);
      }
    }

    return originalSend.call(this, body);
  };

  next();
}

export default sessionHandler;
