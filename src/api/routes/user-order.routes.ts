/**
 * User order routes
 * @module api/routes/user-order
 */

import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { jsonContent, UserOrderItemsSchema } from '@/api/schemas/shared.schemas';
import { authSecurity, createAuthenticatedRouteApp, requireUserId } from '@/api/utils/route.utils';
import { GroupOrderIdSchema } from '@/schemas/group-order.schema';
import { UserIdSchema } from '@/schemas/user.schema';
import { CreateUserOrderUseCase } from '@/services/user-order/create-user-order.service';
import { DeleteUserOrderUseCase } from '@/services/user-order/delete-user-order.service';
import { GetUserOrderUseCase } from '@/services/user-order/get-user-order.service';
import { SubmitUserOrderUseCase } from '@/services/user-order/submit-user-order.service';
import { inject } from '@/shared/utils/inject.utils';

const app = createAuthenticatedRouteApp();

const CreateUserOrderRequestSchema = z.object({
  items: UserOrderItemsSchema,
});

const UserOrderResponseSchema = z.object({
  id: z.string(),
  groupOrderId: z.string(),
  userId: z.string(),
  username: z.string().optional(),
  status: z.string(),
  items: UserOrderItemsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

app.openapi(
  createRoute({
    method: 'post',
    path: '/orders/{id}/items',
    tags: ['Orders'],
    security: authSecurity,
    request: {
      params: z.object({
        id: GroupOrderIdSchema,
      }),
      body: {
        content: jsonContent(CreateUserOrderRequestSchema),
      },
    },
    responses: {
      201: {
        description: 'User order created or updated',
        content: jsonContent(UserOrderResponseSchema),
      },
    },
  }),
  async (c) => {
    const userId = requireUserId(c);
    const { id: groupOrderId } = c.req.valid('param');
    const body = c.req.valid('json');
    const createUserOrderUseCase = inject(CreateUserOrderUseCase);
    const userOrder = await createUserOrderUseCase.execute(groupOrderId, userId, body);

    return c.json(
      {
        id: userOrder.id,
        groupOrderId: userOrder.groupOrderId,
        userId: userOrder.userId,
        ...(userOrder.username && { username: userOrder.username }),
        status: userOrder.status,
        items: userOrder.items,
        createdAt: userOrder.createdAt.toISOString(),
        updatedAt: userOrder.updatedAt.toISOString(),
      },
      201
    );
  }
);

app.openapi(
  createRoute({
    method: 'get',
    path: '/orders/{id}/items/me',
    tags: ['Orders'],
    security: authSecurity,
    request: {
      params: z.object({
        id: GroupOrderIdSchema,
      }),
    },
    responses: {
      200: {
        description: 'User order details',
        content: jsonContent(UserOrderResponseSchema),
      },
    },
  }),
  async (c) => {
    const userId = requireUserId(c);
    const { id: groupOrderId } = c.req.valid('param');
    const getUserOrderUseCase = inject(GetUserOrderUseCase);
    const userOrder = await getUserOrderUseCase.execute(groupOrderId, userId);

    return c.json(
      {
        id: userOrder.id,
        groupOrderId: userOrder.groupOrderId,
        userId: userOrder.userId,
        ...(userOrder.username && { username: userOrder.username }),
        status: userOrder.status,
        items: userOrder.items,
        createdAt: userOrder.createdAt.toISOString(),
        updatedAt: userOrder.updatedAt.toISOString(),
      },
      200
    );
  }
);

app.openapi(
  createRoute({
    method: 'put',
    path: '/orders/{id}/items/me/submit',
    tags: ['Orders'],
    security: authSecurity,
    request: {
      params: z.object({
        id: GroupOrderIdSchema,
      }),
    },
    responses: {
      200: {
        description: 'User order submitted',
        content: jsonContent(UserOrderResponseSchema),
      },
    },
  }),
  async (c) => {
    const userId = requireUserId(c);
    const { id: groupOrderId } = c.req.valid('param');
    const submitUserOrderUseCase = inject(SubmitUserOrderUseCase);
    const userOrder = await submitUserOrderUseCase.execute(groupOrderId, userId);

    return c.json(
      {
        id: userOrder.id,
        groupOrderId: userOrder.groupOrderId,
        userId: userOrder.userId,
        ...(userOrder.username && { username: userOrder.username }),
        status: userOrder.status,
        items: userOrder.items,
        createdAt: userOrder.createdAt.toISOString(),
        updatedAt: userOrder.updatedAt.toISOString(),
      },
      200
    );
  }
);

app.openapi(
  createRoute({
    method: 'delete',
    path: '/orders/{id}/items/{userId}',
    tags: ['Orders'],
    security: authSecurity,
    request: {
      params: z.object({
        id: GroupOrderIdSchema,
        userId: UserIdSchema,
      }),
    },
    responses: {
      204: {
        description: 'User order deleted',
      },
    },
  }),
  async (c) => {
    const deleterUserId = requireUserId(c);
    const { id: groupOrderId, userId } = c.req.valid('param');
    const deleteUserOrderUseCase = inject(DeleteUserOrderUseCase);
    await deleteUserOrderUseCase.execute(groupOrderId, userId, deleterUserId);

    return c.body(null, 204);
  }
);

export const userOrderRoutes = app;
