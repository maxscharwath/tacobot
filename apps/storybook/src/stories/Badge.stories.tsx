import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '@tacobot/ui-kit';

const meta = {
  title: 'UI Kit/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['brand', 'success', 'warning', 'neutral'],
    },
    pill: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {
  args: {
    tone: 'brand',
    children: 'Brand Badge',
  },
};

export const Success: Story = {
  args: {
    tone: 'success',
    children: 'Success Badge',
  },
};

export const Warning: Story = {
  args: {
    tone: 'warning',
    children: 'Warning Badge',
  },
};

export const Neutral: Story = {
  args: {
    tone: 'neutral',
    children: 'Neutral Badge',
  },
};

export const Pill: Story = {
  args: {
    tone: 'brand',
    pill: true,
    children: 'Pill Badge',
  },
};
