/**
 * User routes for Hono
 * @module hono/routes/user
 */

import 'reflect-metadata';
import { Hono } from 'hono';
import { UserService } from '../../services/user.service';
import { inject } from '../../utils/inject';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

// All user routes require authentication
app.use('*', authMiddleware);

/**
 * Get current user profile
 */
app.get('/me', async (c) => {
  const userId = c.get('userId');
  const userService = inject(UserService);

  const user = await userService.getUserById(userId);

  return c.json(user);
});

/**
 * Get user's order history
 */
app.get('/me/orders', async (c) => {
  const userId = c.get('userId');
  const userService = inject(UserService);

  const orders = await userService.getUserOrderHistory(userId);

  return c.json(orders);
});

/**
 * Get user's group orders (as leader)
 */
app.get('/me/group-orders', async (c) => {
  const userId = c.get('userId');
  const userService = inject(UserService);

  const groupOrders = await userService.getUserGroupOrders(userId);

  return c.json(groupOrders);
});

export const userRoutes = app;
