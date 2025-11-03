/**
 * Get user order use case
 * @module services/user-order
 */

import { injectable } from 'tsyringe';
import { UserOrderRepository } from '@/infrastructure/repositories/user-order.repository';
import type { GroupOrderId } from '@/schemas/group-order.schema';
import type { UserId } from '@/schemas/user.schema';
import type { UserOrder } from '@/schemas/user-order.schema';
import { NotFoundError } from '@/shared/utils/errors.utils';
import { inject } from '@/shared/utils/inject.utils';

/**
 * Get user order use case
 */
@injectable()
export class GetUserOrderUseCase {
  private readonly userOrderRepository = inject(UserOrderRepository);

  async execute(groupOrderId: GroupOrderId, userId: UserId): Promise<UserOrder> {
    const userOrder = await this.userOrderRepository.findByGroupAndUser(groupOrderId, userId);
    if (!userOrder) {
      throw new NotFoundError(
        `User order not found for user ${userId} in group order ${groupOrderId}`
      );
    }
    return userOrder;
  }
}
