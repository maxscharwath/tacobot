/**
 * Delete user order use case
 * @module application/use-cases/user-orders
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { GroupOrder } from '../../../domain/entities/group-order.entity';
import { UserOrder } from '../../../domain/entities/user-order.entity';
import { IGroupOrderRepository } from '../../../domain/repositories/group-order.repository.interface';
import { IUserOrderRepository } from '../../../domain/repositories/user-order.repository.interface';
import { GroupOrderStatus } from '../../../types';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { inject } from '../../../utils/inject';
import { logger } from '../../../utils/logger';

/**
 * Delete user order use case
 * Users can delete their own orders, leaders can delete any order in their group
 */
@injectable()
export class DeleteUserOrderUseCase {
  constructor(
    private readonly groupOrderRepository: IGroupOrderRepository = inject('IGroupOrderRepository') as IGroupOrderRepository,
    private readonly userOrderRepository: IUserOrderRepository = inject('IUserOrderRepository') as IUserOrderRepository
  ) {}

  async execute(
    groupOrderId: string,
    userId: string,
    deleterUserId: string
  ): Promise<void> {
    // Check if user is deleting their own order or if deleter is the leader
    const groupOrder = await this.groupOrderRepository.findById(groupOrderId);
    if (!groupOrder) {
      throw new NotFoundError(`Group order not found: ${groupOrderId}`);
    }

    const isLeader = groupOrder.isLeader(deleterUserId);
    const isOwnOrder = userId === deleterUserId;

    if (!isLeader && !isOwnOrder) {
      throw new ValidationError('You can only delete your own order or be the leader');
    }

    // Verify order exists
    const userOrder = await this.userOrderRepository.findByGroupAndUser(groupOrderId, userId);
    if (!userOrder) {
      throw new NotFoundError(
        `User order not found for user ${userId} in group order ${groupOrderId}`
      );
    }

    // Can only delete if group order is still open
    if (groupOrder.status !== GroupOrderStatus.OPEN) {
      throw new ValidationError(
        `Cannot delete user order. Group order status: ${groupOrder.status}`
      );
    }

    await this.userOrderRepository.delete(groupOrderId, userId);

    logger.info('User order deleted', {
      groupOrderId,
      userId,
      deletedBy: deleterUserId,
    });
  }
}
