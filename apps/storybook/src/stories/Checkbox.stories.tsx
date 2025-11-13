import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '@tacobot/ui-kit';

const meta = {
  title: 'UI Kit/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: {
    label: 'Include chips',
    defaultChecked: true,
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    label: 'Unavailable option',
    disabled: true,
  },
};
