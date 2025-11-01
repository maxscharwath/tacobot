/**
 * Create user order use case
 * @module application/use-cases/user-orders
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { GroupOrder } from '../../../domain/entities/group-order.entity';
import { UserOrder } from '../../../domain/entities/user-order.entity';
import { IGroupOrderRepository } from '../../../domain/repositories/group-order.repository.interface';
import { IUserOrderRepository } from '../../../domain/repositories/user-order.repository.interface';
import { GroupOrderStatus, UserOrderItems, UserOrderStatus } from '../../../types';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { inject } from '../../../utils/inject';
import { logger } from '../../../utils/logger';
import { ResourceService } from '../../../services/resource.service';
import {
  generateItemDeterministicUUID,
  generateTacoDeterministicUUID,
} from '../../../utils/deterministic-uuid';
import { CreateUserOrderRequestDto } from '../../dtos/user-order.dto';

/**
 * Create or update user order use case
 */
@injectable()
export class CreateUserOrderUseCase {
  constructor(
    private readonly groupOrderRepository: IGroupOrderRepository = inject('IGroupOrderRepository') as IGroupOrderRepository,
    private readonly userOrderRepository: IUserOrderRepository = inject('IUserOrderRepository') as IUserOrderRepository,
    private readonly resourceService: ResourceService = inject(ResourceService)
  ) {}

  async execute(
    groupOrderId: string,
    userId: string,
    request: CreateUserOrderRequestDto
  ): Promise<UserOrder> {
    // Get and validate group order
    const groupOrder = await this.groupOrderRepository.findById(groupOrderId);
    if (!groupOrder) {
      throw new NotFoundError(`Group order not found: ${groupOrderId}`);
    }

    if (!groupOrder.canBeModified()) {
      throw new ValidationError(
        `Cannot modify user order. Group order status: ${groupOrder.status}`
      );
    }

    // Validate and assign deterministic IDs
    const itemsWithIds = this.assignDeterministicIds(request.items);

    // Validate availability
    await this.validateItemAvailability(itemsWithIds);

    // Save user order
    const userOrder = await this.userOrderRepository.upsert({
      groupOrderId,
      userId,
      items: itemsWithIds,
      status: UserOrderStatus.DRAFT,
    });

    logger.info('User order created/updated', {
      groupOrderId,
      userId,
      itemCounts: {
        tacos: itemsWithIds.tacos.length,
        extras: itemsWithIds.extras.length,
        drinks: itemsWithIds.drinks.length,
        desserts: itemsWithIds.desserts.length,
      },
    });

    return userOrder;
  }

  /**
   * Assign deterministic IDs to items
   */
  private assignDeterministicIds(items: UserOrderItems): UserOrderItems {
    return {
      tacos: items.tacos.map((taco) => ({
        ...taco,
        id: generateTacoDeterministicUUID({
          size: taco.size,
          meats: taco.meats.map((m) => ({ id: m.id, quantity: m.quantity })),
          sauces: taco.sauces.map((s) => s.id),
          garnitures: taco.garnitures.map((g) => g.id),
          note: taco.note,
        }),
      })),
      extras: items.extras.map((extra) => ({
        ...extra,
        id: generateItemDeterministicUUID(extra.id || extra.name, extra.quantity),
      })),
      drinks: items.drinks.map((drink) => ({
        ...drink,
        id: generateItemDeterministicUUID(drink.id || drink.name, drink.quantity),
      })),
      desserts: items.desserts.map((dessert) => ({
        ...dessert,
        id: generateItemDeterministicUUID(dessert.id || dessert.name, dessert.quantity),
      })),
    };
  }

  /**
   * Validate item availability against delivery backend
   */
  private async validateItemAvailability(items: UserOrderItems): Promise<void> {
    const stock = await this.resourceService.getStock();
    const outOfStock: string[] = [];

    // Validate tacos
    for (const taco of items.tacos) {
      for (const meat of taco.meats) {
        if (!stock.viandes[meat.id]?.in_stock) {
          outOfStock.push(`Meat: ${meat.id} (${meat.name || meat.id})`);
        }
      }

      for (const sauce of taco.sauces) {
        if (!stock.sauces[sauce.id]?.in_stock) {
          outOfStock.push(`Sauce: ${sauce.id} (${sauce.name || sauce.id})`);
        }
      }

      for (const garniture of taco.garnitures) {
        if (!stock.garnitures[garniture.id]?.in_stock) {
          outOfStock.push(`Garniture: ${garniture.id} (${garniture.name || garniture.id})`);
        }
      }
    }

    // Validate other items
    for (const extra of items.extras) {
      if (!stock.extras[extra.id]?.in_stock) {
        outOfStock.push(`Extra: ${extra.id} (${extra.name || extra.id})`);
      }
    }

    for (const drink of items.drinks) {
      if (!stock.boissons[drink.id]?.in_stock) {
        outOfStock.push(`Drink: ${drink.id} (${drink.name || drink.id})`);
      }
    }

    for (const dessert of items.desserts) {
      if (!stock.desserts[dessert.id]?.in_stock) {
        outOfStock.push(`Dessert: ${dessert.id} (${dessert.name || dessert.id})`);
      }
    }

    if (outOfStock.length > 0) {
      throw new ValidationError('Some items are out of stock', {
        outOfStockItems: outOfStock,
      });
    }
  }
}
