/**
 * Group order repository adapter (infrastructure layer)
 * @module infrastructure/repositories/group-order
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { GroupOrder } from '../../domain/entities/group-order.entity';
import { IGroupOrderRepository } from '../../domain/repositories/group-order.repository.interface';
import { GroupOrderStatus } from '../../types';
import { PrismaService } from '../../database/prisma.service';
import { inject } from '../../utils/inject';
import { logger } from '../../utils/logger';

/**
 * Group order repository adapter
 */
@injectable()
export class GroupOrderRepositoryAdapter implements IGroupOrderRepository {
  private readonly prisma = inject(PrismaService);

  async create(data: {
    groupOrderId: string;
    name?: string;
    leaderId: string;
    startDate: Date;
    endDate: Date;
  }): Promise<GroupOrder> {
    try {
      const dbGroupOrder = await this.prisma.client.groupOrder.create({
        data: {
          groupOrderId: data.groupOrderId,
          name: data.name,
          leaderId: data.leaderId,
          startDate: data.startDate,
          endDate: data.endDate,
          status: GroupOrderStatus.OPEN,
        },
      });

      logger.debug('Group order created', { groupOrderId: data.groupOrderId });
      return this.mapToEntity(dbGroupOrder);
    } catch (error) {
      logger.error('Failed to create group order', { groupOrderId: data.groupOrderId, error });
      throw error;
    }
  }

  async findById(groupOrderId: string): Promise<GroupOrder | null> {
    try {
      const dbGroupOrder = await this.prisma.client.groupOrder.findUnique({
        where: { groupOrderId },
      });

      return dbGroupOrder ? this.mapToEntity(dbGroupOrder) : null;
    } catch (error) {
      logger.error('Failed to get group order', { groupOrderId, error });
      return null;
    }
  }

  async update(
    groupOrderId: string,
    updates: Partial<Pick<GroupOrder, 'name' | 'status' | 'startDate' | 'endDate'>>
  ): Promise<GroupOrder> {
    try {
      const dbGroupOrder = await this.prisma.client.groupOrder.update({
        where: { groupOrderId },
        data: {
          ...(updates.name !== undefined && { name: updates.name }),
          ...(updates.status !== undefined && { status: updates.status }),
          ...(updates.startDate !== undefined && { startDate: updates.startDate }),
          ...(updates.endDate !== undefined && { endDate: updates.endDate }),
          updatedAt: new Date(),
        },
      });

      logger.debug('Group order updated', { groupOrderId });
      return this.mapToEntity(dbGroupOrder);
    } catch (error) {
      logger.error('Failed to update group order', { groupOrderId, error });
      throw error;
    }
  }

  async exists(groupOrderId: string): Promise<boolean> {
    try {
      const count = await this.prisma.client.groupOrder.count({
        where: { groupOrderId },
      });
      return count > 0;
    } catch (error) {
      logger.error('Failed to check group order existence', { groupOrderId, error });
      return false;
    }
  }

  async delete(groupOrderId: string): Promise<void> {
    try {
      await this.prisma.client.groupOrder.delete({
        where: { groupOrderId },
      });
      logger.info('Group order deleted', { groupOrderId });
    } catch (error) {
      logger.error('Failed to delete group order', { groupOrderId, error });
      throw error;
    }
  }

  /**
   * Map database model to domain entity
   */
  private mapToEntity(dbGroupOrder: {
    id: string;
    groupOrderId: string;
    name: string | null;
    leaderId: string;
    startDate: Date;
    endDate: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): GroupOrder {
    return new GroupOrder(
      dbGroupOrder.id,
      dbGroupOrder.groupOrderId,
      dbGroupOrder.leaderId,
      dbGroupOrder.startDate,
      dbGroupOrder.endDate,
      dbGroupOrder.status as GroupOrderStatus,
      dbGroupOrder.name || undefined,
      dbGroupOrder.createdAt,
      dbGroupOrder.updatedAt
    );
  }
}
