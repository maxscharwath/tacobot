/**
 * Update user payment status use case
 * Allows a user to mark their own order as paid/unpaid
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
export class UpdateUserOrderUserPaymentStatusUseCase {
  private readonly groupOrderRepository = inject(GroupOrderRepository);
  private readonly userOrderRepository = inject(UserOrderRepository);

  async execute(
    groupOrderId: GroupOrderId,
    userOrderId: UserOrderId,
    requesterId: UserId,
    paid: boolean
  ): Promise<UserOrder> {
    const [groupOrder, userOrder] = await Promise.all([
      this.groupOrderRepository.findById(groupOrderId),
      this.userOrderRepository.findById(userOrderId),
    ]);

    if (!groupOrder) {
      throw new NotFoundError({ resource: 'GroupOrder', id: groupOrderId });
    }

    if (!userOrder || userOrder.groupOrderId !== groupOrderId) {
      throw new NotFoundError({ resource: 'UserOrder', id: userOrderId });
    }

    if (userOrder.userId !== requesterId) {
      throw new ValidationError({ requesterId }, 'errors.orders.modify.invalidStatus');
    }

    const paidAt = paid ? new Date() : null;
    const paidByUserId = paid ? requesterId : null;

    return this.userOrderRepository.update(userOrderId, {
      paidByUser: paid,
      paidByUserAt: paidAt,
      paidByUserId,
    });
  }
}
