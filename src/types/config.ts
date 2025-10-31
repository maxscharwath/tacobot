/**
 * Configuration types and interfaces
 */

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  backendApi: {
    baseUrl: string;
    csrfTokenRefreshInterval: number;
  };
  slack?: {
    botToken: string;
    signingSecret: string;
    appToken: string;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
  };
}
