import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '@tacobot/ui-kit';

const meta = {
  title: 'UI Kit/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    placeholder: 'Search tacos…',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ErrorState: Story = {
  args: {
    placeholder: 'Enter email',
    error: true,
  },
};
