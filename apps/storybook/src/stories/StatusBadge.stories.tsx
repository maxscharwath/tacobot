import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBadge } from '@tacobot/ui-kit';

const meta = {
  title: 'UI Kit/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  args: {
    status: 'submitted',
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {['draft', 'pending', 'active', 'submitted', 'completed', 'closed'].map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  ),
};
