/**
 * Configuration management
 * Loads and validates environment variables
 */

import dotenv from 'dotenv';
import { AppConfig } from '@/types/config';

dotenv.config();

/**
 * Load and validate configuration from environment variables
 */
export function loadConfig(): AppConfig {
  const requiredEnvVars = ['BACKEND_API_BASE_URL'];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  const config: AppConfig = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    backendApi: {
      baseUrl: process.env.BACKEND_API_BASE_URL!,
      csrfTokenRefreshInterval: parseInt(
        process.env.CSRF_TOKEN_REFRESH_INTERVAL || '1800000',
        10
      ),
    },
    logging: {
      level: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
    },
  };

  // Slack configuration is optional
  if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET) {
    config.slack = {
      botToken: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      appToken: process.env.SLACK_APP_TOKEN || '',
    };
  }

  return config;
}

/**
 * Singleton configuration instance
 */
let configInstance: AppConfig | null = null;

/**
 * Get the application configuration
 */
export function getConfig(): AppConfig {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}
