/**
 * User mapper
 * @module api/mappers/user
 */

import type { UserResponseDto } from '@/api/dto/user.dto';
import type { User } from '@/schemas/user.schema';

/**
 * User mapper
 */
export class UserMapper {
  /**
   * Map domain entity to response DTO
   */
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      ...(user.slackId && { slackId: user.slackId }),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
