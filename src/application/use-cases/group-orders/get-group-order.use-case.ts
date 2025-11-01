/**
 * Get group order use case
 * @module application/use-cases/group-orders
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { GroupOrder } from '../../../domain/entities/group-order.entity';
import { IGroupOrderRepository } from '../../../domain/repositories/group-order.repository.interface';
import { NotFoundError } from '../../../utils/errors';
import { inject } from '../../../utils/inject';

/**
 * Get group order use case
 */
@injectable()
export class GetGroupOrderUseCase {
  constructor(
    private readonly groupOrderRepository: IGroupOrderRepository = inject('IGroupOrderRepository') as IGroupOrderRepository
  ) {}

  async execute(groupOrderId: string): Promise<GroupOrder> {
    const groupOrder = await this.groupOrderRepository.findById(groupOrderId);
    if (!groupOrder) {
      throw new NotFoundError(`Group order not found: ${groupOrderId}`);
    }
    return groupOrder;
  }
}
