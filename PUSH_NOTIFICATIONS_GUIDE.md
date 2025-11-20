# Push Notifications - Backend Integration Guide

## Current Implementation

### ✅ Already Implemented

#### 1. **Payment Status Update**
**Location:** `apps/api/src/services/user-order/update-user-order-user-payment.service.ts`

**When:** User marks their order as paid/unpaid

**Who gets notified:** Group order leader

**Code:**
```typescript
// Line 57-77
if (paid && groupOrder.leaderId !== requesterId) {
  this.pushNotificationService.sendToUser(groupOrder.leaderId, {
    title: 'Order Payment Update',
    body: `${userName} marked their order as paid`,
    tag: `payment-${groupOrderId}-${userOrderId}`,
    url: `/orders/${groupOrderId}`,
    data: { groupOrderId, userOrderId, type: 'payment' },
  });
}
```

#### 2. **Reimbursement Status Update**
**Location:** `apps/api/src/services/user-order/update-user-order-reimbursement.service.ts`

**When:** Leader marks an order as reimbursed/unreimbursed

**Who gets notified:** Order owner (the user whose order was reimbursed)

**Code:**
```typescript
// Line 49-69
if (userOrder.userId !== requesterId) {
  this.pushNotificationService.sendToUser(userOrder.userId, {
    title: 'Reimbursement Update',
    body: reimbursed
      ? 'Your order has been marked as reimbursed'
      : 'Your order reimbursement status has been updated',
    tag: `reimbursement-${groupOrderId}-${userOrderId}`,
    url: `/orders/${groupOrderId}`,
    data: { groupOrderId, userOrderId, type: 'reimbursement', reimbursed },
  });
}
```

#### 3. **Test Notification**
**Location:** `apps/api/src/api/routes/push-notification.routes.ts`

**When:** User clicks "Send Test" button

**Who gets notified:** Current user

---

## 🎯 Potential Places to Add Notifications

### 1. **New Order Added to Group Order**
**Location:** `apps/api/src/services/user-order/create-user-order.service.ts`

**When:** Someone adds/creates a new order in a group order

**Who should be notified:** Group order leader

**Suggested implementation:**
```typescript
// After line 106 (after userOrder is created)
// Notify the leader that a new order was added
if (groupOrder.leaderId !== userId) {
  const user = await this.userService.getUserById(userId);
  const userName = user?.name || 'Someone';
  
  this.pushNotificationService.sendToUser(groupOrder.leaderId, {
    title: 'New Order Added',
    body: `${userName} added an order to "${groupOrder.name || 'the group order'}"`,
    tag: `new-order-${groupOrderId}-${userOrder.id}`,
    url: `/orders/${groupOrderId}`,
    data: { groupOrderId, userOrderId: userOrder.id, type: 'new_order' },
  }).catch(() => {});
}
```

### 2. **Group Order Submitted**
**Location:** `apps/api/src/services/group-order/submit-group-order.service.ts`

**When:** Leader submits the group order to the backend

**Who should be notified:** All participants (users who have orders in the group)

**Suggested implementation:**
```typescript
// After line 78 (after status is updated to SUBMITTED)
// Notify all participants
const participantIds = [...new Set(userOrders.map(order => order.userId))];
const notificationPromises = participantIds.map(participantId => 
  this.pushNotificationService.sendToUser(participantId, {
    title: 'Order Submitted',
    body: `The group order "${groupOrder.name || 'has been'}" submitted successfully!`,
    tag: `submitted-${groupOrderId}`,
    url: `/orders/${groupOrderId}`,
    data: { groupOrderId, type: 'submitted', orderId: result.orderId },
  }).catch(() => {})
);
await Promise.allSettled(notificationPromises);
```

### 3. **Group Order Status Changed (Closed/Reopened)**
**Location:** `apps/api/src/services/group-order/update-group-order-status.service.ts`

**When:** Leader manually closes or reopens a group order

**Who should be notified:** All participants

**Suggested implementation:**
```typescript
// After line 33 (after status is updated)
// Get all participants
const userOrders = await this.userOrderRepository.findByGroupOrderId(groupOrderId);
const participantIds = [...new Set(userOrders.map(order => order.userId))];

// Notify all participants
const statusMessage = nextStatus === GroupOrderStatus.CLOSED 
  ? 'closed' 
  : 'reopened';
  
const notificationPromises = participantIds.map(participantId => 
  this.pushNotificationService.sendToUser(participantId, {
    title: 'Order Status Changed',
    body: `The group order "${groupOrder.name || 'has been'}" ${statusMessage}`,
    tag: `status-${groupOrderId}-${nextStatus}`,
    url: `/orders/${groupOrderId}`,
    data: { groupOrderId, type: 'status_change', status: nextStatus },
  }).catch(() => {})
);
await Promise.allSettled(notificationPromises);
```

### 4. **Order Deleted**
**Location:** `apps/api/src/services/user-order/delete-user-order.service.ts`

**When:** Someone deletes their order (or leader deletes an order)

**Who should be notified:** Group order leader (if user deleted their own), or order owner (if leader deleted it)

**Suggested implementation:**
```typescript
// After line 52 (after order is deleted)
if (isOwnOrder && groupOrder.leaderId !== deleterUserId) {
  // User deleted their own order - notify leader
  const user = await this.userService.getUserById(deleterUserId);
  const userName = user?.name || 'Someone';
  
  this.pushNotificationService.sendToUser(groupOrder.leaderId, {
    title: 'Order Removed',
    body: `${userName} removed their order from "${groupOrder.name || 'the group order'}"`,
    tag: `order-deleted-${groupOrderId}-${orderId}`,
    url: `/orders/${groupOrderId}`,
    data: { groupOrderId, orderId, type: 'order_deleted' },
  }).catch(() => {});
} else if (isLeader && userOrder.userId !== deleterUserId) {
  // Leader deleted someone's order - notify the order owner
  this.pushNotificationService.sendToUser(userOrder.userId, {
    title: 'Order Removed',
    body: `Your order was removed from "${groupOrder.name || 'the group order'}"`,
    tag: `order-deleted-${groupOrderId}-${orderId}`,
    url: `/orders/${groupOrderId}`,
    data: { groupOrderId, orderId, type: 'order_deleted' },
  }).catch(() => {});
}
```

### 5. **Group Order Updated (Name/Dates)**
**Location:** `apps/api/src/services/group-order/update-group-order.service.ts`

**When:** Leader updates group order name, start date, or end date

**Who should be notified:** All participants

**Suggested implementation:**
```typescript
// After line 47 (after group order is updated)
// Get all participants
const userOrders = await this.userOrderRepository.findByGroupOrderId(groupOrderId);
const participantIds = [...new Set(userOrders.map(order => order.userId))];

// Notify all participants
const notificationPromises = participantIds.map(participantId => 
  this.pushNotificationService.sendToUser(participantId, {
    title: 'Order Updated',
    body: `The group order "${updatedGroupOrder.name || 'has been'}" updated`,
    tag: `order-updated-${groupOrderId}`,
    url: `/orders/${groupOrderId}`,
    data: { groupOrderId, type: 'order_updated' },
  }).catch(() => {})
);
await Promise.allSettled(notificationPromises);
```

---

## How to Use `PushNotificationService`

### Basic Usage

```typescript
import { inject } from '../../shared/utils/inject.utils';
import { PushNotificationService } from '../push-notification/push-notification.service';

@injectable()
export class YourService {
  private readonly pushNotificationService = inject(PushNotificationService);

  async yourMethod() {
    // Send notification to a user
    await this.pushNotificationService.sendToUser(userId, {
      title: 'Notification Title',
      body: 'Notification message',
      icon: '/icon.png', // Optional
      badge: '/icon.png', // Optional
      tag: 'unique-tag', // Optional - for grouping notifications
      url: '/orders/123', // Optional - where to navigate on click
      data: { // Optional - custom data
        groupOrderId: '123',
        type: 'custom_event',
      },
    });
  }
}
```

### Important Notes

1. **Always use `.catch()`** - Notifications should never break your main flow:
   ```typescript
   this.pushNotificationService.sendToUser(userId, payload).catch(() => {
     // Ignore notification errors
   });
   ```

2. **Use `Promise.allSettled()`** for multiple notifications:
   ```typescript
   const promises = userIds.map(userId => 
     this.pushNotificationService.sendToUser(userId, payload).catch(() => {})
   );
   await Promise.allSettled(promises);
   ```

3. **Use unique tags** - Helps group related notifications:
   ```typescript
   tag: `payment-${groupOrderId}-${userOrderId}`
   ```

4. **Include URLs** - Makes notifications clickable:
   ```typescript
   url: `/orders/${groupOrderId}`
   ```

---

## Service Location

**Main Service:** `apps/api/src/services/push-notification/push-notification.service.ts`

**Method:** `sendToUser(userId: string, payload: PushNotificationPayload): Promise<void>`

**Interface:**
```typescript
interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  url?: string;
}
```

