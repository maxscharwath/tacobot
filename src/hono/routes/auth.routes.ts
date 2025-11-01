/**
 * Authentication routes for Hono
 * Uses clean architecture with use cases
 * @module hono/routes/auth
 */

import 'reflect-metadata';
import { Hono } from 'hono';
import { z } from 'zod';
import { CreateUserUseCase } from '../../application/use-cases/auth/create-user.use-case';
import { UserMapper } from '../../application/mappers/user.mapper';
import { inject } from '../../utils/inject';
import { zodValidator } from '../middleware/zod-validator';

// Helper type for validated request body from Zod schema
type RequestFor<T extends z.ZodTypeAny> = z.infer<T>;

const app = new Hono();

// Validation schemas
const authSchemas = {
  createUser: z.object({
    username: z.string().min(2).max(50),
  }),
};

/**
 * Create or get user by username (temporary until Slack OAuth is implemented)
 * This endpoint will be replaced with Slack OAuth callback later
 */
app.post('/create-user', zodValidator(authSchemas.createUser), async (c) => {
  const body: RequestFor<typeof authSchemas.createUser> = c.get('validatedBody');
  const createUserUseCase = inject(CreateUserUseCase);

  const result = await createUserUseCase.execute(body.username);

  return c.json({
    user: UserMapper.toResponseDto(result.user as any),
    token: result.token,
  }, 201);
});

export const authRoutes = app;
