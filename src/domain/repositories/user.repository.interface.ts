/**
 * User repository interface (domain layer)
 * @module domain/repositories/user
 */

import { User } from '../entities/user.entity';

/**
 * User repository interface
 * Defines the contract for user persistence
 */
export interface IUserRepository {
  /**
   * Create a new user
   */
  create(data: { username: string; slackId?: string }): Promise<User>;

  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by username
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Find user by Slack ID
   */
  findBySlackId(slackId: string): Promise<User | null>;

  /**
   * Update user's Slack ID
   */
  updateSlackId(userId: string, slackId: string): Promise<User>;

  /**
   * Check if user exists
   */
  exists(id: string): Promise<boolean>;
}
