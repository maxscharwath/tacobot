/**
 * Submit user order use case
 * @module application/use-cases/user-orders
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { GroupOrder } from '../../../domain/entities/group-order.entity';
import { UserOrder } from '../../../domain/entities/user-order.entity';
import { IGroupOrderRepository } from '../../../domain/repositories/group-order.repository.interface';
import { IUserOrderRepository } from '../../../domain/repositories/user-order.repository.interface';
import { GroupOrderStatus, UserOrderStatus } from '../../../types';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { inject } from '../../../utils/inject';
import { ResourceService } from '../../../services/resource.service';

/**
 * Submit user order use case
 */
@injectable()
export class SubmitUserOrderUseCase {
  constructor(
    private readonly groupOrderRepository: IGroupOrderRepository = inject('IGroupOrderRepository') as IGroupOrderRepository,
    private readonly userOrderRepository: IUserOrderRepository = inject('IUserOrderRepository') as IUserOrderRepository,
    private readonly resourceService: ResourceService = inject(ResourceService)
  ) {}

  async execute(groupOrderId: string, userId: string): Promise<UserOrder> {
    // Get existing order
    const userOrder = await this.userOrderRepository.findByGroupAndUser(groupOrderId, userId);
    if (!userOrder) {
      throw new NotFoundError(
        `User order not found for user ${userId} in group order ${groupOrderId}`
      );
    }

    // Verify group order is still open
    const groupOrder = await this.groupOrderRepository.findById(groupOrderId);
    if (!groupOrder) {
      throw new NotFoundError(`Group order not found: ${groupOrderId}`);
    }

    if (groupOrder.status !== GroupOrderStatus.OPEN) {
      throw new ValidationError(
        `Cannot submit user order. Group order status: ${groupOrder.status}`
      );
    }

    // Validate that order is not empty
    if (userOrder.isEmpty()) {
      throw new ValidationError('Cannot submit an empty order');
    }

    // Re-validate availability before submitting
    await this.validateItemAvailability(userOrder.items);

    // Update status
    return await this.userOrderRepository.updateStatus(
      groupOrderId,
      userId,
      UserOrderStatus.SUBMITTED
    );
  }

  /**
   * Validate item availability
   */
  private async validateItemAvailability(items: UserOrder['items']): Promise<void> {
    const stock = await this.resourceService.getStock();
    const outOfStock: string[] = [];

    // Validate tacos
    for (const taco of items.tacos) {
      for (const meat of taco.meats) {
        if (!stock.viandes[meat.id]?.in_stock) {
          outOfStock.push(`Meat: ${meat.id}`);
        }
      }
      for (const sauce of taco.sauces) {
        if (!stock.sauces[sauce.id]?.in_stock) {
          outOfStock.push(`Sauce: ${sauce.id}`);
        }
      }
      for (const garniture of taco.garnitures) {
        if (!stock.garnitures[garniture.id]?.in_stock) {
          outOfStock.push(`Garniture: ${garniture.id}`);
        }
      }
    }

    // Validate other items
    for (const extra of items.extras) {
      if (!stock.extras[extra.id]?.in_stock) {
        outOfStock.push(`Extra: ${extra.id}`);
      }
    }

    for (const drink of items.drinks) {
      if (!stock.boissons[drink.id]?.in_stock) {
        outOfStock.push(`Drink: ${drink.id}`);
      }
    }

    for (const dessert of items.desserts) {
      if (!stock.desserts[dessert.id]?.in_stock) {
        outOfStock.push(`Dessert: ${dessert.id}`);
      }
    }

    if (outOfStock.length > 0) {
      throw new ValidationError('Some items are out of stock', {
        outOfStockItems: outOfStock,
      });
    }
  }
}
