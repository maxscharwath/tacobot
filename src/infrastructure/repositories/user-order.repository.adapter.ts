/**
 * User order repository adapter (infrastructure layer)
 * @module infrastructure/repositories/user-order
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { UserOrder } from '../../domain/entities/user-order.entity';
import { IUserOrderRepository } from '../../domain/repositories/user-order.repository.interface';
import { UserOrderItems, UserOrderStatus } from '../../types';
import { PrismaService } from '../../database/prisma.service';
import { inject } from '../../utils/inject';
import { logger } from '../../utils/logger';

/**
 * User order repository adapter
 */
@injectable()
export class UserOrderRepositoryAdapter implements IUserOrderRepository {
  private readonly prisma = inject(PrismaService);

  async findByGroupAndUser(groupOrderId: string, userId: string): Promise<UserOrder | null> {
    try {
      const dbUserOrder = await this.prisma.client.userOrder.findUnique({
        where: {
          groupOrderId_userId: {
            groupOrderId,
            userId,
          },
        },
      });

      return dbUserOrder ? this.mapToEntity(dbUserOrder) : null;
    } catch (error) {
      logger.error('Failed to get user order', { groupOrderId, userId, error });
      return null;
    }
  }

  async findByGroup(groupOrderId: string): Promise<UserOrder[]> {
    try {
      const dbUserOrders = await this.prisma.client.userOrder.findMany({
        where: { groupOrderId },
        orderBy: { createdAt: 'asc' },
      });

      return dbUserOrders.map((uo) => this.mapToEntity(uo));
    } catch (error) {
      logger.error('Failed to get user orders', { groupOrderId, error });
      return [];
    }
  }

  async upsert(data: {
    groupOrderId: string;
    userId: string;
    items: UserOrderItems;
    status?: UserOrderStatus;
  }): Promise<UserOrder> {
    try {
      const dbUserOrder = await this.prisma.client.userOrder.upsert({
        where: {
          groupOrderId_userId: {
            groupOrderId: data.groupOrderId,
            userId: data.userId,
          },
        },
        create: {
          groupOrderId: data.groupOrderId,
          userId: data.userId,
          items: JSON.stringify(data.items),
          status: data.status || UserOrderStatus.DRAFT,
        },
        update: {
          items: JSON.stringify(data.items),
          status: data.status || UserOrderStatus.DRAFT,
          updatedAt: new Date(),
        },
      });

      logger.debug('User order upserted', { groupOrderId: data.groupOrderId, userId: data.userId });
      return this.mapToEntity(dbUserOrder);
    } catch (error) {
      logger.error('Failed to upsert user order', { groupOrderId: data.groupOrderId, userId: data.userId, error });
      throw error;
    }
  }

  async updateStatus(
    groupOrderId: string,
    userId: string,
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
      });

      logger.debug('User order status updated', { groupOrderId, userId, status });
      return this.mapToEntity(dbUserOrder);
    } catch (error) {
      logger.error('Failed to update user order status', { groupOrderId, userId, error });
      throw error;
    }
  }

  async delete(groupOrderId: string, userId: string): Promise<void> {
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
      logger.error('Failed to delete user order', { groupOrderId, userId, error });
      throw error;
    }
  }

  async exists(groupOrderId: string, userId: string): Promise<boolean> {
    try {
      const count = await this.prisma.client.userOrder.count({
        where: {
          groupOrderId,
          userId,
        },
      });
      return count > 0;
    } catch (error) {
      logger.error('Failed to check user order existence', { groupOrderId, userId, error });
      return false;
    }
  }

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
   * Map database model to domain entity
   */
  private mapToEntity(dbUserOrder: {
    id: string;
    groupOrderId: string;
    userId: string;
    status: string;
    items: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserOrder {
    return new UserOrder(
      dbUserOrder.id,
      dbUserOrder.groupOrderId,
      dbUserOrder.userId,
      JSON.parse(dbUserOrder.items) as UserOrderItems,
      dbUserOrder.status as UserOrderStatus,
      dbUserOrder.createdAt,
      dbUserOrder.updatedAt
    );
  }
}
