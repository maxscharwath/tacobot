import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Alert,
  Avatar,
  AvatarLabelGroup,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Divider,
  Input,
  Select,
  Textarea,
} from '@tacobot/ui-kit';
import {
  BellRing,
  CheckCircle2,
  Clock3,
  ScrollText,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';

const PlaygroundDemo = () => null;

const meta = {
  title: 'UI Kit/Playground',
  component: PlaygroundDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
  },
} satisfies Meta<typeof PlaygroundDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

type StatusKey = 'collecting' | 'submitted' | 'delivered';

type StatusConfig = {
  readonly label: string;
  readonly description: string;
  readonly badgeTone: 'warning' | 'brand' | 'success' | 'neutral';
  readonly primaryAction: string;
  readonly secondaryAction: string;
  readonly Icon: typeof Clock3;
};

const STATUS_CONFIG: Record<StatusKey, StatusConfig> = {
  collecting: {
    label: 'Collecting orders',
    description: 'Participants can edit their tacos, add drinks and update delivery details.',
    badgeTone: 'warning',
    primaryAction: 'Lock submissions',
    secondaryAction: 'Send reminder',
    Icon: Clock3,
  },
  submitted: {
    label: 'Order submitted',
    description: 'The restaurant confirmed the order. Track prep and delivery status here.',
    badgeTone: 'brand',
    primaryAction: 'Update ETA',
    secondaryAction: 'Notify crew',
    Icon: ShieldCheck,
  },
  delivered: {
    label: 'Delivered & reimbursed',
    description: 'Everything is paid. Mark receipts as archived once everyone is reimbursed.',
    badgeTone: 'success',
    primaryAction: 'Archive receipts',
    secondaryAction: 'Export summary',
    Icon: CheckCircle2,
  },
};

const PARTICIPANTS = [
  {
    id: '1',
    name: 'Max Schneider',
    subtitle: '2 tacos · extra guac',
    color: 'brand',
    status: 'Paid',
  },
  {
    id: '2',
    name: 'Camille Martin',
    subtitle: 'Veggie special',
    color: 'emerald',
    status: 'Waiting',
  },
  {
    id: '3',
    name: 'Rafael Lopez',
    subtitle: '3 tacos · 1 horchata',
    color: 'rose',
    status: 'Paid',
  },
  {
    id: '4',
    name: 'Lina Baumann',
    subtitle: '1 burrito · 1 agua fresca',
    color: 'violet',
    status: 'Waiting',
  },
] as const;

function PlaygroundContent() {
  const [status, setStatus] = useState<StatusKey>('collecting');
  const config = STATUS_CONFIG[status];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size="xl" variant="elevated" color="brandHero">
              <ScrollText />
            </Avatar>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-[0.4em]">Group order</p>
              <h1 className="font-semibold text-2xl text-white">Taco Tuesday crew</h1>
              <p className="text-slate-400 text-sm">24 participants · Lausanne HQ</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Share link</Button>
            <Button variant="ghost" className="border border-white/20">
              <Wallet className="h-4 w-4" />
              <span>Collect payments</span>
            </Button>
            <Button>Payout leader</Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Order status</CardTitle>
              <CardDescription>Switch state to preview badges and CTA pairings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={config.badgeTone} pill className="text-[10px]">
                  <config.Icon className="h-3 w-3" />
                  {config.label}
                </Badge>
                <Select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as StatusKey)}
                  className="max-w-xs"
                >
                  <option value="collecting">Collecting orders</option>
                  <option value="submitted">Submitted</option>
                  <option value="delivered">Delivered</option>
                </Select>
              </div>
              <p className="text-slate-300 text-sm">{config.description}</p>
              <Divider />
              <div className="flex flex-wrap gap-3">
                <Button>{config.primaryAction}</Button>
                <Button variant="outline">{config.secondaryAction}</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
              <CardDescription>Badges update when leader confirms reimbursement.</CardDescription>
            </CardHeader>
            <CardContent className="gap-4">
              {PARTICIPANTS.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between gap-3">
                  <AvatarLabelGroup
                    size="md"
                    color={participant.color}
                    title={participant.name}
                    subtitle={participant.subtitle}
                  >
                    {participant.name
                      .split(' ')
                      .map((segment) => segment[0])
                      .slice(0, 2)
                      .join('')}
                  </AvatarLabelGroup>
                  <Badge tone={participant.status === 'Paid' ? 'success' : 'warning'} pill>
                    {participant.status}
                  </Badge>
                </div>
              ))}
              <Divider />
              <Button
                variant="ghost"
                className="justify-center border border-white/20 border-dashed"
              >
                <Users className="h-4 w-4" />
                Add participant
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Delivery preferences</CardTitle>
              <CardDescription>Inline form controls from the UI kit.</CardDescription>
            </CardHeader>
            <CardContent className="gap-4">
              <Input placeholder="Team contact (Slack handle or phone)" />
              <Select defaultValue="pickup">
                <option value="pickup">Pickup at Lausanne HQ</option>
                <option value="delivery">Deliver to Avenue d'Echallens 82</option>
              </Select>
              <Textarea rows={4} placeholder="Notes for the driver" />
              <Divider label="Reminders" />
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost" className="border border-white/15">
                  <BellRing className="h-4 w-4" />
                  Slack reminder
                </Button>
                <Button variant="ghost" className="border border-white/15">
                  <Truck className="h-4 w-4" />
                  Schedule courier
                </Button>
              </div>
              <Button fullWidth>Save preferences</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary & alerts</CardTitle>
              <CardDescription>Combine alerts, badges and action buttons.</CardDescription>
            </CardHeader>
            <CardContent className="gap-5">
              <Alert tone="info" title="Delivery ETA">
                Kitchen prepping at 12:15 · Driver leaves at 12:40.
              </Alert>
              <Divider />
              <div className="space-y-3 text-slate-300 text-sm">
                <div className="flex justify-between">
                  <span>Tacos & bowls</span>
                  <span className="text-white">CHF 182.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Drinks & extras</span>
                  <span className="text-white">CHF 42.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span className="text-white">CHF 18.00</span>
                </div>
                <Divider />
                <div className="flex justify-between font-semibold text-base text-white">
                  <span>Total due</span>
                  <span>CHF 242.00</span>
                </div>
              </div>
              <Badge tone="brand" pill className="justify-center">
                <Wallet className="h-3 w-3" />
                18 CHF split between 24 people
              </Badge>
              <Button fullWidth variant="ghost" className="border border-white/15">
                Export detailed receipt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const KitchenSink: Story = {
  render: () => <PlaygroundContent />,
};
