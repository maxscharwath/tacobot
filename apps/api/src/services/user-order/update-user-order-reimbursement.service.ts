/**
 * Update user order reimbursement status use case
 * @module services/user-order
 */

import { injectable } from 'tsyringe';
import { GroupOrderRepository } from '../../infrastructure/repositories/group-order.repository';
import { UserOrderRepository } from '../../infrastructure/repositories/user-order.repository';
import type { GroupOrderId } from '../../schemas/group-order.schema';
import type { UserId } from '../../schemas/user.schema';
import type { UserOrder, UserOrderId } from '../../schemas/user-order.schema';
import { NotFoundError, ValidationError } from '../../shared/utils/errors.utils';
import { inject } from '../../shared/utils/inject.utils';

@injectable()
export class UpdateUserOrderReimbursementStatusUseCase {
  private readonly groupOrderRepository = inject(GroupOrderRepository);
  private readonly userOrderRepository = inject(UserOrderRepository);

  async execute(
    groupOrderId: GroupOrderId,
    userOrderId: UserOrderId,
    requesterId: UserId,
    reimbursed: boolean
  ): Promise<UserOrder> {
    const groupOrder = await this.groupOrderRepository.findById(groupOrderId);
    if (!groupOrder) {
      throw new NotFoundError({ resource: 'GroupOrder', id: groupOrderId });
    }

    if (groupOrder.leaderId !== requesterId) {
      throw new ValidationError({ requesterId }, 'errors.orders.reimbursement.leaderOnly');
    }

    const userOrder = await this.userOrderRepository.findById(userOrderId);
    if (!userOrder || userOrder.groupOrderId !== groupOrderId) {
      throw new NotFoundError({ resource: 'UserOrder', id: userOrderId });
    }

    const reimbursedAt = reimbursed ? new Date() : null;
    return this.userOrderRepository.update(userOrderId, {
      reimbursed,
      reimbursedAt,
      reimbursedByUserId: reimbursed ? requesterId : null,
    });
  }
}
