/**
 * User order repository interface (domain layer)
 * @module domain/repositories/user-order
 */

import { UserOrder } from '../entities/user-order.entity';
import { UserOrderItems, UserOrderStatus } from '../../types';

/**
 * User order repository interface
 */
export interface IUserOrderRepository {
  /**
   * Get user order by groupOrderId and userId
   */
  findByGroupAndUser(groupOrderId: string, userId: string): Promise<UserOrder | null>;

  /**
   * Get all user orders for a group order
   */
  findByGroup(groupOrderId: string): Promise<UserOrder[]>;

  /**
   * Create or update user order
   */
  upsert(data: {
    groupOrderId: string;
    userId: string;
    items: UserOrderItems;
    status?: UserOrderStatus;
  }): Promise<UserOrder>;

  /**
   * Update user order status
   */
  updateStatus(
    groupOrderId: string,
    userId: string,
    status: UserOrderStatus
  ): Promise<UserOrder>;

  /**
   * Delete user order
   */
  delete(groupOrderId: string, userId: string): Promise<void>;

  /**
   * Check if user order exists
   */
  exists(groupOrderId: string, userId: string): Promise<boolean>;

  /**
   * Get count of submitted orders for a group order
   */
  getSubmittedCount(groupOrderId: string): Promise<number>;
}
