/**
 * User repository
 * @module database/user
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { PrismaService } from './prisma.service';
import { inject } from '../utils/inject';
import { logger } from '../utils/logger';

/**
 * User data (without password hash)
 */
export interface UserData {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User with password hash (for internal use)
 */
export interface UserWithPassword extends UserData {
  passwordHash: string;
}

/**
 * Repository for managing users
 */
@injectable()
export class UserRepository {
  private readonly prisma = inject(PrismaService);

  /**
   * Create a new user
   */
  async create(data: {
    username: string;
    email: string;
    passwordHash: string;
  }): Promise<UserData> {
    try {
      const user = await this.prisma.client.user.create({
        data: {
          username: data.username,
          email: data.email,
          passwordHash: data.passwordHash,
        },
      });

      return this.mapToUserData(user);
    } catch (error) {
      logger.error('Failed to create user', { username: data.username, error });
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserData | null> {
    try {
      const user = await this.prisma.client.user.findUnique({
        where: { id },
      });

      return user ? this.mapToUserData(user) : null;
    } catch (error) {
      logger.error('Failed to find user by ID', { id, error });
      return null;
    }
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<UserWithPassword | null> {
    try {
      const user = await this.prisma.client.user.findUnique({
        where: { username },
      });

      return user ? this.mapToUserWithPassword(user) : null;
    } catch (error) {
      logger.error('Failed to find user by username', { username, error });
      return null;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    try {
      const user = await this.prisma.client.user.findUnique({
        where: { email },
      });

      return user ? this.mapToUserWithPassword(user) : null;
    } catch (error) {
      logger.error('Failed to find user by email', { email, error });
      return null;
    }
  }

  /**
   * Find user by username or email
   */
  async findByUsernameOrEmail(username: string, email: string): Promise<UserWithPassword | null> {
    try {
      const user = await this.prisma.client.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      return user ? this.mapToUserWithPassword(user) : null;
    } catch (error) {
      logger.error('Failed to find user by username or email', { username, email, error });
      return null;
    }
  }

  /**
   * Check if user exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.prisma.client.user.count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      logger.error('Failed to check user existence', { id, error });
      return false;
    }
  }

  /**
   * Map database model to UserData
   */
  private mapToUserData(user: {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserData {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Map database model to UserWithPassword
   */
  private mapToUserWithPassword(user: {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserWithPassword {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
