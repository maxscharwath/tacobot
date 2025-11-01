/**
 * User service (application service)
 * Orchestrates use cases for user-related operations
 * @module services/user
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { User } from '../domain/entities/user.entity';
import { IUserRepository } from '../domain/repositories/user.repository.interface';
import { NotFoundError } from '../utils/errors';
import { inject } from '../utils/inject';
import { GetUserOrdersHistoryUseCase } from '../application/use-cases/user/get-user-orders-history.use-case';

/**
 * User Service
 * Application service that orchestrates use cases
 */
@injectable()
export class UserService {
  private readonly userRepository: IUserRepository;
  private readonly getUserOrdersHistoryUseCase: GetUserOrdersHistoryUseCase;

  constructor() {
    this.userRepository = inject('IUserRepository') as IUserRepository;
    this.getUserOrdersHistoryUseCase = inject(GetUserOrdersHistoryUseCase);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  /**
   * Get user's order history
   */
  async getUserOrderHistory(userId: string) {
    return await this.getUserOrdersHistoryUseCase.execute(userId);
  }

  /**
   * Get user's group orders (as leader)
   */
  async getUserGroupOrders(userId: string): Promise<Array<{
    id: string;
    groupOrderId: string;
    name: string | null;
    status: string;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
  }>> {
    // This will be moved to a use case
    const { PrismaService } = await import('../database/prisma.service');
    const prisma = inject(PrismaService);
    
    const groupOrders = await prisma.client.groupOrder.findMany({
      where: { leaderId: userId },
      select: {
        id: true,
        groupOrderId: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return groupOrders;
  }
}
