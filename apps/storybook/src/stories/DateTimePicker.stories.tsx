import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateTimePicker } from '@tacobot/ui-kit';
import { useState } from 'react';

const meta = {
  title: 'UI Kit/DateTimePicker',
  component: DateTimePicker,
  tags: ['autodocs'],
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => {
    const [date, setDate] = useState('2025-03-15');
    const [time, setTime] = useState('18:30');

    return (
      <DateTimePicker
        label="Pickup window"
        dateValue={date}
        timeValue={time}
        onDateChange={setDate}
        onTimeChange={setTime}
      />
    );
  },
};
