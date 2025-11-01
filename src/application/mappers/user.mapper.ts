/**
 * User mapper - maps between domain entities and DTOs
 * @module application/mappers/user
 */

import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../dtos/user.dto';

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
