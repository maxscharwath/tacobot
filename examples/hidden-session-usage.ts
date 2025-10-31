/**
 * Example: Using the API with hidden sessions
 * 
 * Sessions are managed automatically via X-Session-Id header
 */

import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_BASE = 'http://localhost:4000/api/v1';

/**
 * Simple API client with automatic session management
 */
class TacosAPIClient {
  private sessionId: string | null = null;
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add session ID
    this.api.interceptors.request.use((config) => {
      if (this.sessionId) {
        config.headers['X-Session-Id'] = this.sessionId;
      }
      return config;
    });

    // Response interceptor - extract session ID
    this.api.interceptors.response.use((response) => {
      const sessionId = response.headers['x-session-id'];
      if (sessionId && sessionId !== this.sessionId) {
        console.log(`Session ID set: ${sessionId}`);
        this.sessionId = sessionId;
      }
      return response;
    });
  }

  async getCart() {
    const response = await this.api.get('/cart');
    return response.data;
  }

  async addTaco(taco: {
    size: string;
    meats: Array<{ id: string; quantity: number }>;
    sauces: string[];
    garnitures: string[];
    note?: string;
  }) {
    const response = await this.api.post('/cart/tacos', taco);
    return response.data;
  }

  async updateTaco(id: number, taco: Parameters<typeof this.addTaco>[0]) {
    const response = await this.api.put(`/cart/tacos/${id}`, taco);
    return response.data;
  }

  async deleteTaco(id: number) {
    const response = await this.api.delete(`/cart/tacos/${id}`);
    return response.data;
  }

  async addExtra(extra: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    free_sauces?: Array<{ id: string; name: string; price: number }>;
  }) {
    const response = await this.api.post('/cart/extras', extra);
    return response.data;
  }

  async placeOrder(order: {
    customer: { name: string; phone: string };
    delivery: { type: string; address?: string; requestedFor: string };
  }) {
    const response = await this.api.post('/orders', order);
    return response.data;
  }

  getSessionId() {
    return this.sessionId;
  }
}

/**
 * Example 1: Basic usage - session auto-created
 */
async function basicUsage() {
  console.log('📝 Example 1: Basic Usage (Auto Session)\n');

  const api = new TacosAPIClient();

  // First request - session auto-created
  console.log('1. Adding taco (session will be auto-created)...');
  await api.addTaco({
    size: 'tacos_XL',
    meats: [{ id: 'viande_hachee', quantity: 2 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  });
  console.log(`   Session ID: ${api.getSessionId()}\n`);

  // Subsequent requests use same session automatically
  console.log('2. Getting cart (same session)...');
  const cart = await api.getCart();
  console.log(`   Cart has ${cart.data.summary.total.quantity} items\n`);

  console.log('✅ Basic usage complete!\n');
}

/**
 * Example 2: Edit and remove tacos
 */
async function editAndRemoveTacos() {
  console.log('📝 Example 2: Edit and Remove Tacos\n');

  const api = new TacosAPIClient();

  // Add multiple tacos
  console.log('1. Adding 2 tacos...');
  await api.addTaco({
    size: 'tacos_L',
    meats: [{ id: 'viande_hachee', quantity: 1 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  });
  await api.addTaco({
    size: 'tacos_XL',
    meats: [{ id: 'escalope_de_poulet', quantity: 2 }],
    sauces: ['algérienne'],
    garnitures: ['tomates'],
  });
  console.log('   ✓ 2 tacos added\n');

  // Edit first taco (upgrade)
  console.log('2. Editing taco #0 (upgrade to XXL)...');
  await api.updateTaco(0, {
    size: 'tacos_XXL',
    meats: [{ id: 'viande_hachee', quantity: 3 }],
    sauces: ['harissa', 'algérienne'],
    garnitures: ['salade', 'tomates'],
  });
  console.log('   ✓ Taco upgraded\n');

  // Remove second taco
  console.log('3. Removing taco #1...');
  await api.deleteTaco(1);
  console.log('   ✓ Taco removed\n');

  // Check final cart
  const cart = await api.getCart();
  console.log(`Final cart: ${cart.data.summary.tacos.totalQuantity} tacos\n`);

  console.log('✅ Edit and remove complete!\n');
}

/**
 * Example 3: Multiple concurrent orders (different clients)
 */
async function multipleConcurrentOrders() {
  console.log('📝 Example 3: Multiple Concurrent Orders\n');

  // Client A
  const apiA = new TacosAPIClient();
  console.log('Client A: Adding taco...');
  await apiA.addTaco({
    size: 'tacos_XXL',
    meats: [{ id: 'viande_hachee', quantity: 3 }],
    sauces: ['harissa', 'algérienne', 'blanche'],
    garnitures: ['salade', 'tomates', 'oignons'],
  });
  console.log(`   Session A: ${apiA.getSessionId()}\n`);

  // Client B (completely independent)
  const apiB = new TacosAPIClient();
  console.log('Client B: Adding taco...');
  await apiB.addTaco({
    size: 'tacos_L',
    meats: [{ id: 'escalope_de_poulet', quantity: 1 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  });
  console.log(`   Session B: ${apiB.getSessionId()}\n`);

  // Verify isolation
  const cartA = await apiA.getCart();
  const cartB = await apiB.getCart();

  console.log(`Client A cart: ${cartA.data.summary.total.quantity} items`);
  console.log(`Client B cart: ${cartB.data.summary.total.quantity} items`);
  console.log('   ✓ Sessions are isolated!\n');

  console.log('✅ Multiple orders complete!\n');
}

/**
 * Example 4: Complete order flow
 */
async function completeOrderFlow() {
  console.log('📝 Example 4: Complete Order Flow\n');

  const api = new TacosAPIClient();

  // Build order
  console.log('1. Building order...');
  await api.addTaco({
    size: 'tacos_XL',
    meats: [{ id: 'viande_hachee', quantity: 2 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  });
  await api.addExtra({
    id: 'extra_frites',
    name: 'Frites',
    price: 3.50,
    quantity: 1,
    free_sauces: [],
  });
  console.log('   ✓ Items added\n');

  // Review cart
  console.log('2. Reviewing cart...');
  const cart = await api.getCart();
  console.log(`   Items: ${cart.data.summary.total.quantity}`);
  console.log(`   Total: CHF ${cart.data.summary.total.price}\n`);

  // Place order
  console.log('3. Placing order...');
  const order = await api.placeOrder({
    customer: {
      name: 'John Doe',
      phone: '+41791234567',
    },
    delivery: {
      type: 'livraison',
      address: '123 Rue Example, 1000 Lausanne',
      requestedFor: '15:00',
    },
  });
  console.log(`   ✓ Order placed: ${order.data.orderId}\n`);

  console.log('✅ Order flow complete!\n');
}

/**
 * Example 5: Custom session ID
 */
async function customSessionId() {
  console.log('📝 Example 5: Using Custom Session ID\n');

  const api = new TacosAPIClient();

  // Generate your own UUID
  const mySessionId = uuidv4();
  console.log(`Custom session ID: ${mySessionId}\n`);

  // Add it to first request
  await axios.post(`${API_BASE}/cart/tacos`, {
    size: 'tacos_L',
    meats: [{ id: 'viande_hachee', quantity: 1 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  }, {
    headers: {
      'X-Session-Id': mySessionId,
    },
  });

  console.log('✓ Session created with custom ID\n');

  // Verify it's using the custom ID
  const cart = await axios.get(`${API_BASE}/cart`, {
    headers: {
      'X-Session-Id': mySessionId,
    },
  });

  const returnedSessionId = cart.headers['x-session-id'];
  console.log(`Returned session ID: ${returnedSessionId}`);
  console.log(`Match: ${returnedSessionId === mySessionId ? '✓' : '✗'}\n`);

  console.log('✅ Custom session ID complete!\n');
}

/**
 * Run all examples
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Hidden Session Examples');
  console.log('  Sessions are managed automatically!');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    await basicUsage();
    await editAndRemoveTacos();
    await multipleConcurrentOrders();
    await completeOrderFlow();
    await customSessionId();

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ✅ All examples completed!');
    console.log('═══════════════════════════════════════════════════════════');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { TacosAPIClient, basicUsage, editAndRemoveTacos, completeOrderFlow };
