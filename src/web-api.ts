/**
 * Web API Server - Pure RESTful with UUID in paths
 * @module web-api
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import config from './config';
import { logger } from './utils/logger';
import { apiClient } from './api/client';
import { resourceService, sessionService } from './services';
import { apiController } from './controllers/api.controller';
import { errorHandler } from './middleware/error-handler';
import { validate, schemas } from './middleware/validation';

/**
 * Middleware to ensure session exists (auto-create if needed)
 */
async function ensureSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cartId = req.params.cartId;
    
    if (!cartId) {
      next();
      return;
    }

    // Check if session exists, create if not
    const exists = await sessionService.hasSession(cartId);
    if (!exists) {
      await sessionService.createSession({
        sessionId: cartId,
        metadata: {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });
      logger.info('Auto-created session for cart', { cartId });
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Create Express application
 */
function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.webApi.corsOrigin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    next();
  });

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.webApi.rateLimit.windowMs,
    max: config.webApi.rateLimit.max,
    message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Request logging
  app.use((req, _res, next) => {
    logger.info('API Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      cartId: req.params.cartId,
    });
    next();
  });

  // Health check
  app.get('/health', apiController.healthCheck.bind(apiController));

  // API routes
  const router = express.Router();

  // Generate new cart ID (optional convenience endpoint)
  router.post('/carts', (req: Request, res: Response) => {
    const cartId = uuidv4();
    res.status(201).json({
      success: true,
      data: {
        cartId,
        message: 'Use this ID in your requests: /api/v1/carts/{cartId}/...',
      },
    });
  });

  // Cart routes - RESTful with UUID in path
  router.get('/carts/:cartId', ensureSession, apiController.getCart.bind(apiController));
  router.post(
    '/carts/:cartId/tacos',
    ensureSession,
    validate(schemas.addTaco),
    apiController.addTaco.bind(apiController)
  );
  router.get(
    '/carts/:cartId/tacos/:id',
    ensureSession,
    apiController.getTaco.bind(apiController)
  );
  router.put(
    '/carts/:cartId/tacos/:id',
    ensureSession,
    validate(schemas.addTaco),
    apiController.updateTaco.bind(apiController)
  );
  router.patch(
    '/carts/:cartId/tacos/:id/quantity',
    ensureSession,
    validate(schemas.updateTacoQuantity),
    apiController.updateTacoQuantity.bind(apiController)
  );
  router.delete(
    '/carts/:cartId/tacos/:id',
    ensureSession,
    apiController.deleteTaco.bind(apiController)
  );
  router.post(
    '/carts/:cartId/extras',
    ensureSession,
    validate(schemas.addExtra),
    apiController.addExtra.bind(apiController)
  );
  router.post(
    '/carts/:cartId/drinks',
    ensureSession,
    validate(schemas.addDrink),
    apiController.addDrink.bind(apiController)
  );
  router.post(
    '/carts/:cartId/desserts',
    ensureSession,
    validate(schemas.addDessert),
    apiController.addDessert.bind(apiController)
  );

  // Order routes - RESTful with UUID in path
  router.post(
    '/carts/:cartId/orders',
    ensureSession,
    validate(schemas.createOrder),
    apiController.createOrder.bind(apiController)
  );

  // Global resource routes (no cart ID needed)
  router.get('/resources/stock', apiController.getStock.bind(apiController));

  app.use('/api/v1', router);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
      },
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the web API server
 */
async function startWebApi(): Promise<void> {
  if (!config.webApi.enabled) {
    logger.warn('Web API is disabled in configuration');
    return;
  }

  logger.info('Initializing Web API');

  // Initialize API client (for global operations like stock)
  await apiClient.initialize();

  // Initialize resource service
  await resourceService.initialize();

  // Create and start Express app
  const app = createApp();

  app.listen(config.webApi.port, () => {
    logger.info('🚀 Web API server is running!', {
      port: config.webApi.port,
      env: config.env,
    });
    logger.info('📝 RESTful API - use UUIDs in path:');
    logger.info('   POST /api/v1/carts → Get a new cart ID');
    logger.info('   Or use your own UUID in: /api/v1/carts/{uuid}/...');
  });
}

// Start the server
if (require.main === module) {
  startWebApi().catch((error: Error) => {
    logger.error('Failed to start Web API', { error: error.message, stack: error.stack });
    process.exit(1);
  });
}

export { createApp, startWebApi };
export default startWebApi;
