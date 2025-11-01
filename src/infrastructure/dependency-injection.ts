/**
 * Dependency injection setup for clean architecture
 * Registers domain interfaces with their implementations
 * @module infrastructure/dependency-injection
 */

import 'reflect-metadata';
import { container } from 'tsyringe';
import { IGroupOrderRepository } from '../domain/repositories/group-order.repository.interface';
import { IUserOrderRepository } from '../domain/repositories/user-order.repository.interface';
import { IUserRepository } from '../domain/repositories/user.repository.interface';
import { GroupOrderRepositoryAdapter } from './repositories/group-order.repository.adapter';
import { UserOrderRepositoryAdapter } from './repositories/user-order.repository.adapter';
import { UserRepositoryAdapter } from './repositories/user.repository.adapter';

/**
 * Setup dependency injection for clean architecture
 * Registers domain interfaces with their infrastructure implementations
 */
export function setupDependencyInjection(): void {
  // Register domain repository interfaces with their implementations
  container.register<IUserRepository>('IUserRepository', {
    useClass: UserRepositoryAdapter,
  });

  container.register<IGroupOrderRepository>('IGroupOrderRepository', {
    useClass: GroupOrderRepositoryAdapter,
  });

  container.register<IUserOrderRepository>('IUserOrderRepository', {
    useClass: UserOrderRepositoryAdapter,
  });
}
