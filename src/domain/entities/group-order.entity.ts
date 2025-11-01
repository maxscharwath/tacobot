/**
 * Group order domain entity
 * @module domain/entities/group-order
 */

import { GroupOrderStatus } from '../../types';

/**
 * Group order domain entity
 */
export class GroupOrder {
  constructor(
    public readonly id: string,
    public readonly groupOrderId: string,
    public readonly leaderId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly status: GroupOrderStatus,
    public readonly name?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Check if group order is currently open for orders
   */
  isOpenForOrders(): boolean {
    if (this.status !== GroupOrderStatus.OPEN) {
      return false;
    }

    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
  }

  /**
   * Check if group order can be modified
   */
  canBeModified(): boolean {
    return this.status === GroupOrderStatus.OPEN && this.isOpenForOrders();
  }

  /**
   * Check if user is the leader
   */
  isLeader(userId: string): boolean {
    return this.leaderId === userId;
  }
}
