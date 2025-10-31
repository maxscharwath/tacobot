/**
 * Example: Pure RESTful API with UUIDs in paths
 * 
 * Both carts and tacos use UUIDs - fully RESTful!
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
    const response = await this.request('POST', `/carts/${this.cartId}/tacos`, taco);
    return response.data;  // Returns taco with UUID
  }

  async getTaco(tacoId: string) {
    return this.request('GET', `/carts/${this.cartId}/tacos/${tacoId}`);
  }

  async updateTaco(tacoId: string, taco: Parameters<typeof this.addTaco>[0]) {
    return this.request('PUT', `/carts/${this.cartId}/tacos/${tacoId}`, taco);
  }

  async updateTacoQuantity(tacoId: string, action: 'increase' | 'decrease') {
    return this.request('PATCH', `/carts/${this.cartId}/tacos/${tacoId}/quantity`, { action });
  }

  async deleteTaco(tacoId: string) {
    return this.request('DELETE', `/carts/${this.cartId}/tacos/${tacoId}`);
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
 * Example 1: Basic usage with UUID tacos
 */
async function basicUsage() {
  console.log('\n📝 Example 1: Basic Usage with UUID Tacos\n');

  const api = new TacosAPI();

  // Add taco - returns taco with UUID
  console.log('1. Adding taco...');
  const taco = await api.addTaco({
    size: 'tacos_XL',
    meats: [{ id: 'viande_hachee', quantity: 2 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  });
  console.log(`   ✓ Taco added with ID: ${taco.id}\n`);

  // Get cart
  console.log('2. Getting cart...');
  const cart = await api.getCart();
  console.log(`   Cart has ${cart.data.summary.total.quantity} items\n`);

  console.log('✅ Basic usage complete!\n');
}

/**
 * Example 2: Edit and remove tacos by UUID
 */
async function editAndRemove() {
  console.log('\n📝 Example 2: Edit and Remove by UUID\n');

  const api = new TacosAPI();

  // Add multiple tacos
  console.log('1. Adding 2 tacos...');
  const taco1 = await api.addTaco({
    size: 'tacos_L',
    meats: [{ id: 'viande_hachee', quantity: 1 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  });
  console.log(`   Taco 1 ID: ${taco1.id}`);

  const taco2 = await api.addTaco({
    size: 'tacos_XL',
    meats: [{ id: 'escalope_de_poulet', quantity: 2 }],
    sauces: ['algérienne'],
    garnitures: ['tomates'],
  });
  console.log(`   Taco 2 ID: ${taco2.id}\n`);

  // Edit first taco using its UUID
  console.log(`2. Editing taco ${taco1.id} (upgrade to XXL)...`);
  await api.updateTaco(taco1.id, {
    size: 'tacos_XXL',
    meats: [{ id: 'viande_hachee', quantity: 3 }],
    sauces: ['harissa', 'algérienne'],
    garnitures: ['salade', 'tomates'],
  });
  console.log('   ✓ Taco upgraded\n');

  // Remove second taco using its UUID
  console.log(`3. Removing taco ${taco2.id}...`);
  await api.deleteTaco(taco2.id);
  console.log('   ✓ Taco removed\n');

  // Check final cart
  const cart = await api.getCart();
  console.log(`Final cart: ${cart.data.summary.tacos.totalQuantity} tacos\n`);

  console.log('✅ Edit and remove complete!\n');
}

/**
 * Example 3: Complete order flow with UUID tracking
 */
async function completeOrderFlow() {
  console.log('\n📝 Example 3: Complete Order Flow\n');

  const api = new TacosAPI();
  const tacoIds: string[] = [];

  // Build order
  console.log('1. Building order...');
  const taco1 = await api.addTaco({
    size: 'tacos_XL',
    meats: [{ id: 'viande_hachee', quantity: 2 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  });
  tacoIds.push(taco1.id);
  console.log(`   Taco 1: ${taco1.id}`);

  const taco2 = await api.addTaco({
    size: 'tacos_L',
    meats: [{ id: 'escalope_de_poulet', quantity: 1 }],
    sauces: ['algérienne'],
    garnitures: ['tomates'],
  });
  tacoIds.push(taco2.id);
  console.log(`   Taco 2: ${taco2.id}`);

  await api.addExtra({
    id: 'extra_frites',
    name: 'Frites',
    price: 3.50,
    quantity: 1,
    free_sauces: [],
  });
  console.log('   ✓ Items added\n');

  // Change mind - upgrade first taco
  console.log('2. Upgrading first taco...');
  await api.updateTaco(tacoIds[0]!, {
    size: 'tacos_XXL',
    meats: [{ id: 'viande_hachee', quantity: 3 }],
    sauces: ['harissa', 'algérienne'],
    garnitures: ['salade', 'tomates'],
  });
  console.log('   ✓ Upgraded\n');

  // Review cart
  console.log('3. Reviewing cart...');
  const cart = await api.getCart();
  console.log(`   Items: ${cart.data.summary.total.quantity}`);
  console.log(`   Total: CHF ${cart.data.summary.total.price}\n`);

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
 * Example 4: RESTful patterns with UUIDs
 */
async function restfulPatterns() {
  console.log('\n📝 Example 4: RESTful Patterns\n');

  const api = new TacosAPI();

  // POST - Create (returns resource with UUID)
  console.log('POST (Create):');
  const taco = await api.addTaco({
    size: 'tacos_L',
    meats: [{ id: 'viande_hachee', quantity: 1 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  });
  console.log(`   POST /carts/${api.cartId}/tacos`);
  console.log(`   Created taco: ${taco.id} ✓\n`);

  // GET - Read (by UUID)
  console.log('GET (Read by UUID):');
  const fetchedTaco = await api.getTaco(taco.id);
  console.log(`   GET /carts/${api.cartId}/tacos/${taco.id} ✓\n`);

  // PUT - Update (by UUID)
  console.log('PUT (Update by UUID):');
  await api.updateTaco(taco.id, {
    size: 'tacos_XL',
    meats: [{ id: 'viande_hachee', quantity: 2 }],
    sauces: ['harissa'],
    garnitures: ['salade'],
  });
  console.log(`   PUT /carts/${api.cartId}/tacos/${taco.id} ✓\n`);

  // PATCH - Partial update (by UUID)
  console.log('PATCH (Partial Update by UUID):');
  await api.updateTacoQuantity(taco.id, 'increase');
  console.log(`   PATCH /carts/${api.cartId}/tacos/${taco.id}/quantity ✓\n`);

  // DELETE - Remove (by UUID)
  console.log('DELETE (Remove by UUID):');
  await api.deleteTaco(taco.id);
  console.log(`   DELETE /carts/${api.cartId}/tacos/${taco.id} ✓\n`);

  console.log('✅ RESTful patterns complete!\n');
}

/**
 * Example 5: Managing multiple tacos by UUID
 */
async function managingMultipleTacos() {
  console.log('\n📝 Example 5: Managing Multiple Tacos\n');

  const api = new TacosAPI();
  const tacos: Array<{ id: string; size: string }> = [];

  // Add 3 tacos
  console.log('1. Adding 3 tacos...');
  for (let i = 0; i < 3; i++) {
    const taco = await api.addTaco({
      size: 'tacos_L',
      meats: [{ id: 'viande_hachee', quantity: 1 }],
      sauces: ['harissa'],
      garnitures: ['salade'],
    });
    tacos.push({ id: taco.id, size: 'tacos_L' });
    console.log(`   Taco ${i + 1}: ${taco.id}`);
  }
  console.log();

  // Upgrade middle taco
  console.log('2. Upgrading middle taco...');
  await api.updateTaco(tacos[1]!.id, {
    size: 'tacos_XXL',
    meats: [{ id: 'viande_hachee', quantity: 3 }],
    sauces: ['harissa', 'algérienne'],
    garnitures: ['salade', 'tomates'],
  });
  console.log(`   ✓ Taco ${tacos[1]!.id} upgraded to XXL\n`);

  // Remove first and last tacos
  console.log('3. Removing first and last tacos...');
  await api.deleteTaco(tacos[0]!.id);
  await api.deleteTaco(tacos[2]!.id);
  console.log('   ✓ 2 tacos removed\n');

  // Only middle taco remains
  const cart = await api.getCart();
  console.log(`Final cart: ${cart.data.summary.tacos.totalQuantity} taco (the upgraded one)\n`);

  console.log('✅ Multiple tacos managed!\n');
}

/**
 * Run all examples
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Pure RESTful API with UUIDs');
  console.log('  Carts use UUIDs, Tacos use UUIDs - Fully RESTful!');
  console.log('═══════════════════════════════════════════════════════════');

  try {
    await basicUsage();
    await editAndRemove();
    await completeOrderFlow();
    await restfulPatterns();
    await managingMultipleTacos();

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
