/**
 * Group order DTOs
 * @module application/dtos/group-order
 */

import { GroupOrderStatus } from '../../types';
import { UserOrderResponseDto } from './user-order.dto';

/**
 * Create group order request DTO
 */
export interface CreateGroupOrderRequestDto {
  name?: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

/**
 * Group order response DTO
 */
export interface GroupOrderResponseDto {
  id: string;
  groupOrderId: string;
  name?: string;
  leaderId: string;
  startDate: Date;
  endDate: Date;
  status: GroupOrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Group order with user orders DTO
 */
export interface GroupOrderWithUserOrdersDto extends GroupOrderResponseDto {
  userOrders: UserOrderResponseDto[];
}
