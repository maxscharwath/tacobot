/**
 * Create group order use case
 * @module application/use-cases/group-orders
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';
import { GroupOrder } from '../../../domain/entities/group-order.entity';
import { IGroupOrderRepository } from '../../../domain/repositories/group-order.repository.interface';
import { ValidationError } from '../../../utils/errors';
import { inject } from '../../../utils/inject';
import { logger } from '../../../utils/logger';
import { CreateGroupOrderRequestDto } from '../../dtos/group-order.dto';

/**
 * Create group order use case
 */
@injectable()
export class CreateGroupOrderUseCase {
  constructor(
    private readonly groupOrderRepository: IGroupOrderRepository = inject('IGroupOrderRepository') as IGroupOrderRepository
  ) {}

  async execute(leaderId: string, request: CreateGroupOrderRequestDto): Promise<GroupOrder> {
    // Validate dates
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new ValidationError('Invalid date format. Use ISO date strings.');
    }

    if (startDate >= endDate) {
      throw new ValidationError('End date must be after start date');
    }

    if (startDate < new Date()) {
      throw new ValidationError('Start date cannot be in the past');
    }

    const groupOrderId = uuidv4();

    const groupOrder = await this.groupOrderRepository.create({
      groupOrderId,
      name: request.name,
      leaderId,
      startDate,
      endDate,
    });

    logger.info('Group order created', {
      groupOrderId,
      leaderId,
      startDate: request.startDate,
      endDate: request.endDate,
    });

    return groupOrder;
  }
}
