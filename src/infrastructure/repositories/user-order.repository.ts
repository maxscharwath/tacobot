/**
 * User order repository
 * @module infrastructure/repositories/user-order
 */

import { injectable } from 'tsyringe';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import type { GroupOrderId } from '@/schemas/group-order.schema';
import type { UserId } from '@/schemas/user.schema';
import { createUserOrderFromDb, type UserOrder } from '@/schemas/user-order.schema';
import { UserOrderItems, UserOrderStatus } from '@/shared/types/types';
import { inject } from '@/shared/utils/inject.utils';
import { logger } from '@/shared/utils/logger.utils';

/**
 * User order repository
 */
@injectable()
export class UserOrderRepository {
  private readonly prisma = inject(PrismaService);

  async findByGroupAndUser(groupOrderId: GroupOrderId, userId: UserId): Promise<UserOrder | null> {
    try {
      const dbUserOrder = await this.prisma.client.userOrder.findUnique({
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

      return dbUserOrder ? createUserOrderFromDb(dbUserOrder) : null;
    } catch (error) {
      logger.error('Failed to find user order', { groupOrderId, userId, error });
      return null;
    }
  }

  async findByGroup(groupOrderId: GroupOrderId): Promise<UserOrder[]> {
    try {
      const dbUserOrders = await this.prisma.client.userOrder.findMany({
        where: { groupOrderId },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });

      return dbUserOrders.map(createUserOrderFromDb);
    } catch (error) {
      logger.error('Failed to find user orders by group', { groupOrderId, error });
      return [];
    }
  }

  async upsert(data: {
    groupOrderId: GroupOrderId;
    userId: UserId;
    items: UserOrderItems;
    status: UserOrderStatus;
  }): Promise<UserOrder> {
    try {
      const dbUserOrder = await this.prisma.client.userOrder.upsert({
        where: {
          groupOrderId_userId: {
            groupOrderId: data.groupOrderId,
            userId: data.userId,
          },
        },
        update: {
          items: JSON.stringify(data.items),
          status: data.status,
          updatedAt: new Date(),
        },
        create: {
          groupOrderId: data.groupOrderId,
          userId: data.userId,
          items: JSON.stringify(data.items),
          status: data.status,
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });

      logger.debug('User order upserted', { id: dbUserOrder.id });
      return createUserOrderFromDb(dbUserOrder);
    } catch (error) {
      logger.error('Failed to upsert user order', { error });
      throw error;
    }
  }

  async updateStatus(
    groupOrderId: GroupOrderId,
    userId: UserId,
    status: UserOrderStatus
  ): Promise<UserOrder> {
    try {
      const dbUserOrder = await this.prisma.client.userOrder.update({
        where: {
          groupOrderId_userId: {
            groupOrderId,
            userId,
          },
        },
        data: {
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

      logger.debug('User order status updated', { id: dbUserOrder.id });
      return createUserOrderFromDb(dbUserOrder);
    } catch (error) {
      logger.error('Failed to update user order status', { error });
      throw error;
    }
  }

  async delete(groupOrderId: GroupOrderId, userId: UserId): Promise<void> {
    try {
      await this.prisma.client.userOrder.delete({
        where: {
          groupOrderId_userId: {
            groupOrderId,
            userId,
          },
        },
      });
      logger.info('User order deleted', { groupOrderId, userId });
    } catch (error) {
      logger.error('Failed to delete user order', { error });
      throw error;
    }
  }
}
