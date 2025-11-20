# Push Notifications

This module provides a clean, type-safe wrapper around the Web Push API for managing push notifications in the application.

## Features

- ✅ Type-safe API with TypeScript
- ✅ Singleton client instance for efficient resource management
- ✅ Comprehensive error handling with custom error types
- ✅ Automatic service worker registration
- ✅ Permission management
- ✅ Subscription state management
- ✅ React hook for easy integration

## Usage

### Using the React Hook (Recommended)

```tsx
import { usePushNotifications } from '@/hooks';

function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    isSubscribing,
    permission,
    error,
    errorCode,
    subscribe,
    unsubscribe,
    refresh,
  } = usePushNotifications();

  if (!isSupported) {
    return <div>Push notifications are not supported in your browser</div>;
  }

  return (
    <div>
      <p>Permission: {permission}</p>
      {error && <p className="error">Error: {error}</p>}
      
      <button
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={isSubscribing}
      >
        {isSubscribing
          ? 'Processing...'
          : isSubscribed
            ? 'Disable Notifications'
            : 'Enable Notifications'}
      </button>
      
      <button onClick={refresh}>Refresh Status</button>
    </div>
  );
}
```

### Using the Client Directly

```tsx
import { getPushNotificationClient, PushNotificationError } from '@/lib/push-notifications';

async function enableNotifications() {
  try {
    const client = getPushNotificationClient();
    await client.initialize();
    await client.subscribe();
    console.log('Subscribed successfully!');
  } catch (error) {
    if (error instanceof PushNotificationError) {
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    }
  }
}
```

### Error Handling

The client throws `PushNotificationError` with specific error codes:

- `NOT_SUPPORTED` - Browser doesn't support push notifications
- `PERMISSION_DENIED` - User denied notification permission
- `SERVICE_WORKER_ERROR` - Failed to register service worker
- `VAPID_KEY_ERROR` - Failed to get VAPID public key
- `SUBSCRIBE_ERROR` - Failed to subscribe
- `UNSUBSCRIBE_ERROR` - Failed to unsubscribe
- `SERVER_REGISTRATION_ERROR` - Failed to register subscription with server

## API Reference

### `PushNotificationClient`

Main client class for managing push notifications.

#### Static Methods

- `isSupported()` - Check if push notifications are supported
- `getPermission()` - Get current notification permission status
- `requestPermission()` - Request notification permission from user

#### Instance Methods

- `initialize()` - Initialize the client (register service worker, get VAPID key)
- `subscribe()` - Subscribe to push notifications
- `unsubscribe()` - Unsubscribe from push notifications
- `getSubscription()` - Get current subscription
- `isSubscribed()` - Check if currently subscribed

### `usePushNotifications()` Hook

React hook that provides:

- `isSupported` - Boolean indicating browser support
- `isSubscribed` - Boolean indicating subscription status
- `isSubscribing` - Boolean indicating if operation is in progress
- `permission` - Current notification permission status
- `error` - Error message if any
- `errorCode` - Error code for programmatic handling
- `subscribe()` - Function to subscribe
- `unsubscribe()` - Function to unsubscribe
- `refresh()` - Function to refresh subscription status

## Service Worker

The service worker (`/public/sw.js`) handles:
- Push event reception
- Notification display
- Notification click handling
- Notification close tracking

Make sure the service worker is registered in your app (done automatically in `RootLayout`).

