/**
 * Get user order use case
 * @module application/use-cases/user-orders
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { UserOrder } from '../../../domain/entities/user-order.entity';
import { IUserOrderRepository } from '../../../domain/repositories/user-order.repository.interface';
import { NotFoundError } from '../../../utils/errors';
import { inject } from '../../../utils/inject';

/**
 * Get user order use case
 */
@injectable()
export class GetUserOrderUseCase {
  constructor(
    private readonly userOrderRepository: IUserOrderRepository = inject('IUserOrderRepository') as IUserOrderRepository
  ) {}

  async execute(groupOrderId: string, userId: string): Promise<UserOrder> {
    const userOrder = await this.userOrderRepository.findByGroupAndUser(groupOrderId, userId);
    if (!userOrder) {
      throw new NotFoundError(
        `User order not found for user ${userId} in group order ${groupOrderId}`
      );
    }
    return userOrder;
  }
}
