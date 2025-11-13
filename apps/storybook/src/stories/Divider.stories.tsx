import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from '@tacobot/ui-kit';

const meta = {
  title: 'UI Kit/Divider',
  component: Divider,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLabel: Story = {
  args: {
    label: 'or use password',
    className: 'w-64',
  },
};

export const Plain: Story = {
  args: {
    className: 'w-64',
  },
};
