import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from '@tacobot/ui-kit';

const meta = {
  title: 'UI Kit/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: 'select',
      options: ['error', 'success', 'warning', 'info'],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    tone: 'info',
    title: 'Information',
    children: 'This is an informational alert message.',
  },
};

export const Success: Story = {
  args: {
    tone: 'success',
    title: 'Success',
    children: 'Operation completed successfully!',
  },
};

export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Warning',
    children: 'Please review this warning message.',
  },
};

export const ErrorState: Story = {
  args: {
    tone: 'error',
    title: 'Error',
    children: 'An error has occurred. Please try again.',
  },
};

export const WithoutTitle: Story = {
  args: {
    tone: 'info',
    children: 'This alert has no title.',
  },
};
