/**
 * Create user use case
 * @module application/use-cases/auth
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { ValidationError } from '../../../utils/errors';
import { inject } from '../../../utils/inject';
import { logger } from '../../../utils/logger';
import { AuthService } from '../../../services/auth.service';

/**
 * Create user use case
 * Business logic for creating or retrieving a user
 */
@injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository = inject('IUserRepository') as IUserRepository,
    private readonly authService: AuthService = inject(AuthService)
  ) {}

  async execute(username: string): Promise<{ user: { id: string; username: string; slackId?: string }; token: string }> {
    // Validate input
    if (!username || username.trim().length < 2) {
      throw new ValidationError('Username must be at least 2 characters long');
    }

    const trimmedUsername = username.trim();

    // Try to find existing user
    let user = await this.userRepository.findByUsername(trimmedUsername);

    // If user doesn't exist, create it
    if (!user) {
      user = await this.userRepository.create({
        username: trimmedUsername,
      });
      logger.info('User created', { userId: user.id, username: user.username });
    }

    // Generate token
    const token = this.authService.generateToken({
      id: user.id,
      username: user.username,
      slackId: user.slackId,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        ...(user.slackId && { slackId: user.slackId }),
      },
      token,
    };
  }
}
