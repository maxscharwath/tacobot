import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Modal } from '@tacobot/ui-kit';
import { useState } from 'react';

const meta = {
  title: 'UI Kit/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const ModalDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-4">
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Schedule delivery"
        description="Pick a time slot for your crew."
      >
        <p className="text-slate-300 text-sm">
          11:30 AM - 1:00 PM slots usually fill up fast on Fridays. Consider earlier pickup if you
          have a large order.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Confirm</Button>
        </div>
      </Modal>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <ModalDemo />,
};
