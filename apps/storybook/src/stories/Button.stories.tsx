import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@tacobot/ui-kit';

const meta = {
  title: 'UI Kit/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'tab'],
      description: 'The visual style variant of the button',
    },
    color: {
      control: 'select',
      options: ['brand', 'rose', 'amber', 'emerald', 'violet', 'sky', 'cyan'],
      description: 'Color theme (works with tab variant)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the button',
    },
    pill: {
      control: 'boolean',
      description:
        'Whether the button should be pill-shaped (rounded-full) or rounded (rounded-xl)',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button should take full width',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

export const Tab: Story = {
  args: {
    variant: 'tab',
    children: 'Tab Button',
  },
};

export const TabWithColor: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="tab" color="brand">
        Brand
      </Button>
      <Button variant="tab" color="rose">
        Rose
      </Button>
      <Button variant="tab" color="amber">
        Amber
      </Button>
      <Button variant="tab" color="emerald">
        Emerald
      </Button>
      <Button variant="tab" color="violet">
        Violet
      </Button>
      <Button variant="tab" color="sky">
        Sky
      </Button>
      <Button variant="tab" color="cyan">
        Cyan
      </Button>
    </div>
  ),
};

export const PillVsRounded: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold text-sm text-white">Pill Shape (rounded-full)</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" pill>
            Primary Pill
          </Button>
          <Button variant="secondary" pill>
            Secondary Pill
          </Button>
          <Button variant="outline" pill>
            Outline Pill
          </Button>
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-semibold text-sm text-white">Rounded Shape (rounded-xl)</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" pill={false}>
            Primary Rounded
          </Button>
          <Button variant="secondary" pill={false}>
            Secondary Rounded
          </Button>
          <Button variant="outline" pill={false}>
            Outline Rounded
          </Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button>Default</Button>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="tab">Tab</Button>
      </div>
    </div>
  ),
};

export const OutlineWithColors: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="mb-3 font-semibold text-sm text-white">
        Outline Variant - Color Only Affects Border & Text
      </h3>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline">Default</Button>
        <Button variant="outline" color="brand">
          Brand
        </Button>
        <Button variant="outline" color="rose">
          Rose
        </Button>
        <Button variant="outline" color="amber">
          Amber
        </Button>
        <Button variant="outline" color="emerald">
          Emerald
        </Button>
        <Button variant="outline" color="violet">
          Violet
        </Button>
        <Button variant="outline" color="sky">
          Sky
        </Button>
        <Button variant="outline" color="cyan">
          Cyan
        </Button>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const SecondaryWithColors: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="mb-3 font-semibold text-sm text-white">Secondary Variant with Colors</h3>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary">Default</Button>
        <Button variant="secondary" color="brand">
          Brand
        </Button>
        <Button variant="secondary" color="rose">
          Rose
        </Button>
        <Button variant="secondary" color="amber">
          Amber
        </Button>
        <Button variant="secondary" color="emerald">
          Emerald
        </Button>
        <Button variant="secondary" color="violet">
          Violet
        </Button>
        <Button variant="secondary" color="sky">
          Sky
        </Button>
        <Button variant="secondary" color="cyan">
          Cyan
        </Button>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const GhostWithColors: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="mb-3 font-semibold text-sm text-white">Ghost Variant with Colors</h3>
      <div className="flex flex-wrap gap-3">
        <Button variant="ghost">Default</Button>
        <Button variant="ghost" color="brand">
          Brand
        </Button>
        <Button variant="ghost" color="rose">
          Rose
        </Button>
        <Button variant="ghost" color="amber">
          Amber
        </Button>
        <Button variant="ghost" color="emerald">
          Emerald
        </Button>
        <Button variant="ghost" color="violet">
          Violet
        </Button>
        <Button variant="ghost" color="sky">
          Sky
        </Button>
        <Button variant="ghost" color="cyan">
          Cyan
        </Button>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const PrimaryWithColors: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="mb-3 font-semibold text-sm text-white">Primary Variant with Colors</h3>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Default</Button>
        <Button variant="primary" color="brand">
          Brand
        </Button>
        <Button variant="primary" color="rose">
          Rose
        </Button>
        <Button variant="primary" color="amber">
          Amber
        </Button>
        <Button variant="primary" color="emerald">
          Emerald
        </Button>
        <Button variant="primary" color="violet">
          Violet
        </Button>
        <Button variant="primary" color="sky">
          Sky
        </Button>
        <Button variant="primary" color="cyan">
          Cyan
        </Button>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const TabButtons: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold text-sm text-white">Inactive Tab Buttons</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="tab" pill size="sm" className="uppercase tracking-[0.2em]">
            Meats
          </Button>
          <Button variant="tab" pill size="sm" className="uppercase tracking-[0.2em]">
            Sauces
          </Button>
          <Button variant="tab" pill size="sm" className="uppercase tracking-[0.2em]">
            Garnishes
          </Button>
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-semibold text-sm text-white">Active Tab Buttons with Colors</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="tab" color="rose" pill size="sm" className="uppercase tracking-[0.2em]">
            Meats
          </Button>
          <Button variant="tab" color="amber" pill size="sm" className="uppercase tracking-[0.2em]">
            Sauces
          </Button>
          <Button
            variant="tab"
            color="emerald"
            pill
            size="sm"
            className="uppercase tracking-[0.2em]"
          >
            Garnishes
          </Button>
          <Button
            variant="tab"
            color="violet"
            pill
            size="sm"
            className="uppercase tracking-[0.2em]"
          >
            Extras
          </Button>
          <Button variant="tab" color="sky" pill size="sm" className="uppercase tracking-[0.2em]">
            Drinks
          </Button>
          <Button variant="tab" color="cyan" pill size="sm" className="uppercase tracking-[0.2em]">
            Desserts
          </Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
