/**
 * Example: Pure RESTful API with UUID in paths
 * 
 * No headers, no session endpoints - just clean RESTful URLs
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_BASE = 'http://localhost:4000/api/v1';

/**
 * Simple RESTful API client
 */
class TacosAPI {
  public cartId: string;
  private baseUrl: string;

  constructor(cartId?: string) {
    this.cartId = cartId || uuidv4();
    this.baseUrl = API_BASE;
    console.log(`📦 Cart ID: ${this.cartId}`);
  }

  private async request(method: string, path: string, data?: unknown) {
    const url = `${this.baseUrl}${path}`;
    const response = await axios({ method, url, data });
    return response.data;
  }

  // Cart operations
  async getCart() {
    return this.request('GET', `/carts/${this.cartId}`);
  }

  async addTaco(taco: {
    size: string;
    meats: Array<{ id: string; quantity: number }>;
    sauces: string[];
    garnitures: string[];
    note?: string;
  }) {
    return this.request('POST', `/carts/${this.cartId}/tacos`, taco);
  }

  async getTaco(id: number) {
    return this.request('GET', `/carts/${this.cartId}/tacos/${id}`);
  }

  async updateTaco(id: number, taco: Parameters<typeof this.addTaco>[0]) {
    return this.request('PUT', `/carts/${this.cartId}/tacos/${id}`, taco);
  }

  async updateTacoQuantity(id: number, action: 'increase' | 'decrease') {
    return this.request('PATCH', `/carts/${this.cartId}/tacos/${id}/quantity`, { action });
  }

  async deleteTaco(id: number) {
    return this.request('DELETE', `/carts/${this.cartId}/tacos/${id}`);
  }

  async addExtra(extra: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    free_sauces?: Array<{ id: string; name: string; price: number }>;
  }) {
    return this.request('POST', `/carts/${this.cartId}/extras`, extra);
  }

  async addDrink(drink: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }) {
    return this.request('POST', `/carts/${this.cartId}/drinks`, drink);
  }

  async placeOrder(order: {
    customer: { name: string; phone: string };
    delivery: { type: string; address?: string; requestedFor: string };
  }) {
    return this.request('POST', `/carts/${this.cartId}/orders`, order);
  }
}

/**
 * Example 1: Basic usage
 */
async function basicUsage() {
  console.log('\n📝 Example 1: Basic Usage\n');

  const api = new TacosAPI();  // Auto-generates UUID

  // Add taco
  console.log('1. Adding taco...');
  await api.addTaco({
    size: 'tacos_XL',
    meats: [{ id: 'viande_hachee', quantity: 2 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  });
  console.log('   ✓ Taco added\n');

  // Get cart
  console.log('2. Getting cart...');
  const cart = await api.getCart();
  console.log(`   Cart has ${cart.data.summary.total.quantity} items\n`);

  console.log('✅ Basic usage complete!\n');
}

/**
 * Example 2: Edit and remove tacos
 */
async function editAndRemove() {
  console.log('\n📝 Example 2: Edit and Remove\n');

  const api = new TacosAPI();

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
 * Example 3: Multiple concurrent carts
 */
async function multipleCarts() {
  console.log('\n📝 Example 3: Multiple Concurrent Carts\n');

  // Cart A
  console.log('Cart A:');
  const cartA = new TacosAPI();
  await cartA.addTaco({
    size: 'tacos_XXL',
    meats: [{ id: 'viande_hachee', quantity: 3 }],
    sauces: ['harissa', 'algérienne', 'blanche'],
    garnitures: ['salade', 'tomates', 'oignons'],
  });
  console.log('   ✓ Taco added\n');

  // Cart B (completely independent)
  console.log('Cart B:');
  const cartB = new TacosAPI();
  await cartB.addTaco({
    size: 'tacos_L',
    meats: [{ id: 'escalope_de_poulet', quantity: 1 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  });
  console.log('   ✓ Taco added\n');

  // Verify isolation
  const cartAData = await cartA.getCart();
  const cartBData = await cartB.getCart();

  console.log(`Cart A: ${cartAData.data.summary.total.quantity} items`);
  console.log(`Cart B: ${cartBData.data.summary.total.quantity} items`);
  console.log('   ✓ Carts are isolated!\n');

  console.log('✅ Multiple carts complete!\n');
}

/**
 * Example 4: Complete order flow
 */
async function completeOrderFlow() {
  console.log('\n📝 Example 4: Complete Order Flow\n');

  const api = new TacosAPI();

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
  await api.addDrink({
    id: 'boisson_coca',
    name: 'Coca Cola',
    price: 2.50,
    quantity: 1,
  });
  console.log('   ✓ Items added\n');

  // Review cart
  console.log('2. Reviewing cart...');
  const cart = await api.getCart();
  console.log(`   Items: ${cart.data.summary.total.quantity}`);
  console.log(`   Total: CHF ${cart.data.summary.total.price}\n`);

  // Edit taco (change mind - upgrade!)
  console.log('3. Upgrading taco...');
  await api.updateTaco(0, {
    size: 'tacos_XXL',
    meats: [{ id: 'viande_hachee', quantity: 3 }],
    sauces: ['harissa', 'algérienne'],
    garnitures: ['salade', 'tomates'],
  });
  console.log('   ✓ Taco upgraded\n');

  // Place order
  console.log('4. Placing order...');
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
 * Example 5: Using custom UUID
 */
async function customUUID() {
  console.log('\n📝 Example 5: Using Custom UUID\n');

  // Use your own UUID
  const myCartId = 'my-custom-uuid-12345';
  console.log(`Using custom cart ID: ${myCartId}\n`);

  const api = new TacosAPI(myCartId);

  await api.addTaco({
    size: 'tacos_L',
    meats: [{ id: 'viande_hachee', quantity: 1 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  });

  const cart = await api.getCart();
  console.log(`Cart ID in response: ${cart.data.sessionId}`);
  console.log(`Match: ${cart.data.sessionId === myCartId ? '✓' : '✗'}\n`);

  console.log('✅ Custom UUID complete!\n');
}

/**
 * Example 6: RESTful patterns
 */
async function restfulPatterns() {
  console.log('\n📝 Example 6: RESTful Patterns\n');

  const api = new TacosAPI();

  // POST - Create
  console.log('POST (Create):');
  await api.addTaco({
    size: 'tacos_L',
    meats: [{ id: 'viande_hachee', quantity: 1 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  });
  console.log(`   POST /carts/${api.cartId}/tacos ✓\n`);

  // GET - Read
  console.log('GET (Read):');
  const cart = await api.getCart();
  console.log(`   GET /carts/${api.cartId} ✓`);
  console.log(`   Cart has ${cart.data.tacos.length} tacos\n`);

  // PUT - Update
  console.log('PUT (Update):');
  await api.updateTaco(0, {
    size: 'tacos_XL',
    meats: [{ id: 'viande_hachee', quantity: 2 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  });
  console.log(`   PUT /carts/${api.cartId}/tacos/0 ✓\n`);

  // PATCH - Partial update
  console.log('PATCH (Partial Update):');
  await api.updateTacoQuantity(0, 'increase');
  console.log(`   PATCH /carts/${api.cartId}/tacos/0/quantity ✓\n`);

  // DELETE - Remove
  console.log('DELETE (Remove):');
  await api.deleteTaco(0);
  console.log(`   DELETE /carts/${api.cartId}/tacos/0 ✓\n`);

  console.log('✅ RESTful patterns complete!\n');
}

/**
 * Run all examples
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Pure RESTful API Examples');
  console.log('  UUID in path - no headers needed!');
  console.log('═══════════════════════════════════════════════════════════');

  try {
    await basicUsage();
    await editAndRemove();
    await multipleCarts();
    await completeOrderFlow();
    await customUUID();
    await restfulPatterns();

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

export { TacosAPI, basicUsage, editAndRemove, completeOrderFlow };
