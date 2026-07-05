import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ErrorState from './ErrorState'

describe('ErrorState', () => {
  it('applies desktop-centered layout and responsive sizing classes', () => {
    render(<ErrorState title="Unable to load" message="Please try again" onRetry={() => {}} />)

    const card = screen.getByRole('heading', { level: 3, name: /unable to load/i }).closest('div')
    expect(card).toHaveClass('lg:max-w-[600px]')
    expect(card).toHaveClass('lg:mx-auto')
    expect(card).toHaveClass('lg:px-10')
  })
})
