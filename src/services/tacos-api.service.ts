/**
 * Tacos API Service
 * High-level service layer for managing tacos orders
 */

import { getApiClient } from '@/api/client';
import {
  TacoConfig,
  CartTaco,
  Cart,
  CartSummary,
  StockAvailability,
  Order,
  OrderStatusResponse,
  RestoreOrderResponse,
  DeliveryDemand,
  Extra,
  Drink,
  Dessert,
  Customer,
  DeliveryInfo,
  TacoSize,
} from '@/types';
import { logger } from '@/utils/logger';
import { ValidationError } from '@/types/errors';

/**
 * Service for managing tacos ordering operations
 */
export class TacosApiService {
  private apiClient = getApiClient();

  /**
   * Get stock availability for all products
   */
  async getStockAvailability(): Promise<StockAvailability> {
    try {
      const stock = await this.apiClient.get<StockAvailability>(
        '/office/stock_management.php?type=all'
      );
      return stock;
    } catch (error) {
      logger.error('Failed to get stock availability', error);
      throw error;
    }
  }

  /**
   * Add a taco to the cart
   */
  async addTacoToCart(config: TacoConfig): Promise<CartTaco> {
    this.validateTacoConfig(config);

    const formData: Record<string, unknown> = {
      selectProduct: config.size,
    };

    // Add meats
    config.meats.forEach((meat) => {
      formData['viande[]'] = meat.slug;
      formData[`meat_quantity[${meat.slug}]`] = meat.quantity;
    });

    // Add sauces
    config.sauces.forEach((sauce) => {
      formData['sauce[]'] = sauce.slug;
    });

    // Add garnitures
    config.garnitures.forEach((garnish) => {
      formData['garniture[]'] = garnish.slug;
    });

    // Add note if present
    if (config.note) {
      formData.tacosNote = config.note;
    }

    try {
      const html = await this.apiClient.postForm<string>('/ajax/owt.php', formData);
      // Note: In a real implementation, you'd parse the HTML to extract taco data
      // For now, we return a basic structure
      return {
        ...config,
        id: 0, // Would be parsed from HTML or response
        quantity: 1,
        price: 0, // Would be parsed from HTML
      };
    } catch (error) {
      logger.error('Failed to add taco to cart', error);
      throw error;
    }
  }

  /**
   * Get all tacos in cart
   */
  async getCartTacos(): Promise<CartTaco[]> {
    try {
      const html = await this.apiClient.post('/ajax/owt.php', { loadProducts: true });
      // Note: HTML parsing would be needed here
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error('Failed to get cart tacos', error);
      throw error;
    }
  }

  /**
   * Get taco details by index
   */
  async getTacoDetails(index: number): Promise<CartTaco> {
    try {
      const response = await this.apiClient.postForm<{
        status: string;
        data: CartTaco;
      }>('/ajax/gtd.php', { index });
      return response.data;
    } catch (error) {
      logger.error('Failed to get taco details', error);
      throw error;
    }
  }

  /**
   * Update taco quantity
   */
  async updateTacoQuantity(index: number, action: 'increase' | 'decrease'): Promise<number> {
    try {
      const response = await this.apiClient.postForm<{
        status: string;
        quantity: number;
      }>('/ajax/owt.php', {
        action: action === 'increase' ? 'increaseQuantity' : 'decreaseQuantity',
        index,
      });
      return response.quantity;
    } catch (error) {
      logger.error('Failed to update taco quantity', error);
      throw error;
    }
  }

  /**
   * Update taco in cart
   */
  async updateTaco(index: number, config: TacoConfig): Promise<CartTaco> {
    this.validateTacoConfig(config);

    const formData = new FormData();
    formData.append('editSelectProduct', config.size);
    config.meats.forEach((meat) => {
      formData.append('viande[]', meat.slug);
      formData.append(`meat_quantity[${meat.slug}]`, String(meat.quantity));
    });
    config.sauces.forEach((sauce) => {
      formData.append('sauce[]', sauce.slug);
    });
    config.garnitures.forEach((garnish) => {
      formData.append('garniture[]', garnish.slug);
    });
    if (config.note) {
      formData.append('tacosNote', config.note);
    }

    try {
      const html = await this.apiClient.postFormData<string>('/ajax/et.php', formData);
      // Parse HTML response
      return {
        ...config,
        id: index,
        quantity: 1,
        price: 0,
      };
    } catch (error) {
      logger.error('Failed to update taco', error);
      throw error;
    }
  }

  /**
   * Delete taco from cart
   */
  async deleteTaco(index: number): Promise<void> {
    try {
      await this.apiClient.post('/ajax/dt.php', { index });
    } catch (error) {
      logger.error('Failed to delete taco', error);
      throw error;
    }
  }

  /**
   * Get cart summary
   */
  async getCartSummary(): Promise<CartSummary> {
    try {
      const summary = await this.apiClient.post<CartSummary>('/ajax/sd.php');
      return summary;
    } catch (error) {
      logger.error('Failed to get cart summary', error);
      throw error;
    }
  }

  /**
   * Get full cart
   */
  async getCart(): Promise<Cart> {
    try {
      const [tacos, extras, drinks, desserts] = await Promise.all([
        this.getCartTacos(),
        this.getSelectedExtras(),
        this.getSelectedDrinks(),
        this.getSelectedDesserts(),
      ]);

      return {
        tacos,
        extras,
        drinks,
        desserts,
      };
    } catch (error) {
      logger.error('Failed to get cart', error);
      throw error;
    }
  }

  /**
   * Add extra to cart
   */
  async addExtra(extra: Extra): Promise<void> {
    try {
      await this.apiClient.post('/ajax/ues.php', extra);
    } catch (error) {
      logger.error('Failed to add extra', error);
      throw error;
    }
  }

  /**
   * Get selected extras
   */
  async getSelectedExtras(): Promise<Extra[]> {
    try {
      const response = await this.apiClient.post<Record<string, Extra>>('/ajax/gse.php');
      return Object.values(response);
    } catch (error) {
      logger.error('Failed to get selected extras', error);
      throw error;
    }
  }

  /**
   * Add drink to cart
   */
  async addDrink(drink: Drink): Promise<void> {
    try {
      await this.apiClient.post('/ajax/ubs.php', drink);
    } catch (error) {
      logger.error('Failed to add drink', error);
      throw error;
    }
  }

  /**
   * Get selected drinks
   */
  async getSelectedDrinks(): Promise<Drink[]> {
    try {
      const response = await this.apiClient.post<Record<string, Drink>>('/ajax/gsb.php');
      return Object.values(response);
    } catch (error) {
      logger.error('Failed to get selected drinks', error);
      throw error;
    }
  }

  /**
   * Add dessert to cart
   */
  async addDessert(dessert: Dessert): Promise<void> {
    try {
      await this.apiClient.post('/ajax/uds.php', dessert);
    } catch (error) {
      logger.error('Failed to add dessert', error);
      throw error;
    }
  }

  /**
   * Get selected desserts
   */
  async getSelectedDesserts(): Promise<Dessert[]> {
    try {
      const response = await this.apiClient.post<Record<string, Dessert>>('/ajax/gsd.php');
      return Object.values(response);
    } catch (error) {
      logger.error('Failed to get selected desserts', error);
      throw error;
    }
  }

  /**
   * Submit order
   */
  async submitOrder(customer: Customer, delivery: DeliveryInfo): Promise<Order> {
    // Validate required fields
    if (!customer.name || !customer.phone) {
      throw new ValidationError('Customer name and phone are required');
    }

    const transactionId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const formData = new FormData();
    formData.append('name', customer.name);
    formData.append('phone', customer.phone);
    formData.append('confirmPhone', customer.phone);
    if (delivery.address) {
      formData.append('address', delivery.address);
    }
    formData.append('type', delivery.type);
    if (delivery.requestedFor) {
      formData.append('requestedFor', delivery.requestedFor);
    }
    formData.append('transaction_id', transactionId);

    try {
      const order = await this.apiClient.postFormData<Order>('/ajax/RocknRoll.php', formData);
      return order;
    } catch (error) {
      logger.error('Failed to submit order', error);
      throw error;
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderIds: string[]): Promise<OrderStatusResponse[]> {
    try {
      const statuses = await this.apiClient.post<OrderStatusResponse[]>('/ajax/oh.php', {
        orders: orderIds.map((id) => ({ orderId: id })),
      });
      return statuses;
    } catch (error) {
      logger.error('Failed to get order status', error);
      throw error;
    }
  }

  /**
   * Restore order to cart
   */
  async restoreOrder(order: Order): Promise<RestoreOrderResponse> {
    try {
      const response = await this.apiClient.post<RestoreOrderResponse>(
        '/ajax/restore_order.php',
        { order }
      );
      return response;
    } catch (error) {
      logger.error('Failed to restore order', error);
      throw error;
    }
  }

  /**
   * Check delivery demand for time slot
   */
  async checkDeliveryDemand(time?: string): Promise<DeliveryDemand> {
    try {
      const response = await this.apiClient.post<{
        status: string;
        is_high_demand: boolean;
        message?: string;
      }>('/ajax/check_delivery_demand.php', time ? { time } : { check_all: true });

      return {
        time: time || '',
        isHighDemand: response.is_high_demand,
        message: response.message,
      };
    } catch (error) {
      logger.error('Failed to check delivery demand', error);
      throw error;
    }
  }

  /**
   * Validate taco configuration
   */
  private validateTacoConfig(config: TacoConfig): void {
    const sizeLimits: Record<TacoSize, number> = {
      tacos_L: 1,
      tacos_BOWL: 2,
      tacos_L_mixte: 3,
      tacos_XL: 3,
      tacos_XXL: 4,
      tacos_GIGA: 5,
    };

    const maxMeats = sizeLimits[config.size];
    if (config.meats.length > maxMeats) {
      throw new ValidationError(
        `Maximum ${maxMeats} meat(s) allowed for ${config.size}`
      );
    }

    if (config.sauces.length > 3) {
      throw new ValidationError('Maximum 3 sauces allowed');
    }

    if (config.size === 'tacos_BOWL' && config.garnitures.length > 0) {
      throw new ValidationError('BOWL size does not allow garnitures');
    }

    if (config.meats.length === 0) {
      throw new ValidationError('At least one meat selection is required');
    }

    if (config.sauces.length === 0) {
      throw new ValidationError('At least one sauce selection is required');
    }

    if (config.size !== 'tacos_BOWL' && config.garnitures.length === 0) {
      throw new ValidationError('At least one garniture selection is required');
    }
  }
}

/**
 * Singleton instance
 */
let serviceInstance: TacosApiService | null = null;

/**
 * Get the tacos API service instance
 */
export function getTacosApiService(): TacosApiService {
  if (!serviceInstance) {
    serviceInstance = new TacosApiService();
  }
  return serviceInstance;
}
