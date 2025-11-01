/**
 * User order mapper
 * @module application/mappers/user-order
 */

import { UserOrder } from '../../domain/entities/user-order.entity';
import { UserOrderResponseDto } from '../dtos/user-order.dto';

/**
 * User order mapper
 */
export class UserOrderMapper {
  /**
   * Map domain entity to response DTO
   * Note: username is optional and comes from related user data
   */
  static toResponseDto(userOrder: UserOrder, username?: string): UserOrderResponseDto {
    return {
      id: userOrder.id,
      groupOrderId: userOrder.groupOrderId,
      userId: userOrder.userId,
      ...(username && { username }),
      status: userOrder.status,
      items: userOrder.items,
      createdAt: userOrder.createdAt,
      updatedAt: userOrder.updatedAt,
    };
  }
}
