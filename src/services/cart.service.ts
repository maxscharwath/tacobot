/**
 * Session-aware cart service with UUID-based tacos
 * @module services/cart
 */

import { v4 as uuidv4 } from 'uuid';
import { sessionApiClient } from '../api/session-client';
import { logger } from '../utils/logger';
import {
  Cart,
  AddTacoRequest,
  UpdateTacoRequest,
  Taco,
  Extra,
  Drink,
  Dessert,
  CategorySummary,
} from '../types';

/**
 * Cart Service - UUID-based tacos
 * All operations require a cartId (sessionId)
 */
export class CartService {
  // In-memory mapping of backend index to UUID (would use database in production)
  private tacoIndexToUuid: Map<string, Map<number, string>> = new Map();
  private tacoUuidToIndex: Map<string, Map<string, number>> = new Map();

  /**
   * Get complete cart contents for a cart
   */
  async getCart(cartId: string): Promise<Cart> {
    logger.debug('Fetching cart contents', { cartId });

    const [tacos, extras, drinks, desserts, summary] = await Promise.all([
      this.getTacos(cartId),
      this.getExtras(cartId),
      this.getDrinks(cartId),
      this.getDesserts(cartId),
      this.getCategorySummary(cartId),
    ]);

    const cart: Cart = {
      sessionId: cartId,
      tacos,
      extras,
      drinks,
      desserts,
      summary: {
        ...summary,
        total: {
          quantity:
            summary.tacos.totalQuantity +
            summary.extras.totalQuantity +
            summary.boissons.totalQuantity +
            summary.desserts.totalQuantity,
          price:
            summary.tacos.totalPrice +
            summary.extras.totalPrice +
            summary.boissons.totalPrice +
            summary.desserts.totalPrice,
        },
      },
    };

    logger.info('Cart fetched successfully', {
      cartId,
      totalItems: cart.summary.total.quantity,
      totalPrice: cart.summary.total.price,
    });

    return cart;
  }

  /**
   * Get all tacos in cart for a cart
   */
  async getTacos(cartId: string): Promise<Taco[]> {
    logger.debug('Fetching tacos from cart', { cartId });
    const response = await sessionApiClient.post<string>(
      cartId,
      '/ajax/owt.php',
      { loadProducts: true }
    );
    // Note: Backend returns HTML, would need parsing in real implementation
    // For now, return empty array - implement HTML parser if needed
    return [];
  }

  /**
   * Add taco to cart
   */
  async addTaco(cartId: string, request: AddTacoRequest): Promise<Taco> {
    logger.debug('Adding taco to cart', { cartId, size: request.size });

    const formData: Record<string, unknown> = {
      selectProduct: request.size,
      tacosNote: request.note || '',
    };

    // Add meats
    request.meats.forEach((meat) => {
      if (!formData['viande[]']) {
        formData['viande[]'] = [];
      }
      (formData['viande[]'] as string[]).push(meat.id);
      formData[`meat_quantity[${meat.id}]`] = meat.quantity;
    });

    // Add sauces
    request.sauces.forEach((sauce) => {
      if (!formData['sauce[]']) {
        formData['sauce[]'] = [];
      }
      (formData['sauce[]'] as string[]).push(sauce);
    });

    // Add garnitures
    request.garnitures.forEach((garniture) => {
      if (!formData['garniture[]']) {
        formData['garniture[]'] = [];
      }
      (formData['garniture[]'] as string[]).push(garniture);
    });

    await sessionApiClient.postForm(cartId, '/ajax/owt.php', formData);

    // Generate UUID for this taco
    const tacoId = uuidv4();
    
    // Get current taco count to determine index (backend uses 0-based index)
    const currentTacos = await this.getTacos(cartId);
    const backendIndex = currentTacos.length;
    
    // Store mapping
    this.storeTacoMapping(cartId, backendIndex, tacoId);

    logger.info('Taco added to cart successfully', { cartId, tacoId });

    // Return taco with UUID
    return {
      id: tacoId,
      size: request.size,
      meats: request.meats.map((m) => ({ ...m, name: m.id })),
      sauces: request.sauces.map((s) => ({ id: s, name: s })),
      garnitures: request.garnitures.map((g) => ({ id: g, name: g })),
      note: request.note,
      quantity: 1,
      price: 0,
    };
  }

  /**
   * Get taco details by UUID
   */
  async getTacoDetails(cartId: string, tacoId: string): Promise<Taco> {
    logger.debug('Fetching taco details', { cartId, tacoId });

    const backendIndex = this.getBackendIndex(cartId, tacoId);

    const response = await sessionApiClient.postForm<{ status: string; data: unknown }>(
      cartId,
      '/ajax/gtd.php',
      { index: backendIndex }
    );

    if (response.status !== 'success') {
      throw new Error('Failed to get taco details');
    }

    logger.info('Taco details fetched', { cartId, tacoId });
    
    return {
      id: tacoId,
      size: 'tacos_L', // Would parse from response
      meats: [],
      sauces: [],
      garnitures: [],
      quantity: 1,
      price: 0,
    };
  }

  /**
   * Update taco in cart by UUID
   */
  async updateTaco(cartId: string, request: UpdateTacoRequest): Promise<Taco> {
    logger.debug('Updating taco', { cartId, tacoId: request.id });

    const backendIndex = this.getBackendIndex(cartId, request.id);

    const formData: Record<string, unknown> = {
      index: backendIndex,
      editSelectProduct: request.size,
      tacosNote: request.note || '',
    };

    // Add meats
    request.meats.forEach((meat) => {
      if (!formData['viande[]']) {
        formData['viande[]'] = [];
      }
      (formData['viande[]'] as string[]).push(meat.id);
      formData[`meat_quantity[${meat.id}]`] = meat.quantity;
    });

    // Add sauces
    request.sauces.forEach((sauce) => {
      if (!formData['sauce[]']) {
        formData['sauce[]'] = [];
      }
      (formData['sauce[]'] as string[]).push(sauce);
    });

    // Add garnitures
    request.garnitures.forEach((garniture) => {
      if (!formData['garniture[]']) {
        formData['garniture[]'] = [];
      }
      (formData['garniture[]'] as string[]).push(garniture);
    });

    await sessionApiClient.postFormData(cartId, '/ajax/et.php', formData);

    logger.info('Taco updated successfully', { cartId, tacoId: request.id });

    return {
      id: request.id,
      size: request.size,
      meats: request.meats.map((m) => ({ ...m, name: m.id })),
      sauces: request.sauces.map((s) => ({ id: s, name: s })),
      garnitures: request.garnitures.map((g) => ({ id: g, name: g })),
      note: request.note,
      quantity: 1,
      price: 0,
    };
  }

  /**
   * Update taco quantity by UUID
   */
  async updateTacoQuantity(
    cartId: string,
    tacoId: string,
    action: 'increase' | 'decrease'
  ): Promise<{ quantity: number }> {
    logger.debug('Updating taco quantity', { cartId, tacoId, action });

    const backendIndex = this.getBackendIndex(cartId, tacoId);
    const formAction = action === 'increase' ? 'increaseQuantity' : 'decreaseQuantity';
    
    const response = await sessionApiClient.postForm<{ status: string; quantity: number }>(
      cartId,
      '/ajax/owt.php',
      { action: formAction, index: backendIndex }
    );

    logger.info('Taco quantity updated', { cartId, tacoId, newQuantity: response.quantity });
    return { quantity: response.quantity };
  }

  /**
   * Delete taco from cart by UUID
   */
  async deleteTaco(cartId: string, tacoId: string): Promise<void> {
    logger.debug('Deleting taco', { cartId, tacoId });
    
    const backendIndex = this.getBackendIndex(cartId, tacoId);
    
    await sessionApiClient.post(cartId, '/ajax/dt.php', { index: backendIndex });
    
    // Remove mapping
    this.removeTacoMapping(cartId, tacoId);
    
    logger.info('Taco deleted from cart', { cartId, tacoId });
  }

  /**
   * Get all extras in cart
   */
  async getExtras(cartId: string): Promise<Extra[]> {
    logger.debug('Fetching extras from cart', { cartId });
    const response = await sessionApiClient.post<Record<string, Extra>>(
      cartId,
      '/ajax/gse.php'
    );
    return Object.values(response);
  }

  /**
   * Add or update extra in cart
   */
  async addExtra(cartId: string, extra: Extra): Promise<Extra> {
    logger.debug('Adding extra to cart', { cartId, id: extra.id });
    await sessionApiClient.post(cartId, '/ajax/ues.php', extra);
    logger.info('Extra added to cart', { cartId, id: extra.id });
    return extra;
  }

  /**
   * Get all drinks in cart
   */
  async getDrinks(cartId: string): Promise<Drink[]> {
    logger.debug('Fetching drinks from cart', { cartId });
    const response = await sessionApiClient.post<Record<string, Drink>>(
      cartId,
      '/ajax/gsb.php'
    );
    return Object.values(response);
  }

  /**
   * Add or update drink in cart
   */
  async addDrink(cartId: string, drink: Drink): Promise<Drink> {
    logger.debug('Adding drink to cart', { cartId, id: drink.id });
    await sessionApiClient.post(cartId, '/ajax/ubs.php', drink);
    logger.info('Drink added to cart', { cartId, id: drink.id });
    return drink;
  }

  /**
   * Get all desserts in cart
   */
  async getDesserts(cartId: string): Promise<Dessert[]> {
    logger.debug('Fetching desserts from cart', { cartId });
    const response = await sessionApiClient.post<Record<string, Dessert>>(
      cartId,
      '/ajax/gsd.php'
    );
    return Object.values(response);
  }

  /**
   * Add or update dessert in cart
   */
  async addDessert(cartId: string, dessert: Dessert): Promise<Dessert> {
    logger.debug('Adding dessert to cart', { cartId, id: dessert.id });
    await sessionApiClient.post(cartId, '/ajax/uds.php', dessert);
    logger.info('Dessert added to cart', { cartId, id: dessert.id });
    return dessert;
  }

  /**
   * Get category summary (quantities and prices)
   */
  async getCategorySummary(cartId: string): Promise<{
    tacos: CategorySummary;
    extras: CategorySummary;
    boissons: CategorySummary;
    desserts: CategorySummary;
  }> {
    logger.debug('Fetching category summary', { cartId });
    const response = await sessionApiClient.post<{
      tacos: CategorySummary;
      extras: CategorySummary;
      boissons: CategorySummary;
      desserts: CategorySummary;
    }>(cartId, '/ajax/sd.php');
    return {
      tacos: response.tacos,
      extras: response.extras,
      boissons: response.boissons,
      desserts: response.desserts,
    };
  }

  /**
   * Store UUID to backend index mapping
   */
  private storeTacoMapping(cartId: string, backendIndex: number, tacoId: string): void {
    if (!this.tacoIndexToUuid.has(cartId)) {
      this.tacoIndexToUuid.set(cartId, new Map());
      this.tacoUuidToIndex.set(cartId, new Map());
    }
    this.tacoIndexToUuid.get(cartId)!.set(backendIndex, tacoId);
    this.tacoUuidToIndex.get(cartId)!.set(tacoId, backendIndex);
  }

  /**
   * Get backend index from UUID
   */
  private getBackendIndex(cartId: string, tacoId: string): number {
    const index = this.tacoUuidToIndex.get(cartId)?.get(tacoId);
    if (index === undefined) {
      throw new Error(`Taco not found: ${tacoId}`);
    }
    return index;
  }

  /**
   * Remove taco mapping
   */
  private removeTacoMapping(cartId: string, tacoId: string): void {
    const backendIndex = this.tacoUuidToIndex.get(cartId)?.get(tacoId);
    if (backendIndex !== undefined) {
      this.tacoIndexToUuid.get(cartId)?.delete(backendIndex);
      this.tacoUuidToIndex.get(cartId)?.delete(tacoId);
    }
  }
}

export const cartService = new CartService();
export default cartService;
