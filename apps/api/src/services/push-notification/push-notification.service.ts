/**
 * Push notification service
 * @module services/push-notification
 */

import { injectable } from 'tsyringe';
import webpush from 'web-push';
import { PushSubscriptionRepository } from '../../infrastructure/repositories/push-subscription.repository';
import { UserId } from '../../schemas/user.schema';
import { inject } from '../../shared/utils/inject.utils';
import { logger } from '../../shared/utils/logger.utils';
import { randomUUID } from '../../shared/utils/uuid.utils';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  url?: string;
}

@injectable()
export class PushNotificationService {
  private readonly pushSubscriptionRepository = inject(PushSubscriptionRepository);
  private readonly vapidPublicKey: string;
  private readonly vapidPrivateKey: string;
  private readonly vapidSubject: string;

  constructor() {
    this.vapidPublicKey = process.env['VAPID_PUBLIC_KEY'] || '';
    this.vapidPrivateKey = process.env['VAPID_PRIVATE_KEY'] || '';
    this.vapidSubject =
      process.env['VAPID_SUBJECT'] || process.env['FRONTEND_URL'] || 'mailto:admin@example.com';

    if (this.vapidPublicKey && this.vapidPrivateKey) {
      webpush.setVapidDetails(this.vapidSubject, this.vapidPublicKey, this.vapidPrivateKey);
    } else {
      logger.warn('VAPID keys not configured. Push notifications will not work.');
    }
  }

  async sendToUser(userId: UserId, payload: PushNotificationPayload): Promise<void> {
    if (!this.vapidPublicKey || !this.vapidPrivateKey) {
      logger.warn('Cannot send push notification: VAPID keys not configured');
      return;
    }

    const subscriptions = await this.pushSubscriptionRepository.findByUserId(userId);
    if (subscriptions.length === 0) {
      logger.debug('No push subscriptions found for user', { userId });
      return;
    }

    // Generate a unique tag for each notification to allow multiple notifications
    // If a tag is provided, append a UUID to make it unique
    const uniqueTag = payload.tag ? `${payload.tag}-${randomUUID()}` : randomUUID();

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      tag: uniqueTag,
      data: {
        ...payload.data,
        url: payload.url,
      },
    });

    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          notificationPayload
        );
        logger.debug('Push notification sent', { userId, endpoint: subscription.endpoint });
      } catch (error) {
        logger.error('Failed to send push notification', {
          userId,
          endpoint: subscription.endpoint,
          error,
        });

        // Remove invalid subscriptions (410 = Gone, 404 = Not Found)
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (statusCode === 410 || statusCode === 404) {
            logger.info('Removing invalid push subscription', { endpoint: subscription.endpoint });
            await this.pushSubscriptionRepository.delete(subscription.endpoint).catch(() => {
              // Ignore deletion errors
            });
          }
        }
      }
    });

    await Promise.allSettled(sendPromises);
  }

  getPublicKey(): string {
    return this.vapidPublicKey;
  }
}
