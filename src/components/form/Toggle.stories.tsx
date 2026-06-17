import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Toggle } from './Toggle'

const meta: Meta<typeof Toggle> = {
  title: 'UI/Toggle',
  component: Toggle,
}

export default meta
type Story = StoryObj<typeof Toggle>

function ToggleDemo() {
  const [on, setOn] = useState(true)
  return <Toggle checked={on} onChange={setOn} label="Pokaż siatkę" />
}

export const Interactive: Story = {
  render: () => <ToggleDemo />,
}
