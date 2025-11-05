# Group Order Status Management Improvements

## Problem Statement

Previously, group orders could have a status of "open" even when they were outside their validity date range (startDate to endDate). This caused issues where:
- The frontend would show orders as "open" when they should be considered expired
- Users could attempt to add orders to expired group orders
- The system didn't clearly communicate when an order period had ended

## Solution: Computed Effective Status

Implemented a computed status approach that considers both the database status and the validity date range to determine the actual ("effective") status of a group order.

## Changes Made

### 1. Backend Schema Changes

#### Added EXPIRED Status (`apps/backend/src/shared/types/types.ts`)
```typescript
export enum GroupOrderStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  EXPIRED = 'expired',      // NEW: Added for out-of-range orders
  SUBMITTED = 'submitted',
  COMPLETED = 'completed',
}
```

#### New Helper Function (`apps/backend/src/schemas/group-order.schema.ts`)
Added `getEffectiveGroupOrderStatus()` function that computes the effective status:

**Logic:**
- If DB status is SUBMITTED or COMPLETED → return as-is (finalized states)
- If DB status is CLOSED → return as-is (manually closed by leader)
- If DB status is OPEN:
  - If current date is after endDate → return EXPIRED
  - Otherwise → return OPEN

### 2. Backend API Changes

Updated all API endpoints to return the computed effective status:

#### Modified Files:
- `apps/backend/src/api/routes/group-order.routes.ts`
  - POST `/orders` (create group order)
  - GET `/orders/{id}` (get group order)
  - GET `/orders/{id}/items` (get group order with user orders)

- `apps/backend/src/services/user/user.service.ts`
  - GET `/users/me/group-orders` (list user's group orders)

All endpoints now call `getEffectiveGroupOrderStatus(groupOrder)` before returning the status to the client.

### 3. Backend Validation Changes

#### Updated Submit Group Order Service (`apps/backend/src/services/group-order/submit-group-order.service.ts`)
Changed validation to check the effective status instead of just the DB status:

**Before:**
```typescript
if (groupOrder.status !== GroupOrderStatus.OPEN) {
  throw new ValidationError(`Cannot submit group order. Group order status: ${groupOrder.status}`);
}
```

**After:**
```typescript
const effectiveStatus = getEffectiveGroupOrderStatus(groupOrder);
if (effectiveStatus !== GroupOrderStatus.OPEN) {
  throw new ValidationError(`Cannot submit group order. Group order status: ${effectiveStatus}`);
}
```

**Note:** The `canGroupOrderBeModified()` function already properly checked both status and date range, so user order creation validation didn't need changes.

### 4. Frontend Changes

#### Status Badge Component (`apps/frontend/src/components/ui/status-badge.tsx`)
Added support for "expired" and "closed" status tones:
```typescript
const DEFAULT_STATUS_TONES: Record<string, BadgeTone> = {
  // ... existing statuses
  expired: 'neutral',
  closed: 'neutral',
};
```

#### Order Detail Page (`apps/frontend/src/routes/orders.detail.tsx`)

**Added status checks:**
```typescript
const canAddOrders = groupOrder.status === 'open';
const canSubmit = isLeader && groupOrder.status === 'open';
```

**Updated "Create new order" button:**
- Shows enabled button when status is 'open'
- Shows disabled button with appropriate message for expired/closed/submitted/completed orders

**Updated empty state:**
- Shows different messages based on order status
- Only shows "Create my order" button when status is 'open'

#### Dashboard & Orders List
Updated active/pending order counts to exclude expired orders:

**Before:**
```typescript
const pendingOrders = groupOrders.filter((order) => order.status !== 'submitted');
const activeCount = groupOrders.filter((order) => order.status !== 'submitted').length;
```

**After:**
```typescript
const pendingOrders = groupOrders.filter(
  (order) => order.status === 'open' || order.status === 'closed'
);
const activeCount = groupOrders.filter(
  (order) => order.status === 'open' || order.status === 'closed'
).length;
```

## Benefits

1. **Automatic Expiration**: Orders automatically show as "expired" when outside their validity period
2. **Consistent UX**: Frontend accurately reflects the order's availability
3. **Better Error Messages**: Users get clear feedback about why they can't add orders
4. **No Background Jobs**: Status is computed on-demand, no need for scheduled tasks
5. **Audit Trail**: Database preserves the original status (manual closes vs automatic expiration)

## Database Considerations

- The database status field remains unchanged (still stores: open, closed, submitted, completed)
- The "expired" status is only computed at runtime and returned via API
- This preserves the distinction between manually closed orders and automatically expired ones

## Testing Recommendations

1. **Create a group order with endDate in the past** → Should show as "expired"
2. **Try to add user order to expired group order** → Should be blocked with clear error
3. **Try to submit an expired group order** → Should fail with status validation error
4. **Check dashboard counts** → Expired orders should not count as "active"

## Status Flow

```
[CREATED] → status: 'open'
     ↓
[TIME PASSES]
     ↓
[Within date range] → effective status: 'open' ✅ Can add orders
     ↓
[Past endDate] → effective status: 'expired' ❌ Cannot add orders
     ↓
[Leader submits] → status: 'submitted' 🔒 Finalized
     ↓
[Order completed] → status: 'completed' ✅ Done
```

## Future Enhancements

Possible improvements for future iterations:
1. Add visual countdown/timer showing time remaining
2. Allow leaders to manually extend endDate
3. Add notification before order expires
4. Archive expired orders after a certain period
