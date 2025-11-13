import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from '@tacobot/ui-kit';

const meta = {
  title: 'UI Kit/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
    placeholder: 'Add delivery notes…',
    rows: 4,
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ErrorState: Story = {
  args: {
    error: true,
    placeholder: 'Missing information',
  },
};
