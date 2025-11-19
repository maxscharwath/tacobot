import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '@tacobot/ui-kit';
import { Mail, Settings, User } from 'lucide-react';

const COLOR_OPTIONS = [
  'blue',
  'emerald',
  'orange',
  'indigo',
  'brand',
  'brandHero',
  'neutral',
  'rose',
  'amber',
  'violet',
  'sky',
  'cyan',
] as const;

const SIZE_OPTIONS = ['sm', 'md', 'lg', 'xl'] as const;

const meta = {
  title: 'UI Kit/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: {
    color: 'brand' as (typeof COLOR_OPTIONS)[number],
    size: 'md' as (typeof SIZE_OPTIONS)[number],
    variant: 'default',
    children: 'TL',
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: COLOR_OPTIONS,
      description: 'Accent color. BrandHero/neutral are ideal for hero/neutral avatars.',
    },
    size: {
      control: { type: 'radio' },
      options: SIZE_OPTIONS,
      description: 'Avatar size – icons resize automatically.',
    },
    variant: {
      control: { type: 'inline-radio' },
      options: ['default', 'elevated'],
      description: 'Default = bordered tile, Elevated = soft shadow tile.',
    },
    children: {
      control: 'text',
      description: 'Supports text initials, emoji or an icon element.',
    },
    className: { control: false },
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: 'MS',
  },
};

export const WithIcon: Story = {
  args: {
    color: 'brandHero',
    size: 'md',
    variant: 'elevated',
    children: <User />,
  },
};

export const Neutral: Story = {
  args: {
    color: 'neutral',
    children: 'TB',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {SIZE_OPTIONS.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2 text-slate-400 text-xs">
          <Avatar size={size} color="brand">
            <User />
          </Avatar>
          <span>{size.toUpperCase()}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    controls: { exclude: ['size', 'color', 'variant', 'children'] },
  },
};

export const ColorPalette: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {COLOR_OPTIONS.map((color) => (
        <div key={color} className="flex flex-col items-center gap-2 text-slate-400 text-xs">
          <Avatar color={color}>
            <User />
          </Avatar>
          <span className="uppercase tracking-wide">{color}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="text-slate-400 text-xs">
        <p className="mb-2 font-semibold text-white">Default</p>
        <Avatar variant="default" color="brand">
          TL
        </Avatar>
      </div>
      <div className="text-slate-400 text-xs">
        <p className="mb-2 font-semibold text-white">Elevated</p>
        <Avatar variant="elevated" color="brandHero">
          TL
        </Avatar>
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};

export const IconExamples: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar color="rose">
        <Mail />
      </Avatar>
      <Avatar color="amber">
        <Settings />
      </Avatar>
      <Avatar color="cyan">
        <User />
      </Avatar>
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
};
