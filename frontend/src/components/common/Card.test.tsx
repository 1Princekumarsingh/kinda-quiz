import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Card from './Card'

describe('Card', () => {
  it('applies desktop-only hover classes when hoverable is enabled', () => {
    render(<Card hoverable>Content</Card>)

    const card = screen.getByText('Content').closest('section')
    expect(card).toHaveClass('lg:hover:scale-[1.02]')
    expect(card).toHaveClass('lg:hover:shadow-elevated-hover')
  })

  it('uses more compact desktop padding for medium cards', () => {
    render(<Card padding="md">Content</Card>)

    const card = screen.getByText('Content').closest('section')
    expect(card).toHaveClass('p-5')
    expect(card).toHaveClass('md:p-5')
    expect(card).toHaveClass('lg:p-4')
  })

  it('uses more compact desktop padding for large cards', () => {
    render(<Card padding="lg">Content</Card>)

    const card = screen.getByText('Content').closest('section')
    expect(card).toHaveClass('p-6')
    expect(card).toHaveClass('md:p-6')
    expect(card).toHaveClass('lg:p-4')
  })

  it('keeps the base classes and custom className', () => {
    render(<Card className="custom-card">Content</Card>)

    const card = screen.getByText('Content').closest('section')
    expect(card).toHaveClass('rounded-2xl')
    expect(card).toHaveClass('custom-card')
  })
})
