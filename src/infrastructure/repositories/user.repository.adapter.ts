/**
 * User repository adapter (infrastructure layer)
 * Implements domain repository interface using Prisma
 * @module infrastructure/repositories/user
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { PrismaService } from '../../database/prisma.service';
import { inject } from '../../utils/inject';
import { logger } from '../../utils/logger';

/**
 * User repository adapter
 * Implements domain repository interface using Prisma
 */
@injectable()
export class UserRepositoryAdapter implements IUserRepository {
  private readonly prisma = inject(PrismaService);

  async create(data: { username: string; slackId?: string }): Promise<User> {
    try {
      const dbUser = await this.prisma.client.user.create({
        data: {
          username: data.username,
          slackId: data.slackId,
        },
      });

      return this.mapToEntity(dbUser);
    } catch (error) {
      logger.error('Failed to create user', { username: data.username, error });
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const dbUser = await this.prisma.client.user.findUnique({
        where: { id },
      });

      return dbUser ? this.mapToEntity(dbUser) : null;
    } catch (error) {
      logger.error('Failed to find user by ID', { id, error });
      return null;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const dbUser = await this.prisma.client.user.findUnique({
        where: { username },
      });

      return dbUser ? this.mapToEntity(dbUser) : null;
    } catch (error) {
      logger.error('Failed to find user by username', { username, error });
      return null;
    }
  }

  async findBySlackId(slackId: string): Promise<User | null> {
    try {
      const dbUser = await this.prisma.client.user.findFirst({
        where: { slackId },
      });

      return dbUser ? this.mapToEntity(dbUser) : null;
    } catch (error) {
      logger.error('Failed to find user by Slack ID', { slackId, error });
      return null;
    }
  }

  async updateSlackId(userId: string, slackId: string): Promise<User> {
    try {
      const dbUser = await this.prisma.client.user.update({
        where: { id: userId },
        data: { slackId },
      });

      return this.mapToEntity(dbUser);
    } catch (error) {
      logger.error('Failed to update Slack ID', { userId, slackId, error });
      throw error;
    }
  }

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
   * Map database model to domain entity
   */
  private mapToEntity(dbUser: {
    id: string;
    username: string;
    slackId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      dbUser.id,
      dbUser.username,
      dbUser.slackId || undefined,
      dbUser.createdAt,
      dbUser.updatedAt
    );
  }
}
