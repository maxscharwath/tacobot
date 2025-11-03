/**
 * Submit user order use case
 * @module services/user-order
 */

import { injectable } from 'tsyringe';
import { GroupOrderRepository } from '@/infrastructure/repositories/group-order.repository';
import { UserOrderRepository } from '@/infrastructure/repositories/user-order.repository';
import type { GroupOrderId } from '@/schemas/group-order.schema';
import type { UserId } from '@/schemas/user.schema';
import { isUserOrderEmpty, type UserOrder } from '@/schemas/user-order.schema';
import { ResourceService } from '@/services/resource/resource.service';
import { GroupOrderStatus, UserOrderStatus } from '@/shared/types/types';
import { NotFoundError, ValidationError } from '@/shared/utils/errors.utils';
import { inject } from '@/shared/utils/inject.utils';

/**
 * Submit user order use case
 */
@injectable()
export class SubmitUserOrderUseCase {
  private readonly groupOrderRepository = inject(GroupOrderRepository);
  private readonly userOrderRepository = inject(UserOrderRepository);
  private readonly resourceService = inject(ResourceService);

  async execute(groupOrderId: GroupOrderId, userId: UserId): Promise<UserOrder> {
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
    if (isUserOrderEmpty(userOrder)) {
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
        const stockItem = stock.meats.find(
          (item: { code: string; in_stock: boolean }) => item.code === meat.code
        );
        if (!stockItem?.in_stock) {
          outOfStock.push(`Meat: ${meat.code}`);
        }
      }
      for (const sauce of taco.sauces) {
        const stockItem = stock.sauces.find(
          (item: { code: string; in_stock: boolean }) => item.code === sauce.code
        );
        if (!stockItem?.in_stock) {
          outOfStock.push(`Sauce: ${sauce.code}`);
        }
      }
      for (const garniture of taco.garnitures) {
        const stockItem = stock.garnishes.find(
          (item: { code: string; in_stock: boolean }) => item.code === garniture.code
        );
        if (!stockItem?.in_stock) {
          outOfStock.push(`Garniture: ${garniture.code}`);
        }
      }
    }

    // Validate other items
    for (const extra of items.extras) {
      const stockItem = stock.extras.find(
        (item: { code: string; in_stock: boolean }) => item.code === extra.code
      );
      if (!stockItem?.in_stock) {
        outOfStock.push(`Extra: ${extra.code}`);
      }
    }

    for (const drink of items.drinks) {
      const stockItem = stock.drinks.find(
        (item: { code: string; in_stock: boolean }) => item.code === drink.code
      );
      if (!stockItem?.in_stock) {
        outOfStock.push(`Drink: ${drink.code}`);
      }
    }

    for (const dessert of items.desserts) {
      const stockItem = stock.desserts.find(
        (item: { code: string; in_stock: boolean }) => item.code === dessert.code
      );
      if (!stockItem?.in_stock) {
        outOfStock.push(`Dessert: ${dessert.code}`);
      }
    }

    if (outOfStock.length > 0) {
      throw new ValidationError('Some items are out of stock', {
        outOfStockItems: outOfStock,
      });
    }
  }
}
