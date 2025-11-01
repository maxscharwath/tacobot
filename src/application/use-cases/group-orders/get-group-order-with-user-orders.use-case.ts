/**
 * Get group order with user orders use case
 * @module application/use-cases/group-orders
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { GroupOrder } from '../../../domain/entities/group-order.entity';
import { UserOrder } from '../../../domain/entities/user-order.entity';
import { IGroupOrderRepository } from '../../../domain/repositories/group-order.repository.interface';
import { IUserOrderRepository } from '../../../domain/repositories/user-order.repository.interface';
import { NotFoundError } from '../../../utils/errors';
import { inject } from '../../../utils/inject';

/**
 * Get group order with user orders use case
 */
@injectable()
export class GetGroupOrderWithUserOrdersUseCase {
  constructor(
    private readonly groupOrderRepository: IGroupOrderRepository = inject('IGroupOrderRepository') as IGroupOrderRepository,
    private readonly userOrderRepository: IUserOrderRepository = inject('IUserOrderRepository') as IUserOrderRepository
  ) {}

  async execute(groupOrderId: string): Promise<{ groupOrder: GroupOrder; userOrders: UserOrder[] }> {
    const groupOrder = await this.groupOrderRepository.findById(groupOrderId);
    if (!groupOrder) {
      throw new NotFoundError(`Group order not found: ${groupOrderId}`);
    }

    const userOrders = await this.userOrderRepository.findByGroup(groupOrderId);

    return { groupOrder, userOrders };
  }
}
