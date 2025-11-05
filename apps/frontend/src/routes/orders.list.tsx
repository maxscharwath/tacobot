import { AlarmClock } from '@untitledui/icons/AlarmClock';
import { ArrowUpRight } from '@untitledui/icons/ArrowUpRight';
import { Calendar } from '@untitledui/icons/Calendar';
import { Package } from '@untitledui/icons/Package';
import { Truck01 } from '@untitledui/icons/Truck01';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type ActionFunctionArgs,
  Form,
  Link,
  type LoaderFunctionArgs,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from 'react-router';
import { Alert, Button, Input, Label, StatusBadge } from '@/components/ui';
import { OrdersApi, UserApi } from '../lib/api';
import { ApiError } from '../lib/api/http';

type LoaderData = {
  groupOrders: Awaited<ReturnType<typeof UserApi.getGroupOrders>>;
};

type ActionData = {
  errorKey?: string;
  errorMessage?: string;
};

export async function ordersLoader(_: LoaderFunctionArgs) {
  const groupOrders = await UserApi.getGroupOrders();
  return Response.json({ groupOrders });
}

export async function ordersAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('_intent');

  if (intent === 'create') {
    const name = (formData.get('name') ?? '').toString().trim();
    const startDateRaw = formData.get('startDate')?.toString();
    const endDateRaw = formData.get('endDate')?.toString();

      if (!startDateRaw || !endDateRaw) {
        return Response.json({ errorKey: 'orders.list.errors.datesRequired' }, { status: 400 });
    }

    const startDate = new Date(startDateRaw);
    const endDate = new Date(endDateRaw);

      if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf())) {
        return Response.json({ errorKey: 'orders.list.errors.invalidDates' }, { status: 400 });
    }

      if (endDate <= startDate) {
        return Response.json({ errorKey: 'orders.list.errors.endBeforeStart' }, { status: 400 });
    }

    try {
      const created = await OrdersApi.createGroupOrder({
        name: name || undefined,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      return redirect(`/orders/${created.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        const message =
          typeof error.body === 'object' && error.body && 'error' in error.body
            ? ((error.body as { error?: { message?: string } }).error?.message ?? error.message)
            : error.message;

          return Response.json(
            {
              errorKey: 'orders.common.errors.api',
              errorMessage: message,
            },
            { status: error.status }
          );
      }

        return Response.json({ errorKey: 'orders.list.errors.unexpected' }, { status: 500 });
    }
  }

  return null;
}

export function OrdersRoute() {
  const { t } = useTranslation();
  const { groupOrders } = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  // Get current date/time for smart defaults
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Smart defaults: start now, end at next common deadline
  const getDefaultEndTime = () => {
    const end = new Date(now);
    // If it's before 10am, set to 10am today, otherwise 10am tomorrow
    if (currentHour < 10) {
      end.setHours(10, 0, 0, 0);
      return end.toISOString().slice(0, 16);
    } else {
      end.setDate(end.getDate() + 1);
      end.setHours(10, 0, 0, 0);
      return end.toISOString().slice(0, 16);
    }
  };

  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState(
    `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
  );
  const [endDate, setEndDate] = useState(() => {
    const defaultEnd = getDefaultEndTime();
    return defaultEnd.split('T')[0];
  });
  const [endTime, setEndTime] = useState(() => {
    const defaultEnd = getDefaultEndTime();
    return defaultEnd.split('T')[1];
  });

    const setQuickDeadline = (hour: number) => {
    const deadline = new Date(now);
    const todayDeadline = new Date(deadline);
    todayDeadline.setHours(hour, 0, 0, 0);

    // If the deadline time has passed today, set for tomorrow
    if (todayDeadline <= now) {
      deadline.setDate(deadline.getDate() + 1);
    }
    deadline.setHours(hour, 0, 0, 0);

    setEndDate(deadline.toISOString().split('T')[0]);
    setEndTime(`${String(hour).padStart(2, '0')}:00`);
  };

  const getStartDateTime = () => {
    return `${startDate}T${startTime}`;
  };

  const getEndDateTime = () => {
    return `${endDate}T${endTime}`;
  };

  const upcomingOrders = [...groupOrders]
    .filter((order) => new Date(order.endDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const activeCount = groupOrders.filter((order) => order.canAcceptOrders).length;

  return (
    <div className="space-y-10">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-500/20 via-slate-900/80 to-slate-950/90 p-8 shadow-[0_40px_120px_rgba(8,47,73,0.35)]">
        <div className="absolute -top-24 right-0 h-60 w-60 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/50 bg-brand-500/10 px-3 py-1 text-xs font-semibold tracking-[0.3em] text-brand-100">
                {t('orders.list.hero.badge')}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
                {t('orders.list.hero.title')}
            </h1>
            <p className="max-w-2xl text-sm text-slate-200">
                {t('orders.list.hero.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-center">
              <StatBubble
                icon={Calendar}
                label={t('orders.list.hero.metrics.activeCycles')}
                value={activeCount}
                tone="brand"
              />
            <StatBubble
              icon={Package}
                label={t('orders.list.hero.metrics.totalBatches')}
              value={groupOrders.length}
              tone="violet"
            />
            <StatBubble
              icon={Truck01}
                label={t('orders.list.hero.metrics.nextDispatch')}
              value={upcomingOrders[0]?.endDate ? formatDate(upcomingOrders[0].endDate) : '—'}
              tone="sunset"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-white">
                  {t('orders.list.queue.title')}
                </h2>
                <p className="text-sm text-slate-300">{t('orders.list.queue.subtitle')}</p>
            </div>
            <span className="rounded-full border border-white/10 bg-slate-800/80 px-4 py-1 text-xs font-medium text-slate-300">
                {t('orders.list.queue.scheduled', { count: groupOrders.length })}
            </span>
          </header>

          <div className="grid gap-4">
            {groupOrders.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-slate-900/60 p-10 text-center text-slate-300">
                <Package size={24} className="text-brand-200" />
                  <p>{t('orders.list.queue.empty')}</p>
              </div>
            ) : (
              groupOrders.map((order) => (
                <article
                  key={order.id}
                  className="flex items-center justify-between gap-6 rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(8,47,73,0.25)] hover:border-brand-400/30"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">
                          {order.name ?? t('orders.common.unnamedDrop')}
                      </span>
                        <span className="text-xs text-slate-400">
                          {t('orders.common.labels.shortId', { id: order.id.slice(0, 8) })}
                        </span>
                    </div>
                    <p className="text-sm text-slate-200">
                      {formatDateTime(order.startDate)} → {formatDateTime(order.endDate)}
                    </p>
                  </div>

                    <div className="flex items-center gap-4">
                      <StatusBadge status={order.status} className="text-xs" />
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/15 px-4 py-2 text-sm font-semibold text-brand-100 hover:border-brand-400/70 cursor-pointer"
                    >
                        {t('common.open')}
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

          <section className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-[0_30px_80px_rgba(8,47,73,0.28)]">
          <header className="space-y-1">
              <h2 className="text-lg font-semibold text-white">
                {t('orders.list.form.title')}
              </h2>
              <p className="text-sm text-slate-300">{t('orders.list.form.subtitle')}</p>
          </header>

          <Form method="post" className="grid gap-4">
            <input type="hidden" name="_intent" value="create" />
            <input type="hidden" name="startDate" value={getStartDateTime()} />
            <input type="hidden" name="endDate" value={getEndDateTime()} />

              <div className="grid gap-2">
                <Label htmlFor="name">{t('common.labels.dropName')}</Label>
              <Input
                id="name"
                name="name"
                type="text"
                  placeholder={t('common.placeholders.dropName')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-brand-400" />
                  <Label className="text-sm normal-case tracking-normal">
                    {t('orders.list.form.labels.timeWindow')}
                  </Label>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label className="text-xs normal-case">
                      {t('orders.list.form.labels.opens')}
                    </Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="relative">
                      <AlarmClock
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        disabled={isSubmitting}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs normal-case">
                        {t('orders.list.form.labels.closes')}
                      </Label>
                    <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQuickDeadline(10)}
                        disabled={isSubmitting}
                        className="rounded-full border border-brand-400/30 bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-100 hover:border-brand-400/50 hover:bg-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                          {t('orders.list.form.quickDeadlines.morning')}
                      </button>
                      <button
                        type="button"
                          onClick={() => setQuickDeadline(12)}
                        disabled={isSubmitting}
                        className="rounded-full border border-brand-400/30 bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-100 hover:border-brand-400/50 hover:bg-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                          {t('orders.list.form.quickDeadlines.noon')}
                      </button>
                      <button
                        type="button"
                          onClick={() => setQuickDeadline(14)}
                        disabled={isSubmitting}
                        className="rounded-full border border-brand-400/30 bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-100 hover:border-brand-400/50 hover:bg-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                          {t('orders.list.form.quickDeadlines.afternoon')}
                      </button>
                      <button
                        type="button"
                          onClick={() => setQuickDeadline(17)}
                        disabled={isSubmitting}
                        className="rounded-full border border-brand-400/30 bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-100 hover:border-brand-400/50 hover:bg-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                          {t('orders.list.form.quickDeadlines.evening')}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="relative">
                      <AlarmClock
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={isSubmitting}
                        className="pl-10"
                      />
                    </div>
                  </div>
                    <p className="text-xs text-slate-400">
                      {t('orders.list.form.labels.deadlineHint')}
                    </p>
                </div>
              </div>
            </div>

              {actionData?.errorKey ? (
                <Alert tone="error">
                  {t(actionData.errorKey, actionData.errorMessage ? { message: actionData.errorMessage } : undefined)}
                </Alert>
              ) : null}

            <Button type="submit" loading={isSubmitting} disabled={isSubmitting} fullWidth>
                {t('orders.list.form.actions.launch')}
            </Button>
          </Form>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs text-slate-400">
              <p className="font-semibold uppercase tracking-[0.25em] text-slate-500">
                {t('orders.list.form.tip.title')}
              </p>
              <p className="mt-2 text-slate-300">{t('orders.list.form.tip.body')}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type StatBubbleProps = {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  tone: 'brand' | 'violet' | 'sunset';
};

function StatBubble({ icon: Icon, label, value, tone }: StatBubbleProps) {
  const toneStyles: Record<StatBubbleProps['tone'], string> = {
    brand: 'bg-brand-500/15 text-brand-100 border-brand-400/40',
    violet: 'bg-purple-500/15 text-purple-100 border-purple-400/40',
    sunset: 'bg-amber-500/15 text-amber-100 border-amber-400/40',
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-left ${toneStyles[tone]}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em]">
        <Icon size={16} className="text-current" />
        {label}
      </div>
      <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}
