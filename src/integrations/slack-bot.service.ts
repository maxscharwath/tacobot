/**
 * Slack Bot Integration
 * Handles Slack bot commands and interactions for tacos ordering
 */

import { App } from '@slack/bolt';
import { getTacosApiService } from '@/services/tacos-api.service';
import { logger } from '@/utils/logger';
import { getConfig } from '@/utils/config';

/**
 * Slack Bot Service
 */
export class SlackBotService {
  private app: App | null = null;
  private readonly config = getConfig();

  /**
   * Initialize Slack bot
   */
  async initialize(): Promise<void> {
    if (!this.config.slack) {
      logger.warn('Slack configuration not found, skipping Slack bot initialization');
      return;
    }

    this.app = new App({
      token: this.config.slack.botToken,
      signingSecret: this.config.slack.signingSecret,
      socketMode: !!this.config.slack.appToken,
      appToken: this.config.slack.appToken,
    });

    this.setupHandlers();
    await this.app.start();

    logger.info(`⚡️ Slack Bot is running!`);
  }

  /**
   * Setup command and event handlers
   */
  private setupHandlers(): void {
    if (!this.app) return;

    // Handle /tacos command
    this.app.command('/tacos', async ({ command, ack, respond }) => {
      await ack();

      try {
        const service = getTacosApiService();
        const stock = await service.getStockAvailability();

        await respond({
          text: '🌮 Tacos Ordering System',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*🌮 Tacos Ordering System*\n\nUse the following commands:\n• `/tacos-menu` - View menu\n• `/tacos-cart` - View cart\n• `/tacos-order` - Place order',
              },
            },
          ],
        });
      } catch (error) {
        logger.error('Slack command error', error);
        await respond({
          text: 'Sorry, an error occurred. Please try again later.',
        });
      }
    });

    // Handle /tacos-menu command
    this.app.command('/tacos-menu', async ({ command, ack, respond }) => {
      await ack();

      try {
        const service = getTacosApiService();
        const stock = await service.getStockAvailability();

        const blocks = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*📋 Available Menu*\n\n*Taco Sizes:*\n• L - 1 meat, 3 sauces max\n• BOWL - 2 meats, 3 sauces max\n• XL - 3 meats, 3 sauces max\n• XXL - 4 meats, 3 sauces max\n• GIGA - 5 meats, 3 sauces max',
            },
          },
        ];

        await respond({
          text: 'Menu',
          blocks,
        });
      } catch (error) {
        logger.error('Slack menu command error', error);
        await respond({
          text: 'Sorry, unable to fetch menu. Please try again later.',
        });
      }
    });

    // Handle /tacos-cart command
    this.app.command('/tacos-cart', async ({ command, ack, respond }) => {
      await ack();

      try {
        const service = getTacosApiService();
        const cart = await service.getCart();
        const summary = await service.getCartSummary();

        const totalItems = cart.tacos.length + cart.extras.length + cart.drinks.length + cart.desserts.length;
        const totalPrice =
          summary.tacos.totalPrice +
          summary.extras.totalPrice +
          summary.boissons.totalPrice +
          summary.desserts.totalPrice;

        const blocks = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🛒 Your Cart*\n\n*Items:* ${totalItems}\n*Total Price:* CHF ${totalPrice.toFixed(2)}\n\n*Tacos:* ${cart.tacos.length}\n*Extras:* ${cart.extras.length}\n*Drinks:* ${cart.drinks.length}\n*Desserts:* ${cart.desserts.length}`,
            },
          },
        ];

        await respond({
          text: 'Cart',
          blocks,
        });
      } catch (error) {
        logger.error('Slack cart command error', error);
        await respond({
          text: 'Sorry, unable to fetch cart. Please try again later.',
        });
      }
    });

    // Handle /tacos-order command
    this.app.command('/tacos-order', async ({ command, ack, respond }) => {
      await ack();

      await respond({
        text: 'To place an order, please use the web interface or provide your details:',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*📝 Place Order*\n\nPlease provide:\n• Name\n• Phone number\n• Delivery type (livraison/emporter)\n• Address (if delivery)',
            },
          },
        ],
      });
    });

    // Error handler
    this.app.error((error) => {
      logger.error('Slack bot error', error);
    });
  }

  /**
   * Stop Slack bot
   */
  async stop(): Promise<void> {
    if (this.app) {
      await this.app.stop();
      logger.info('Slack bot stopped');
    }
  }
}

/**
 * Singleton instance
 */
let slackBotInstance: SlackBotService | null = null;

/**
 * Get Slack bot service instance
 */
export function getSlackBotService(): SlackBotService {
  if (!slackBotInstance) {
    slackBotInstance = new SlackBotService();
  }
  return slackBotInstance;
}
