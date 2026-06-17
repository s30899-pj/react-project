import type { Preview } from '@storybook/react'
import '../src/styles/main.scss'

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#15161f' },
        { name: 'light', value: '#f5f6fa' },
      ],
    },
  },
}

export default preview
