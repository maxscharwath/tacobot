/**
 * User order DTOs (Data Transfer Objects)
 * @module api/dto/user-order
 */

import type { UserOrderItems, UserOrderStatus } from '@/shared/types/types';

/**
 * User order response DTO
 */
export interface UserOrderResponseDto {
  id: string;
  userId: string;
  username?: string;
  status: UserOrderStatus;
  items: UserOrderItems;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create user order request DTO
 */
export interface CreateUserOrderRequestDto {
  items: UserOrderItems;
}
