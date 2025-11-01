/**
 * User order domain entity
 * @module domain/entities/user-order
 */

import { UserOrderItems, UserOrderStatus } from '../../types';

/**
 * User order domain entity
 */
export class UserOrder {
  constructor(
    public readonly id: string,
    public readonly groupOrderId: string,
    public readonly userId: string,
    public readonly items: UserOrderItems,
    public readonly status: UserOrderStatus,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Check if order is submitted
   */
  isSubmitted(): boolean {
    return this.status === UserOrderStatus.SUBMITTED;
  }

  /**
   * Check if order is empty
   */
  isEmpty(): boolean {
    return (
      this.items.tacos.length === 0 &&
      this.items.extras.length === 0 &&
      this.items.drinks.length === 0 &&
      this.items.desserts.length === 0
    );
  }

  /**
   * Check if order belongs to user
   */
  belongsTo(userId: string): boolean {
    return this.userId === userId;
  }
}
