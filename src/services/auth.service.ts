/**
 * Authentication service with JWT bearer tokens
 * Simplified for future Slack integration
 * @module services/auth
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import * as jwt from 'jsonwebtoken';
import { ValidationError } from '../utils/errors';

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: string;
  username: string;
  slackId?: string;
}

/**
 * Authentication service
 * Handles JWT token generation and verification
 * User creation/management is handled by use cases
 */
@injectable()
export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  /**
   * Generate a JWT token for a user
   */
  generateToken(user: { id: string; username: string; slackId?: string }): string {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      ...(user.slackId && { slackId: user.slackId }),
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  /**
   * Verify and decode a JWT token
   */
  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ValidationError('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new ValidationError('Token expired');
      }
      throw new ValidationError('Token verification failed');
    }
  }

}
