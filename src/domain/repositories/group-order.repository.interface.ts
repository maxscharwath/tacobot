/**
 * Group order repository interface (domain layer)
 * @module domain/repositories/group-order
 */

import { GroupOrder } from '../entities/group-order.entity';

/**
 * Group order repository interface
 */
export interface IGroupOrderRepository {
  /**
   * Create a new group order
   */
  create(data: {
    groupOrderId: string;
    name?: string;
    leaderId: string;
    startDate: Date;
    endDate: Date;
  }): Promise<GroupOrder>;

  /**
   * Get group order by ID
   */
  findById(groupOrderId: string): Promise<GroupOrder | null>;

  /**
   * Update group order
   */
  update(
    groupOrderId: string,
    updates: Partial<Pick<GroupOrder, 'name' | 'status' | 'startDate' | 'endDate'>>
  ): Promise<GroupOrder>;

  /**
   * Check if group order exists
   */
  exists(groupOrderId: string): Promise<boolean>;

  /**
   * Delete group order
   */
  delete(groupOrderId: string): Promise<void>;
}
