import type { LucideIcon } from 'lucide-react';
import { Clock3, RefreshCcw, ScrollText, ShieldCheck, Undo2, Wallet } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRevalidator } from 'react-router';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { calculateOrderPrice } from '@/hooks/useOrderPrice';
import type { StockResponse } from '@/lib/api';
import { OrdersApi } from '@/lib/api';
import type { GroupOrder, UserOrderSummary } from '@/lib/api/types';

type ReceiptItem = {
  name: string;
  details: string;
  price: number;
};

type GroupedOrders = {
  userId: string;
  name: string | null | undefined;
  orders: UserOrderSummary[];
};

type ReceiptViewModel = {
  group: GroupedOrders;
  subtotal: number;
  items: ReceiptItem[];
  reimbursementComplete: boolean;
  participantPaid: boolean;
  isLeaderReceipt: boolean;
};

type ProcessingState = {
  userId: string;
  action: 'reimburse' | 'paid';
} | null;

type ReceiptStatusVariant = 'leader' | 'settled' | 'awaitingParticipant' | 'awaitingConfirmation';
type StatusTone = 'success' | 'warning' | 'danger';

type ReceiptCopy = {
  badge: string;
  subtitle: string;
  header: string;
  guestLabel: string;
  unknownGuest: string;
  itemsLabel: string;
  subtotalLabel: string;
  feeShareLabel: string;
  totalLabel: string;
  actions: {
    markSelfPaid: string;
    unmarkSelfPaid: string;
    confirmReceipt: string;
    reopenReceipt: string;
  };
  status: Record<ReceiptStatusVariant, string>;
};

type ReceiptTotalsLabels = {
  subtotal: string;
  feeShare: string;
  total: string;
  explanation: string;
};

const STATUS_ICONS: Record<ReceiptStatusVariant, LucideIcon> = {
  leader: ShieldCheck,
  settled: ShieldCheck,
  awaitingParticipant: Clock3,
  awaitingConfirmation: RefreshCcw,
};

const STATUS_TONES: Record<ReceiptStatusVariant, StatusTone> = {
  leader: 'success',
  settled: 'success',
  awaitingParticipant: 'danger',
  awaitingConfirmation: 'warning',
};

const BADGE_BASE_CLASS =
  'inline-flex max-w-max border px-2 py-1 text-[9px] uppercase tracking-wide';

const STATUS_BADGE_CLASS: Record<StatusTone, string> = {
  success: `${BADGE_BASE_CLASS} border-emerald-400/60 bg-emerald-400/90 text-emerald-950`,
  warning: `${BADGE_BASE_CLASS} border-amber-400/60 bg-amber-400/90 text-amber-950`,
  danger: `${BADGE_BASE_CLASS} border-rose-500/70 bg-rose-500/90 text-rose-950`,
};

const ACTION_BUTTON_CLASS =
  'border border-white/20 bg-slate-900/90 text-white text-xs uppercase tracking-wide';

function formatTacoDetails(order: UserOrderSummary['items']['tacos'][number]) {
  const details: string[] = [];
  if (order.meats.length > 0) {
    details.push(order.meats.map((meat) => meat.name).join(', '));
  }
  if (order.garnitures.length > 0) {
    details.push(order.garnitures.map((item) => item.name).join(', '));
  }
  if (order.sauces.length > 0) {
    details.push(order.sauces.map((item) => item.name).join(', '));
  }
  return details.join(' • ');
}

function buildReceiptItems(order: UserOrderSummary, stock: StockResponse): ReceiptItem[] {
  const items: ReceiptItem[] = [];

  for (const taco of order.items.tacos) {
    const sizePrice = stock.tacos.find((size) => size.code === taco.size)?.price ?? 0;
    const subtotal = (sizePrice + taco.price) * (taco.quantity ?? 1);
    items.push({
      name: `${taco.size.toUpperCase()} x${taco.quantity ?? 1}`,
      details: formatTacoDetails(taco),
      price: subtotal,
    });
  }

  const addCollection = (
    collection: typeof order.items.extras | typeof order.items.drinks | typeof order.items.desserts
  ) => {
    for (const item of collection) {
      items.push({
        name: `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`,
        details: '',
        price: item.price * (item.quantity ?? 1),
      });
    }
  };

  addCollection(order.items.extras);
  addCollection(order.items.drinks);
  addCollection(order.items.desserts);

  return items;
}

function resolveReceiptStatusVariant(receipt: ReceiptViewModel): ReceiptStatusVariant {
  if (receipt.isLeaderReceipt) {
    return 'leader';
  }
  if (receipt.reimbursementComplete) {
    return 'settled';
  }
  if (!receipt.participantPaid) {
    return 'awaitingParticipant';
  }
  return 'awaitingConfirmation';
}

type GroupOrderReceiptsProps = {
  readonly groupOrder: GroupOrder;
  readonly userOrders: UserOrderSummary[];
  readonly stock: StockResponse;
  readonly currency: string;
  readonly isLeader: boolean;
  readonly currentUserId: string;
};

export function GroupOrderReceipts({
  groupOrder,
  userOrders,
  stock,
  currency,
  isLeader,
  currentUserId,
}: GroupOrderReceiptsProps) {
  const { t, i18n } = useTranslation();
  const revalidator = useRevalidator();
  const [processing, setProcessing] = useState<ProcessingState>(null);

  const hasFee = groupOrder.fee !== undefined && groupOrder.fee !== null;
  if (userOrders.length === 0 || !hasFee) {
    return null;
  }

  const shouldShowReceipts = groupOrder.status === 'submitted' || groupOrder.status === 'completed';
  if (!shouldShowReceipts) {
    return null;
  }

  const groupedOrders = useMemo<GroupedOrders[]>(() => {
    const map = new Map<string, GroupedOrders>();

    for (const order of userOrders) {
      const existing = map.get(order.userId);
      if (existing) {
        existing.orders.push(order);
      } else {
        map.set(order.userId, { userId: order.userId, name: order.name, orders: [order] });
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const nameA = (a.name ?? '').trim().toLowerCase();
      const nameB = (b.name ?? '').trim().toLowerCase();
      if (nameA && nameB) {
        return nameA.localeCompare(nameB);
      }
      if (nameA) return -1;
      if (nameB) return 1;
      return a.userId.localeCompare(b.userId);
    });
  }, [userOrders]);

  const receipts = useMemo<ReceiptViewModel[]>(
    () =>
      groupedOrders.map((group) => {
        const items = group.orders.flatMap((order) => buildReceiptItems(order, stock));
        const subtotal = group.orders.reduce(
          (sum, order) => sum + calculateOrderPrice(order, stock),
          0
        );
        const reimbursementComplete = group.orders.every((order) => order.reimbursement.settled);
        const isLeaderReceipt = group.userId === groupOrder.leader.id;
        const participantPaid = isLeaderReceipt
          ? true
          : group.orders.every((order) => order.participantPayment.paid);

        return {
          group,
          items,
          subtotal,
          reimbursementComplete,
          participantPaid,
          isLeaderReceipt,
        } satisfies ReceiptViewModel;
      }),
    [groupedOrders, stock, groupOrder.leader.id]
  );

  const totalFee = groupOrder.fee ?? 0;
  const participantCount = receipts.length || 1;
  const feePerPerson = participantCount > 0 ? totalFee / participantCount : 0;
  const displayDate = new Date(groupOrder.updatedAt ?? groupOrder.endDate ?? groupOrder.startDate);
  const ticketTime = displayDate.toLocaleTimeString(i18n.language);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
      }),
    [i18n.language, currency]
  );

  const formatAmount = useCallback(
    (amount: number) => currencyFormatter.format(amount),
    [currencyFormatter]
  );

  const feeExplanation = t('orders.detail.receipts.feeExplanation', {
    total: formatAmount(totalFee),
    share: formatAmount(feePerPerson),
    count: participantCount,
  });

  const copy = useMemo<ReceiptCopy>(
    () => ({
      badge: t('orders.detail.receipts.badge'),
      subtitle: t('orders.detail.receipts.subtitle'),
      header: t('orders.detail.receipts.header'),
      guestLabel: t('orders.detail.receipts.guest'),
      unknownGuest: t('orders.detail.receipts.unknownGuest'),
      itemsLabel: t('orders.detail.receipts.items'),
      subtotalLabel: t('orders.detail.receipts.subtotal'),
      feeShareLabel: t('orders.detail.receipts.deliveryFeeShare'),
      totalLabel: t('orders.detail.receipts.total'),
      actions: {
        markSelfPaid: t('orders.detail.receipts.actions.markSelfPaid'),
        unmarkSelfPaid: t('orders.detail.receipts.actions.unmarkSelfPaid'),
        confirmReceipt: t('orders.detail.receipts.actions.confirmReceipt'),
        reopenReceipt: t('orders.detail.receipts.actions.reopenReceipt'),
      },
      status: {
        leader: t('orders.detail.receipts.status.leader'),
        settled: t('orders.detail.receipts.status.settled'),
        awaitingParticipant: t('orders.detail.receipts.status.awaitingParticipant'),
        awaitingConfirmation: t('orders.detail.receipts.status.awaitingConfirmation'),
      },
    }),
    [t]
  );

  const toggleParticipantPayment = async (
    userId: string,
    orders: UserOrderSummary[],
    paid: boolean
  ) => {
    setProcessing({ userId, action: 'paid' });
    try {
      await Promise.all(
        orders.map((order) =>
          OrdersApi.updateUserOrderParticipantPayment(groupOrder.id, order.id, paid)
        )
      );
      revalidator.revalidate();
    } catch (error) {
      console.error('Failed to update participant payment status', error);
    } finally {
      setProcessing(null);
    }
  };

  const toggleReimbursement = async (
    userId: string,
    orders: UserOrderSummary[],
    settled: boolean
  ) => {
    setProcessing({ userId, action: 'reimburse' });
    try {
      await Promise.all(
        orders.map((order) =>
          OrdersApi.updateUserOrderReimbursementStatus(groupOrder.id, order.id, settled)
        )
      );
      revalidator.revalidate();
    } catch (error) {
      console.error('Failed to update reimbursement status', error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Card className="border-white/10 bg-slate-900/50">
      <CardHeader className="gap-2">
        <div className="flex items-center gap-3">
          <Avatar color="brandHero" size="md" variant="elevated">
            <ScrollText />
          </Avatar>
          <div>
            <CardTitle className="text-lg text-white">{copy.badge}</CardTitle>
            <CardDescription className="mt-0.5 text-xs">{copy.subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {receipts.map((receipt, idx) => (
            <ReceiptTicket
              key={receipt.group.userId}
              index={idx}
              receipt={receipt}
              copy={copy}
              ticketTime={ticketTime}
              feePerPerson={feePerPerson}
              formatAmount={formatAmount}
              feeExplanation={feeExplanation}
              isLeader={isLeader}
              currentUserId={currentUserId}
              processing={processing}
              onParticipantToggle={toggleParticipantPayment}
              onReimbursementToggle={toggleReimbursement}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type ReceiptTicketProps = {
  index: number;
  receipt: ReceiptViewModel;
  copy: ReceiptCopy;
  ticketTime: string;
  feePerPerson: number;
  formatAmount: (amount: number) => string;
  feeExplanation: string;
  isLeader: boolean;
  currentUserId: string;
  processing: ProcessingState;
  onParticipantToggle: (userId: string, orders: UserOrderSummary[], paid: boolean) => Promise<void>;
  onReimbursementToggle: (
    userId: string,
    orders: UserOrderSummary[],
    settled: boolean
  ) => Promise<void>;
};

function ReceiptTicket({
  index,
  receipt,
  copy,
  ticketTime,
  feePerPerson,
  formatAmount,
  feeExplanation,
  isLeader,
  currentUserId,
  processing,
  onParticipantToggle,
  onReimbursementToggle,
}: ReceiptTicketProps) {
  const total = receipt.subtotal + feePerPerson;
  const participantName = (receipt.group.name ?? copy.unknownGuest).toUpperCase();
  const isOwnReceipt = receipt.group.userId === currentUserId;
  const isBusy = processing?.userId === receipt.group.userId;
  const canShowParticipantAction = isOwnReceipt && !isLeader;
  const canShowReimbursementAction = isLeader && !receipt.isLeaderReceipt;
  const statusVariant = resolveReceiptStatusVariant(receipt);

  return (
    <div className="transform bg-white/90 p-1 shadow-2xl transition-transform hover:scale-[1.01]">
      <div className="flex h-full flex-col border-4 border-gray-300 border-dashed bg-white p-5 font-mono text-gray-900 text-xs">
        <div className="mb-3 border-gray-800 border-b-2 border-dashed pb-3">
          <div className="space-y-1 text-center">
            <p className="font-black text-lg tracking-[0.3em]">TACOCREW</p>
            <p className="font-semibold text-[10px] tracking-[0.4em]">{copy.header}</p>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span>#{index + 1}</span>
            <span>{ticketTime}</span>
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">
              {copy.guestLabel}
            </p>
            <p className="font-black text-xl">{participantName}</p>
          </div>
          <ReceiptStatusBadge variant={statusVariant} label={copy.status[statusVariant]} />
        </div>

        <ReceiptItemsList
          items={receipt.items}
          itemsLabel={copy.itemsLabel}
          formatAmount={formatAmount}
        />

        <ReceiptTotals
          subtotal={receipt.subtotal}
          total={total}
          feePerPerson={feePerPerson}
          formatAmount={formatAmount}
          labels={{
            subtotal: copy.subtotalLabel,
            feeShare: copy.feeShareLabel,
            total: copy.totalLabel,
            explanation: feeExplanation,
          }}
        />

        <ReceiptActions
          participantPaid={receipt.participantPaid}
          reimbursementComplete={receipt.reimbursementComplete}
          canShowParticipantAction={canShowParticipantAction}
          canShowReimbursementAction={canShowReimbursementAction}
          isBusy={Boolean(isBusy)}
          actionsCopy={copy.actions}
          onParticipantToggle={() =>
            onParticipantToggle(
              receipt.group.userId,
              receipt.group.orders,
              !receipt.participantPaid
            )
          }
          onReimbursementToggle={() =>
            onReimbursementToggle(
              receipt.group.userId,
              receipt.group.orders,
              !receipt.reimbursementComplete
            )
          }
        />
      </div>
    </div>
  );
}

type ReceiptItemsListProps = {
  items: ReceiptItem[];
  itemsLabel: string;
  formatAmount: (amount: number) => string;
};

function ReceiptItemsList({ items, itemsLabel, formatAmount }: ReceiptItemsListProps) {
  return (
    <div className="my-3 flex-1 space-y-2 border-gray-800 border-t border-b border-dashed py-3">
      <p className="font-bold text-[10px] text-gray-500 tracking-[0.3em]">{itemsLabel}</p>
      <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
        {items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="border-gray-200 border-b pb-2 last:border-b-0"
          >
            <div className="flex justify-between font-semibold text-[11px]">
              <span className="pr-3">{item.name}</span>
              <span>{formatAmount(item.price)}</span>
            </div>
            {item.details ? <p className="text-[10px] text-gray-600">{item.details}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

type ReceiptTotalsProps = {
  subtotal: number;
  total: number;
  feePerPerson: number;
  formatAmount: (amount: number) => string;
  labels: ReceiptTotalsLabels;
};

function ReceiptTotals({
  subtotal,
  total,
  feePerPerson,
  formatAmount,
  labels,
}: ReceiptTotalsProps) {
  return (
    <div className="space-y-2 rounded-lg bg-slate-100/70 p-3 text-[11px] text-slate-900">
      <div className="flex justify-between">
        <span>{labels.subtotal}</span>
        <span>{formatAmount(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>{labels.feeShare}</span>
        <span>{formatAmount(feePerPerson)}</span>
      </div>
      <p className="text-[10px] text-slate-600">{labels.explanation}</p>
      <div className="flex justify-between border-slate-300 border-t pt-2 font-black text-base">
        <span>{labels.total}</span>
        <span>{formatAmount(total)}</span>
      </div>
    </div>
  );
}

type ReceiptActionsProps = {
  participantPaid: boolean;
  reimbursementComplete: boolean;
  canShowParticipantAction: boolean;
  canShowReimbursementAction: boolean;
  isBusy: boolean;
  actionsCopy: ReceiptCopy['actions'];
  onParticipantToggle: () => void;
  onReimbursementToggle: () => void;
};

function ReceiptActions({
  participantPaid,
  reimbursementComplete,
  canShowParticipantAction,
  canShowReimbursementAction,
  isBusy,
  actionsCopy,
  onParticipantToggle,
  onReimbursementToggle,
}: ReceiptActionsProps) {
  if (!canShowParticipantAction && !canShowReimbursementAction) {
    return null;
  }

  return (
    <div className="mt-auto flex flex-col gap-2 pt-3">
      {canShowParticipantAction && (
        <Button
          size="sm"
          variant="ghost"
          disabled={isBusy}
          onClick={onParticipantToggle}
          className={`${ACTION_BUTTON_CLASS} ${participantPaid ? 'opacity-80' : ''}`}
        >
          <div className="flex items-center gap-2">
            {participantPaid ? (
              <Undo2 className="h-3.5 w-3.5" />
            ) : (
              <Wallet className="h-3.5 w-3.5" />
            )}
            <span>{participantPaid ? actionsCopy.unmarkSelfPaid : actionsCopy.markSelfPaid}</span>
          </div>
        </Button>
      )}
      {canShowReimbursementAction && (
        <Button
          size="sm"
          variant="ghost"
          disabled={isBusy}
          onClick={onReimbursementToggle}
          className={`${ACTION_BUTTON_CLASS} ${reimbursementComplete ? 'opacity-80' : ''}`}
        >
          <div className="flex items-center gap-2">
            {reimbursementComplete ? (
              <RefreshCcw className="h-3.5 w-3.5" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            <span>
              {reimbursementComplete ? actionsCopy.reopenReceipt : actionsCopy.confirmReceipt}
            </span>
          </div>
        </Button>
      )}
    </div>
  );
}

type ReceiptStatusBadgeProps = {
  variant: ReceiptStatusVariant;
  label: string;
};

function ReceiptStatusBadge({ variant, label }: ReceiptStatusBadgeProps) {
  const tone = STATUS_TONES[variant];
  const Icon = STATUS_ICONS[variant];

  return (
    <Badge tone={tone} className={STATUS_BADGE_CLASS[tone]}>
      <div className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        <span>{label}</span>
      </div>
    </Badge>
  );
}
