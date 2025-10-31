/**
 * Web API Server - Session-aware (hidden sessions)
 * @module web-api
 */

import express, { Application } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config';
import { logger } from './utils/logger';
import { apiClient } from './api/client';
import { resourceService } from './services';
import { apiController } from './controllers/api.controller';
import { errorHandler } from './middleware/error-handler';
import { validate, schemas } from './middleware/validation';
import { sessionHandler } from './middleware/session-handler';

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
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Id');
    res.header('Access-Control-Expose-Headers', 'X-Session-Id');

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
      sessionId: req.headers['x-session-id'],
    });
    next();
  });

  // Health check (no session required)
  app.get('/health', apiController.healthCheck.bind(apiController));

  // API routes
  const router = express.Router();

  // Apply session handler middleware to all routes
  router.use(sessionHandler);

  // Cart routes (sessionId auto-handled via middleware)
  router.get('/cart', apiController.getCart.bind(apiController));
  router.post('/cart/tacos', validate(schemas.addTaco), apiController.addTaco.bind(apiController));
  router.get('/cart/tacos/:id', apiController.getTaco.bind(apiController));
  router.put(
    '/cart/tacos/:id',
    validate(schemas.addTaco),
    apiController.updateTaco.bind(apiController)
  );
  router.patch(
    '/cart/tacos/:id/quantity',
    validate(schemas.updateTacoQuantity),
    apiController.updateTacoQuantity.bind(apiController)
  );
  router.delete('/cart/tacos/:id', apiController.deleteTaco.bind(apiController));
  router.post(
    '/cart/extras',
    validate(schemas.addExtra),
    apiController.addExtra.bind(apiController)
  );
  router.post(
    '/cart/drinks',
    validate(schemas.addDrink),
    apiController.addDrink.bind(apiController)
  );
  router.post(
    '/cart/desserts',
    validate(schemas.addDessert),
    apiController.addDessert.bind(apiController)
  );

  // Order routes (sessionId auto-handled via middleware)
  router.post(
    '/orders',
    validate(schemas.createOrder),
    apiController.createOrder.bind(apiController)
  );

  // Global resource routes (no session required, but middleware still runs)
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
    logger.info('🔐 Sessions are automatically managed via X-Session-Id header');
    logger.info('   Add header: X-Session-Id: <your-uuid>');
    logger.info('   Or let the API auto-generate one for you');
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
