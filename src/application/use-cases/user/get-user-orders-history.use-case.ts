/**
 * Get user orders history use case
 * @module application/use-cases/user
 */

import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { Order } from '../../../domain/entities/order.entity';
import { PrismaService } from '../../../database/prisma.service';
import { inject } from '../../../utils/inject';
import { logger } from '../../../utils/logger';

/**
 * Get user orders history use case
 */
@injectable()
export class GetUserOrdersHistoryUseCase {
  private readonly prisma = inject(PrismaService);

  async execute(userId: string): Promise<Array<{
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
}
