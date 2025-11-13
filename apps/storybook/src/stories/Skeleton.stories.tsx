import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton, SkeletonText } from '@tacobot/ui-kit';

const meta = {
  title: 'UI Kit/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Block: Story = {
  render: () => <Skeleton className="h-32 w-64" />,
};

export const Circular: Story = {
  render: () => <Skeleton variant="circular" className="h-16 w-16" />,
};

export const Text: Story = {
  render: () => <SkeletonText lines={4} className="w-64" />,
};
