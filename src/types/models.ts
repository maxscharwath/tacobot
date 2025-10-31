/**
 * Core type definitions for the Tacos Ordering API
 * 
 * These types represent the data structures used throughout the application
 * and match the backend API documentation.
 */

/**
 * Taco sizes available in the system
 */
export type TacoSize =
  | 'tacos_L'
  | 'tacos_BOWL'
  | 'tacos_L_mixte'
  | 'tacos_XL'
  | 'tacos_XXL'
  | 'tacos_GIGA';

/**
 * Order type (delivery or pickup)
 */
export type OrderType = 'livraison' | 'emporter';

/**
 * Order status lifecycle
 */
export type OrderStatus = 'pending' | 'confirmed' | 'ondelivery' | 'delivered' | 'cancelled';

/**
 * Product category
 */
export type ProductCategory = 'viandes' | 'sauces' | 'garnitures' | 'desserts' | 'boissons' | 'extras';

/**
 * Meat selection with quantity
 */
export interface MeatSelection {
  slug: string;
  name: string;
  quantity: number;
}

/**
 * Sauce selection
 */
export interface SauceSelection {
  slug: string;
  name: string;
}

/**
 * Garniture selection
 */
export interface GarnitureSelection {
  slug: string;
  name: string;
}

/**
 * Free sauce included with extras
 */
export interface FreeSauce {
  id: string;
  name: string;
  price: number;
}

/**
 * Taco configuration
 */
export interface TacoConfig {
  size: TacoSize;
  meats: MeatSelection[];
  sauces: SauceSelection[];
  garnitures: GarnitureSelection[];
  note?: string;
}

/**
 * Taco in cart with index and price
 */
export interface CartTaco extends TacoConfig {
  id: number; // Index in cart
  quantity: number;
  price: number;
}

/**
 * Extra item (snacks, sides)
 */
export interface Extra {
  id: string;
  name: string;
  price: number;
  quantity: number;
  free_sauce?: FreeSauce;
  free_sauces?: FreeSauce[];
}

/**
 * Drink item
 */
export interface Drink {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Dessert item
 */
export interface Dessert {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Cart contents
 */
export interface Cart {
  tacos: CartTaco[];
  extras: Extra[];
  drinks: Drink[];
  desserts: Dessert[];
}

/**
 * Cart summary by category
 */
export interface CategorySummary {
  totalQuantity: number;
  totalPrice: number;
}

/**
 * Cart summary with totals
 */
export interface CartSummary {
  tacos: CategorySummary;
  extras: CategorySummary;
  boissons: CategorySummary;
  desserts: CategorySummary;
}

/**
 * Stock availability for a product
 */
export interface StockStatus {
  in_stock: boolean;
}

/**
 * Stock availability for all products
 */
export interface StockAvailability {
  viandes: Record<string, StockStatus>;
  sauces: Record<string, StockStatus>;
  garnitures: Record<string, StockStatus>;
  desserts: Record<string, StockStatus>;
  boissons: Record<string, StockStatus>;
  extras: Record<string, StockStatus>;
}

/**
 * Customer information
 */
export interface Customer {
  name: string;
  phone: string;
}

/**
 * Delivery information
 */
export interface DeliveryInfo {
  type: OrderType;
  address?: string;
  requestedFor?: string; // Time slot (e.g., "15:00")
}

/**
 * Order data structure
 */
export interface OrderData {
  status: OrderStatus;
  type: OrderType;
  date: string;
  price: number;
  requestedFor?: string;
  tacos?: CartTaco[];
  extras?: Extra[];
  boissons?: Drink[];
  desserts?: Dessert[];
}

/**
 * Complete order structure
 */
export interface Order {
  orderId: string;
  OrderData: OrderData;
}

/**
 * Order status response
 */
export interface OrderStatusResponse {
  orderId: string;
  status: OrderStatus;
  updatedAt?: string;
}

/**
 * Restore order response
 */
export interface RestoreOrderResponse {
  status: 'success' | 'warning';
  out_of_stock_items?: string[];
}

/**
 * Delivery demand check
 */
export interface DeliveryDemand {
  time: string;
  isHighDemand: boolean;
  message?: string;
}

/**
 * Delivery time slots with demand
 */
export interface DeliveryTimeSlots {
  slots: DeliveryDemand[];
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
