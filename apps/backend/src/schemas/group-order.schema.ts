/**
 * Group order domain schema (Zod)
 * @module schemas/group-order
 */
import { z } from 'zod';
import type { UserId } from '@/schemas/user.schema';
import { GroupOrderStatus } from '@/shared/types/types';
import type { Id } from '@/shared/utils/branded-ids.utils';
import { zId } from '@/shared/utils/branded-ids.utils';

/**
 * Group Order ID type - branded string
 */
export type GroupOrderId = Id<'GroupOrder'>;

/**
 * Parse a string to GroupOrderId
 */
export const GroupOrderIdSchema = zId<GroupOrderId>();

/**
 * Group order schema using Zod
 */
export const GroupOrderSchema = z.object({
  id: zId<GroupOrderId>(),
  leaderId: zId<UserId>(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(GroupOrderStatus),
  name: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type GroupOrder = z.infer<typeof GroupOrderSchema>;

/**
 * Group order from database (with nullable name and string status)
 */
export const GroupOrderFromDbSchema = z.object({
  id: z.string(), // UUID from DB as string
  leaderId: z.string(), // UUID from DB as string
  startDate: z.date(),
  endDate: z.date(),
  status: z.string(),
  name: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Build a group order from properties.
 */
export function createGroupOrder(props: {
  id: string;
  leaderId: string;
  startDate: Date;
  endDate: Date;
  status: GroupOrderStatus;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}): GroupOrder {
  return GroupOrderSchema.parse(props);
}

/**
 * Build a domain entity from database data with minimal transformation.
 */
export function createGroupOrderFromDb(data: z.infer<typeof GroupOrderFromDbSchema>): GroupOrder {
  return GroupOrderSchema.parse(data);
}

/**
 * Determine if a group order is open for orders at a given moment (defaults to now).
 */
export function isGroupOrderOpenForOrders(order: GroupOrder, referenceDate = new Date()): boolean {
  if (order.status !== GroupOrderStatus.OPEN) {
    return false;
  }

  return referenceDate >= order.startDate && referenceDate <= order.endDate;
}

/**
 * Determine if a group order can be modified at a given moment (defaults to now).
 */
export function canGroupOrderBeModified(order: GroupOrder, referenceDate = new Date()): boolean {
  return order.status === GroupOrderStatus.OPEN && isGroupOrderOpenForOrders(order, referenceDate);
}

/**
 * Determine if a user is the leader of the provided group order.
 */
export function isGroupOrderLeader(order: GroupOrder, userId: UserId): boolean {
  return order['leaderId'] === userId;
}

/**
 * Compute the effective status of a group order based on its DB status and date range.
 * 
 * Rules:
 * - If DB status is SUBMITTED or COMPLETED, return as-is (finalized states)
 * - If DB status is CLOSED, return as-is (manually closed by leader)
 * - If DB status is OPEN:
 *   - If current date is after endDate, return EXPIRED (automatically expired)
 *   - Otherwise, return OPEN
 * 
 * @param order - The group order to evaluate
 * @param referenceDate - The date to use for comparison (defaults to now)
 * @returns The effective status considering both DB status and date validity
 */
export function getEffectiveGroupOrderStatus(
  order: GroupOrder,
  referenceDate = new Date()
): GroupOrderStatus {
  // Finalized states are always returned as-is
  if (
    order.status === GroupOrderStatus.SUBMITTED ||
    order.status === GroupOrderStatus.COMPLETED
  ) {
    return order.status;
  }

  // Manually closed orders stay closed
  if (order.status === GroupOrderStatus.CLOSED) {
    return order.status;
  }

  // For OPEN orders, check if they're still within valid date range
  if (order.status === GroupOrderStatus.OPEN) {
    if (referenceDate > order.endDate) {
      return GroupOrderStatus.EXPIRED;
    }
    return GroupOrderStatus.OPEN;
  }

  // Fallback: return the DB status
  return order.status;
}
