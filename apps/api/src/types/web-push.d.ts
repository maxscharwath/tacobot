/**
 * Type declarations for web-push
 * @module types/web-push
 */

declare module 'web-push' {
  export interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  export interface SendResult {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  }

  export function sendNotification(
    subscription: PushSubscription,
    payload: string,
    options?: {
      vapidDetails?: {
        subject: string;
        publicKey: string;
        privateKey: string;
      };
      headers?: Record<string, string>;
      proxy?: string;
      TTL?: number;
      urgency?: 'very-low' | 'low' | 'normal' | 'high';
    }
  ): Promise<SendResult>;

  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;

  export function generateVAPIDKeys(): {
    publicKey: string;
    privateKey: string;
  };
}

