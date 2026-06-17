import type { Meta, StoryObj } from '@storybook/react'
import { Panel } from './Panel'
import { Button } from '@/components/Button/Button'
import { LayersIcon, SettingsIcon, PlusIcon } from '@/components/icons'

const meta: Meta<typeof Panel> = {
  title: 'UI/Panel',
  component: Panel,
}

export default meta
type Story = StoryObj<typeof Panel>

export const Basic: Story = {
  args: { title: 'Warstwy', icon: <LayersIcon size={16} /> },
  render: (args) => (
    <div style={{ width: 280 }}>
      <Panel {...args}>
        <Panel.Section label="Sekcja A">Zawartość sekcji A</Panel.Section>
        <Panel.Section label="Sekcja B">Zawartość sekcji B</Panel.Section>
      </Panel>
    </div>
  ),
}

export const Collapsible: Story = {
  args: {
    title: 'Ustawienia',
    icon: <SettingsIcon size={16} />,
    collapsible: true,
    actions: (
      <Button size="sm" variant="ghost" icon={<PlusIcon size={14} />} aria-label="Dodaj" />
    ),
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <Panel {...args}>Treść zwijanego panelu</Panel>
    </div>
  ),
}
