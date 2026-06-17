import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('zgłasza zmianę po kliknięciu', async () => {
    const onChange = vi.fn()
    render(<Toggle checked={false} onChange={onChange} label="Siatka" />)
    await userEvent.click(screen.getByText('Siatka'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('odzwierciedla stan zaznaczenia', () => {
    render(<Toggle checked onChange={() => {}} label="Autozapis" />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})
