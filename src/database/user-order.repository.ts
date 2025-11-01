/**
 * User order repository
 * @module database/user-order
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { UserOrder, UserOrderItems, UserOrderStatus } from '../types';
import { inject } from '../utils/inject';
import { logger } from '../utils/logger';
import { PrismaService } from './prisma.service';

/**
 * Repository for managing user orders within group orders
 */
@injectable()
export class UserOrderRepository {
  private readonly prisma = inject(PrismaService);

  /**
   * Get user order by groupOrderId and userId
   */
  async getUserOrder(groupOrderId: string, userId: string): Promise<UserOrder | null> {
    try {
      const userOrder = await this.prisma.client.userOrder.findUnique({
        where: {
          groupOrderId_userId: {
            groupOrderId,
            userId,
          },
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });

      if (!userOrder) {
        return null;
      }

      return this.mapToUserOrder(userOrder);
    } catch (error) {
      logger.error('Failed to get user order', { groupOrderId, userId, error });
      return null;
    }
  }

  /**
   * Get all user orders for a group order
   */
  async getUserOrdersByGroup(groupOrderId: string): Promise<UserOrder[]> {
    try {
      const userOrders = await this.prisma.client.userOrder.findMany({
        where: { groupOrderId },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return userOrders.map((uo) => this.mapToUserOrder(uo));
    } catch (error) {
      logger.error('Failed to get user orders', { groupOrderId, error });
      return [];
    }
  }

  /**
   * Create or update user order
   */
  async upsertUserOrder(
    groupOrderId: string,
    userId: string,
    items: UserOrderItems,
    status: UserOrderStatus = UserOrderStatus.DRAFT
  ): Promise<UserOrder> {
    try {
      const userOrder = await this.prisma.client.userOrder.upsert({
        where: {
          groupOrderId_userId: {
            groupOrderId,
            userId,
          },
        },
        create: {
          groupOrderId,
          userId,
          items: JSON.stringify(items),
          status,
        },
        update: {
          items: JSON.stringify(items),
          status,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });

      logger.debug('User order upserted', { groupOrderId, userId });
      return this.mapToUserOrder(userOrder);
    } catch (error) {
      logger.error('Failed to upsert user order', { groupOrderId, userId, error });
      throw error;
    }
  }

  /**
   * Update user order status
   */
  async updateUserOrderStatus(
    groupOrderId: string,
    username: string,
    status: UserOrderStatus
  ): Promise<UserOrder> {
    try {
      const userOrder = await this.prisma.client.userOrder.update({
        where: {
          groupOrderId_username: {
            groupOrderId,
            username,
          },
        },
        data: {
          status,
          updatedAt: new Date(),
        },
      });

      logger.debug('User order status updated', { groupOrderId, username, status });
      return this.mapToUserOrder(userOrder);
    } catch (error) {
      logger.error('Failed to update user order status', { groupOrderId, username, error });
      throw error;
    }
  }

  /**
   * Delete user order
   */
  async deleteUserOrder(groupOrderId: string, username: string): Promise<void> {
    try {
      await this.prisma.client.userOrder.delete({
        where: {
          groupOrderId_username: {
            groupOrderId,
            username,
          },
        },
      });
      logger.info('User order deleted', { groupOrderId, username });
    } catch (error) {
      logger.error('Failed to delete user order', { groupOrderId, username, error });
      throw error;
    }
  }

  /**
   * Check if user order exists
   */
  async hasUserOrder(groupOrderId: string, username: string): Promise<boolean> {
    try {
      const count = await this.prisma.client.userOrder.count({
        where: {
          groupOrderId,
          username,
        },
      });
      return count > 0;
    } catch (error) {
      logger.error('Failed to check user order existence', { groupOrderId, username, error });
      return false;
    }
  }

  /**
   * Get count of submitted user orders for a group order
   */
  async getSubmittedCount(groupOrderId: string): Promise<number> {
    try {
      return await this.prisma.client.userOrder.count({
        where: {
          groupOrderId,
          status: UserOrderStatus.SUBMITTED,
        },
      });
    } catch (error) {
      logger.error('Failed to get submitted count', { groupOrderId, error });
      return 0;
    }
  }

  /**
   * Map database model to UserOrder
   */
  private mapToUserOrder(userOrder: {
    id: string;
    groupOrderId: string;
    userId: string;
    status: string;
    items: string;
    createdAt: Date;
    updatedAt: Date;
    user?: {
      username: string;
    };
  }): UserOrder {
    return {
      id: userOrder.id,
      groupOrderId: userOrder.groupOrderId,
      userId: userOrder.userId,
      username: userOrder.user?.username,
      status: userOrder.status as UserOrderStatus,
      items: JSON.parse(userOrder.items) as UserOrderItems,
      createdAt: userOrder.createdAt,
      updatedAt: userOrder.updatedAt,
    };
  }
}
