import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renderuje tekst i wywołuje onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Zapisz</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Zapisz' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('blokuje kliknięcie podczas ładowania', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Zapisz
      </Button>,
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
