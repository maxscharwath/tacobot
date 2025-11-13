import type { Meta, StoryObj } from '@storybook/react-vite';
import { MultiSelect, Select } from '@tacobot/ui-kit';

const meta = {
  title: 'UI Kit/Select',
  component: Select,
  tags: ['autodocs'],
  args: {
    children: (
      <>
        <option value="al-pastor">Al Pastor</option>
        <option value="barbacoa">Barbacoa</option>
        <option value="carnitas">Carnitas</option>
      </>
    ),
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: {
    defaultValue: '',
    children: (
      <>
        <option value="" disabled>
          Choose a filling
        </option>
        <option value="pollo">Pollo</option>
        <option value="veg">Veggie</option>
      </>
    ),
  },
};

export const Multiple: Story = {
  render: () => (
    <MultiSelect defaultValue={['chips']} multiple aria-label="Sides">
      <option value="chips">Chips & salsa</option>
      <option value="queso">Queso</option>
      <option value="guac">Guacamole</option>
    </MultiSelect>
  ),
};
