/**
 * Authentication routes for Hono
 * @module hono/routes/auth
 */

import 'reflect-metadata';
import { Hono } from 'hono';
import { z } from 'zod';
import { AuthService } from '../../services/auth.service';
import { inject } from '../../utils/inject';
import { zodValidator } from '../middleware/zod-validator';

// Helper type for validated request body from Zod schema
type RequestFor<T extends z.ZodTypeAny> = z.infer<T>;

const app = new Hono();

// Validation schemas
const authSchemas = {
  register: z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6),
  }),
  login: z.object({
    usernameOrEmail: z.string(),
    password: z.string().min(1),
  }),
};

/**
 * Register a new user
 */
app.post('/register', zodValidator(authSchemas.register), async (c) => {
  const body: RequestFor<typeof authSchemas.register> = c.get('validatedBody');
  const authService = inject(AuthService);

  const result = await authService.register(body.username, body.email, body.password);

  return c.json(result, 201);
});

/**
 * Login a user
 */
app.post('/login', zodValidator(authSchemas.login), async (c) => {
  const body: RequestFor<typeof authSchemas.login> = c.get('validatedBody');
  const authService = inject(AuthService);

  const result = await authService.login(body.usernameOrEmail, body.password);

  return c.json(result);
});

export const authRoutes = app;
