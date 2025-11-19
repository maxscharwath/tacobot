import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@tacobot/ui-kit';

const meta = {
  title: 'UI Kit/AlertDialog',
  component: AlertDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Blocking confirmation dialog built with Radix primitives and TacoBot styles.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const DialogContent = ({ tone = 'default' }: { tone?: 'default' | 'destructive' }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant={tone === 'destructive' ? 'danger' : 'primary'}>
        {tone === 'destructive' ? 'Delete group order' : 'Pause submissions'}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {tone === 'destructive' ? 'Supprimer la commande ?' : 'Mettre en pause ?'}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {tone === 'destructive'
            ? 'Cette action supprimera la commande groupée et toutes les contributions associées. '
            : 'Les participants ne pourront plus modifier leurs commandes tant que la pause est active.'}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Annuler</AlertDialogCancel>
        <AlertDialogAction variant={tone === 'destructive' ? 'destructive' : 'default'}>
          {tone === 'destructive' ? 'Supprimer' : 'Mettre en pause'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export const Default: Story = {
  render: () => <DialogContent />,
};

export const DestructiveAction: Story = {
  render: () => <DialogContent tone="destructive" />,
};

export const InlineUsage: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-slate-300 text-sm">
        The dialog trigger can live alongside other actions. Use multiple instances for granular
        flows.
      </p>
      <div className="flex flex-wrap gap-3">
        <DialogContent />
        <DialogContent tone="destructive" />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
