import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import { SaveIcon } from '@/components/icons'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Przycisk' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Danger: Story = { args: { variant: 'danger', children: 'Usuń' } }
export const Loading: Story = { args: { loading: true } }
export const WithIcon: Story = { args: { icon: <SaveIcon size={16} />, children: 'Zapisz' } }
