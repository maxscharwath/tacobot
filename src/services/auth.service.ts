/**
 * Authentication service with JWT bearer tokens
 * @module services/auth
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../database/user.repository';
import { ValidationError } from '../utils/errors';
import { inject } from '../utils/inject';
import { logger } from '../utils/logger';

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
}

/**
 * Authentication service
 */
@injectable()
export class AuthService {
  private readonly userRepository = inject(UserRepository);
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate a JWT token for a user
   */
  generateToken(user: { id: string; username: string; email: string }): string {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
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

  /**
   * Register a new user
   */
  async register(username: string, email: string, password: string): Promise<{ user: { id: string; username: string; email: string }; token: string }> {
    // Validate input
    if (!username || username.trim().length < 3) {
      throw new ValidationError('Username must be at least 3 characters long');
    }

    if (!email || !email.includes('@')) {
      throw new ValidationError('Valid email is required');
    }

    if (!password || password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByUsernameOrEmail(username, email);
    if (existingUser) {
      throw new ValidationError('Username or email already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const user = await this.userRepository.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
    });

    // Generate token
    const token = this.generateToken(user);

    logger.info('User registered', { userId: user.id, username: user.username });

    return { user, token };
  }

  /**
   * Login a user
   */
  async login(usernameOrEmail: string, password: string): Promise<{ user: { id: string; username: string; email: string }; token: string }> {
    if (!usernameOrEmail || !password) {
      throw new ValidationError('Username/email and password are required');
    }

    // Find user by username or email
    const user = await this.userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);
    if (!user) {
      throw new ValidationError('Invalid credentials');
    }

    // Verify password
    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new ValidationError('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    logger.info('User logged in', { userId: user.id, username: user.username });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    };
  }
}
