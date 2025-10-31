/**
 * Main application entry point
 * Initializes and starts both Slack bot and Web API server
 */

import { getConfig } from '@/utils/config';
import { logger } from '@/utils/logger';
import { getSlackBotService } from '@/integrations/slack-bot.service';
import { WebApiServer } from '@/api/web-server';

/**
 * Application class
 */
class Application {
  private webServer: WebApiServer;
  private slackBot = getSlackBotService();

  constructor() {
    this.webServer = new WebApiServer();
  }

  /**
   * Initialize and start the application
   */
  async start(): Promise<void> {
    try {
      const config = getConfig();

      logger.info('🚀 Starting Tacos API Integration...');
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Backend API: ${config.backendApi.baseUrl}`);

      // Start web API server
      await this.webServer.start();

      // Start Slack bot (if configured)
      if (config.slack) {
        await this.slackBot.initialize();
      } else {
        logger.info('ℹ️  Slack bot not configured, skipping...');
      }

      logger.info('✅ Application started successfully');

      // Graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('Failed to start application', error);
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      try {
        await this.slackBot.stop();
        logger.info('✅ Application shut down successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

// Start application
if (require.main === module) {
  const app = new Application();
  app.start().catch((error) => {
    logger.error('Fatal error', error);
    process.exit(1);
  });
}
