/**
 * Order domain entity
 * @module domain/entities/order
 */

import { OrderStatus, OrderType } from '../../types';

/**
 * Order domain entity
 */
export class Order {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly cartId: string,
    public readonly customerName: string,
    public readonly customerPhone: string,
    public readonly orderType: OrderType,
    public readonly requestedFor: string,
    public readonly status: OrderStatus,
    public readonly price?: number,
    public readonly address?: string,
    public readonly userId?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Check if order is pending
   */
  isPending(): boolean {
    return this.status === OrderStatus.PENDING;
  }

  /**
   * Check if order belongs to user
   */
  belongsTo(userId: string): boolean {
    return this.userId === userId;
  }
}
