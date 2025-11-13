import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl } from '@tacobot/ui-kit';
import { useState } from 'react';

const meta = {
  title: 'UI Kit/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => {
    const [value, setValue] = useState<'signin' | 'signup'>('signin');
    return (
      <SegmentedControl
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'signin', label: 'Sign in' },
          { value: 'signup', label: 'Sign up' },
        ]}
      />
    );
  },
};

export const TwoOptions: Story = {
  render: () => {
    const [value, setValue] = useState<'a' | 'b'>('a');
    return (
      <SegmentedControl
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ]}
      />
    );
  },
};

export const ThreeOptions: Story = {
  render: () => {
    const [value, setValue] = useState<'one' | 'two' | 'three'>('one');
    return (
      <SegmentedControl
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
          { value: 'three', label: 'Three' },
        ]}
      />
    );
  },
};
