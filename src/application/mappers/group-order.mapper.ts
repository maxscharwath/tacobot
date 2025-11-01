/**
 * Group order mapper
 * @module application/mappers/group-order
 */

import { GroupOrder } from '../../domain/entities/group-order.entity';
import { UserOrder } from '../../domain/entities/user-order.entity';
import {
  GroupOrderResponseDto,
  GroupOrderWithUserOrdersDto,
} from '../dtos/group-order.dto';
import { UserOrderResponseDto } from '../dtos/user-order.dto';
import { UserOrderMapper } from './user-order.mapper';

/**
 * Group order mapper
 */
export class GroupOrderMapper {
  /**
   * Map domain entity to response DTO
   */
  static toResponseDto(groupOrder: GroupOrder): GroupOrderResponseDto {
    return {
      id: groupOrder.id,
      groupOrderId: groupOrder.groupOrderId,
      name: groupOrder.name,
      leaderId: groupOrder.leaderId,
      startDate: groupOrder.startDate,
      endDate: groupOrder.endDate,
      status: groupOrder.status,
      createdAt: groupOrder.createdAt,
      updatedAt: groupOrder.updatedAt,
    };
  }

  /**
   * Map domain entity with user orders to response DTO
   */
  static toResponseDtoWithUserOrders(
    groupOrder: GroupOrder,
    userOrders: UserOrder[]
  ): GroupOrderWithUserOrdersDto {
    return {
      ...this.toResponseDto(groupOrder),
      userOrders: userOrders.map((uo) => UserOrderMapper.toResponseDto(uo)),
    };
  }
}
