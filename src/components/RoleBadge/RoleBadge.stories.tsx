import type { Meta, StoryObj } from '@storybook/react'
import { RoleBadge } from './RoleBadge'

const meta: Meta<typeof RoleBadge> = {
  title: 'UI/RoleBadge',
  component: RoleBadge,
}

export default meta
type Story = StoryObj<typeof RoleBadge>

export const Creator: Story = { args: { role: 'creator' } }
export const Tester: Story = { args: { role: 'tester' } }
export const Admin: Story = { args: { role: 'admin' } }
