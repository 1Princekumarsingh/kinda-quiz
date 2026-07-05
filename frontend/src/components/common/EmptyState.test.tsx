import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('applies responsive heading and body typography classes', () => {
    render(<EmptyState title="No chapters yet" description="Add a chapter to get started." />)

    const heading = screen.getByRole('heading', { level: 3, name: /no chapters yet/i })
    const description = screen.getByText(/add a chapter to get started/i)

    expect(heading).toHaveClass('md:text-xl')
    expect(heading).toHaveClass('lg:text-2xl')
    expect(description).toHaveClass('lg:text-base')
  })
})
