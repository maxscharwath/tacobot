/**
 * REST API controllers - Pure RESTful with UUID in paths
 * @module controllers/api
 */

import { Request, Response, NextFunction } from 'express';
import { cartService, orderService, resourceService } from '../services';
import { logger } from '../utils/logger';
import {
  AddTacoRequest,
  UpdateTacoRequest,
  Extra,
  Drink,
  Dessert,
  CreateOrderRequest,
} from '../types';

/**
 * API Controller - RESTful with cart UUID in path
 */
export class ApiController {
  /**
   * GET /api/v1/carts/:cartId - Get cart contents
   */
  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cartId } = req.params;
      const cart = await cartService.getCart(cartId || '');
      res.json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/carts/:cartId/tacos - Add taco to cart
   */
  async addTaco(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cartId } = req.params;
      const request = req.body as AddTacoRequest;
      const taco = await cartService.addTaco(cartId || '', request);
      res.status(201).json({ success: true, data: taco });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/carts/:cartId/tacos/:id - Get taco details
   */
  async getTaco(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cartId, id } = req.params;
      const taco = await cartService.getTacoDetails(cartId || '', id || '');
      res.json({ success: true, data: taco });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/carts/:cartId/tacos/:id - Update taco
   */
  async updateTaco(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cartId, id } = req.params;
      const request = { ...req.body, id: id || '' } as UpdateTacoRequest;
      const taco = await cartService.updateTaco(cartId || '', request);
      res.json({ success: true, data: taco });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/carts/:cartId/tacos/:id/quantity - Update taco quantity
   */
  async updateTacoQuantity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cartId, id } = req.params;
      const { action } = req.body as { action: 'increase' | 'decrease' };
      const result = await cartService.updateTacoQuantity(cartId || '', id || '', action);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/carts/:cartId/tacos/:id - Delete taco from cart
   */
  async deleteTaco(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cartId, id } = req.params;
      await cartService.deleteTaco(cartId || '', id || '');
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/carts/:cartId/extras - Add extra to cart
   */
  async addExtra(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cartId } = req.params;
      const extra = req.body as Extra;
      const result = await cartService.addExtra(cartId || '', extra);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/carts/:cartId/drinks - Add drink to cart
   */
  async addDrink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cartId } = req.params;
      const drink = req.body as Drink;
      const result = await cartService.addDrink(cartId || '', drink);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/carts/:cartId/desserts - Add dessert to cart
   */
  async addDessert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cartId } = req.params;
      const dessert = req.body as Dessert;
      const result = await cartService.addDessert(cartId || '', dessert);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/carts/:cartId/orders - Create order
   */
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cartId } = req.params;
      const request = req.body as CreateOrderRequest;
      const order = await orderService.createOrder(cartId || '', request);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/resources/stock - Get stock availability
   */
  async getStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const stock = await resourceService.getStock(forceRefresh);
      res.json({ success: true, data: stock });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/health - Health check
   */
  async healthCheck(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  }
}

export const apiController = new ApiController();
export default apiController;
