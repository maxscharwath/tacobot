/**
 * Group order service (refactored to use clean architecture)
 * @module services/group-order
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import {
  CreateGroupOrderUseCase,
  GetGroupOrderUseCase,
  GetGroupOrderWithUserOrdersUseCase,
} from '../application/use-cases';
import {
  CreateUserOrderUseCase,
  GetUserOrderUseCase,
  SubmitUserOrderUseCase,
  DeleteUserOrderUseCase,
} from '../application/use-cases';
import { GroupOrder } from '../domain/entities/group-order.entity';
import { UserOrder } from '../domain/entities/user-order.entity';
import { IGroupOrderRepository } from '../domain/repositories/group-order.repository.interface';
import { GroupOrderStatus, SubmitGroupOrderRequest } from '../types';
import { ValidationError } from '../utils/errors';
import { inject } from '../utils/inject';
import { logger } from '../utils/logger';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { CreateGroupOrderRequestDto } from '../application/dtos/group-order.dto';
import { CreateUserOrderRequestDto } from '../application/dtos/user-order.dto';

/**
 * Group Order Service (Application Service)
 * Orchestrates use cases for group order operations
 */
@injectable()
export class GroupOrderService {
  // Use cases
  private readonly createGroupOrderUseCase: CreateGroupOrderUseCase;
  private readonly getGroupOrderUseCase: GetGroupOrderUseCase;
  private readonly getGroupOrderWithUserOrdersUseCase: GetGroupOrderWithUserOrdersUseCase;
  private readonly createUserOrderUseCase: CreateUserOrderUseCase;
  private readonly getUserOrderUseCase: GetUserOrderUseCase;
  private readonly submitUserOrderUseCase: SubmitUserOrderUseCase;
  private readonly deleteUserOrderUseCase: DeleteUserOrderUseCase;

  // Infrastructure services (for backend submission)
  private readonly groupOrderRepository: IGroupOrderRepository;
  private readonly cartService: CartService;
  private readonly orderService: OrderService;

  constructor() {
    this.createGroupOrderUseCase = inject(CreateGroupOrderUseCase);
    this.getGroupOrderUseCase = inject(GetGroupOrderUseCase);
    this.getGroupOrderWithUserOrdersUseCase = inject(GetGroupOrderWithUserOrdersUseCase);
    this.createUserOrderUseCase = inject(CreateUserOrderUseCase);
    this.getUserOrderUseCase = inject(GetUserOrderUseCase);
    this.submitUserOrderUseCase = inject(SubmitUserOrderUseCase);
    this.deleteUserOrderUseCase = inject(DeleteUserOrderUseCase);
    this.groupOrderRepository = inject('IGroupOrderRepository') as IGroupOrderRepository;
    this.cartService = inject(CartService);
    this.orderService = inject(OrderService);
  }

  /**
   * Create a new group order
   */
  async createGroupOrder(leaderId: string, request: CreateGroupOrderRequestDto): Promise<GroupOrder> {
    return await this.createGroupOrderUseCase.execute(leaderId, request);
  }

  /**
   * Get group order by ID
   */
  async getGroupOrder(groupOrderId: string): Promise<GroupOrder> {
    return await this.getGroupOrderUseCase.execute(groupOrderId);
  }

  /**
   * Get group order with all user orders
   */
  async getGroupOrderWithUserOrders(groupOrderId: string): Promise<{
    groupOrder: GroupOrder;
    userOrders: UserOrder[];
  }> {
    return await this.getGroupOrderWithUserOrdersUseCase.execute(groupOrderId);
  }

  /**
   * Check if user is the leader of a group order
   */
  async checkIsLeader(groupOrderId: string, userId: string): Promise<boolean> {
    const groupOrder = await this.getGroupOrderUseCase.execute(groupOrderId);
    return groupOrder.isLeader(userId);
  }

  /**
   * Update group order (only leader can do this)
   */
  async updateGroupOrder(
    groupOrderId: string,
    userId: string,
    updates: Partial<Pick<GroupOrder, 'name' | 'startDate' | 'endDate'>>
  ): Promise<GroupOrder> {
    // Verify user is the leader
    const isLeader = await this.checkIsLeader(groupOrderId, userId);
    if (!isLeader) {
      throw new ValidationError('Only the group order leader can update the group order');
    }

    // Validate dates if provided
    if (updates.startDate || updates.endDate) {
      const current = await this.getGroupOrderUseCase.execute(groupOrderId);
      const startDate = updates.startDate ? new Date(updates.startDate) : current.startDate;
      const endDate = updates.endDate ? new Date(updates.endDate) : current.endDate;

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ValidationError('Invalid date format');
      }

      if (startDate >= endDate) {
        throw new ValidationError('End date must be after start date');
      }
    }

    return await this.groupOrderRepository.update(groupOrderId, updates);
  }

  /**
   * Submit group order (mark as submitted - ready for backend submission)
   */
  async submitGroupOrder(groupOrderId: string, userId: string): Promise<GroupOrder> {
    const isLeader = await this.checkIsLeader(groupOrderId, userId);
    if (!isLeader) {
      throw new ValidationError('Only the group order leader can submit the group order');
    }

    const groupOrder = await this.getGroupOrderUseCase.execute(groupOrderId);

    // Check if group order is still open
    if (groupOrder.status !== GroupOrderStatus.OPEN) {
      throw new ValidationError(
        `Cannot submit group order. Current status: ${groupOrder.status}`
      );
    }

    // Check if we're still within the date range
    if (!groupOrder.isOpenForOrders()) {
      throw new ValidationError(
        'Cannot submit group order outside of the allowed date range'
      );
    }

    // Update status to submitted
    return await this.groupOrderRepository.update(groupOrderId, {
      status: GroupOrderStatus.SUBMITTED,
    });
  }

  /**
   * Submit group order to backend (creates real cart and order)
   */
  async submitGroupOrderToBackend(
    groupOrderId: string,
    userId: string,
    request: SubmitGroupOrderRequest
  ): Promise<{ orderId: string; cartId: string }> {
    // Verify user is the leader
    const isLeader = await this.checkIsLeader(groupOrderId, userId);
    if (!isLeader) {
      throw new ValidationError('Only the group order leader can submit the group order');
    }

    const { groupOrder, userOrders } = await this.getGroupOrderWithUserOrdersUseCase.execute(groupOrderId);

    if (groupOrder.status !== GroupOrderStatus.SUBMITTED) {
      throw new ValidationError(
        'Group order must be marked as submitted before submitting to backend'
      );
    }

    // Filter only submitted orders
    const submittedOrders = userOrders.filter((uo) => uo.isSubmitted());

    if (submittedOrders.length === 0) {
      throw new ValidationError('No submitted orders to process');
    }

    logger.info('Submitting group order to backend', {
      groupOrderId,
      submittedOrdersCount: submittedOrders.length,
    });

    // Create a new cart for this group order
    const { cartId } = await this.cartService.createCart();

    try {
      // Add all items from all user orders to the cart
      for (const userOrder of submittedOrders) {
        // Add tacos
        for (const taco of userOrder.items.tacos) {
          for (let q = 0; q < taco.quantity; q++) {
            await this.cartService.addTaco(cartId, {
              size: taco.size,
              meats: taco.meats.map((m) => ({ id: m.id, quantity: m.quantity })),
              sauces: taco.sauces.map((s) => s.id),
              garnitures: taco.garnitures.map((g) => g.id),
              note: taco.note,
            });
          }
        }

        // Add extras, drinks, desserts
        for (const extra of userOrder.items.extras) {
          for (let q = 0; q < extra.quantity; q++) {
            await this.cartService.addExtra(cartId, extra);
          }
        }

        for (const drink of userOrder.items.drinks) {
          for (let q = 0; q < drink.quantity; q++) {
            await this.cartService.addDrink(cartId, drink);
          }
        }

        for (const dessert of userOrder.items.desserts) {
          for (let q = 0; q < dessert.quantity; q++) {
            await this.cartService.addDessert(cartId, dessert);
          }
        }
      }

      // Create the actual order
      const order = await this.orderService.createOrder(cartId, request, userId);

      // Update group order status to completed
      await this.groupOrderRepository.update(groupOrderId, {
        status: GroupOrderStatus.COMPLETED,
      });

      logger.info('Group order submitted to backend successfully', {
        groupOrderId,
        cartId,
        orderId: order.orderId,
      });

      return {
        orderId: order.orderId,
        cartId,
      };
    } catch (error) {
      logger.error('Failed to submit group order to backend', {
        groupOrderId,
        cartId,
        error,
      });
      throw error;
    }
  }

  /**
   * User order operations (delegate to use cases)
   */
  async createUserOrder(
    groupOrderId: string,
    userId: string,
    request: CreateUserOrderRequestDto
  ): Promise<UserOrder> {
    return await this.createUserOrderUseCase.execute(groupOrderId, userId, request);
  }

  async getUserOrder(groupOrderId: string, userId: string): Promise<UserOrder> {
    return await this.getUserOrderUseCase.execute(groupOrderId, userId);
  }

  async submitUserOrder(groupOrderId: string, userId: string): Promise<UserOrder> {
    return await this.submitUserOrderUseCase.execute(groupOrderId, userId);
  }

  async deleteUserOrder(
    groupOrderId: string,
    userId: string,
    deleterUserId: string
  ): Promise<void> {
    return await this.deleteUserOrderUseCase.execute(groupOrderId, userId, deleterUserId);
  }
}
