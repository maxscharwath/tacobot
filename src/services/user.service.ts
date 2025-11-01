/**
 * User service
 * @module services/user
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { UserRepository, UserData } from '../database/user.repository';
import { PrismaService } from '../database/prisma.service';
import { NotFoundError } from '../utils/errors';
import { inject } from '../utils/inject';
import { logger } from '../utils/logger';

/**
 * User Service
 */
@injectable()
export class UserService {
  private readonly userRepository = inject(UserRepository);
  private readonly prisma = inject(PrismaService);

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserData> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  /**
   * Get user's order history
   */
  async getUserOrderHistory(userId: string): Promise<Array<{
    id: string;
    orderId: string;
    status: string;
    price: number | null;
    orderType: string;
    requestedFor: string;
    createdAt: Date;
  }>> {
    const orders = await this.prisma.client.order.findMany({
      where: { userId },
      select: {
        id: true,
        orderId: true,
        status: true,
        price: true,
        orderType: true,
        requestedFor: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
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
    const groupOrders = await this.prisma.client.groupOrder.findMany({
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
