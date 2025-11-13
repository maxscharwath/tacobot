import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarLabelGroup } from '@tacobot/ui-kit';

const meta = {
  title: 'UI Kit/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: {
    initials: 'TL',
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Avatar key={size} size={size} initials="TL" />
      ))}
    </div>
  ),
};

export const LabelGroup: Story = {
  render: () => (
    <AvatarLabelGroup title="Taco Leaders" subtitle="8 members" size="lg" initials="TL" />
  ),
};
