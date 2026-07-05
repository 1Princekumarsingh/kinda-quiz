import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ResponsiveGrid } from './ResponsiveGrid'

describe('ResponsiveGrid', () => {
  it('should render children correctly', () => {
    render(
      <ResponsiveGrid>
        <div data-testid="child-1">Item 1</div>
        <div data-testid="child-2">Item 2</div>
        <div data-testid="child-3">Item 3</div>
      </ResponsiveGrid>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
    expect(screen.getByTestId('child-3')).toBeInTheDocument()
  })

  it('should apply default column configuration (1-2-3)', () => {
    const { container } = render(
      <ResponsiveGrid>
        <div>Item</div>
      </ResponsiveGrid>
    )

    const gridElement = container.firstChild as HTMLElement
    expect(gridElement).toHaveClass('grid-cols-1')
    expect(gridElement).toHaveClass('md:grid-cols-2')
    expect(gridElement).toHaveClass('lg:grid-cols-3')
  })

  it('should apply custom column configuration', () => {
    const { container } = render(
      <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 4 }}>
        <div>Item</div>
      </ResponsiveGrid>
    )

    const gridElement = container.firstChild as HTMLElement
    expect(gridElement).toHaveClass('grid-cols-1')
    expect(gridElement).toHaveClass('md:grid-cols-2')
    expect(gridElement).toHaveClass('lg:grid-cols-4')
    expect(gridElement).toHaveClass('xl:grid-cols-4')
  })

  it('should apply single column on all breakpoints', () => {
    const { container } = render(
      <ResponsiveGrid columns={{ mobile: 1, tablet: 1, desktop: 1 }}>
        <div>Item</div>
      </ResponsiveGrid>
    )

    const gridElement = container.firstChild as HTMLElement
    expect(gridElement).toHaveClass('grid-cols-1')
    expect(gridElement).toHaveClass('md:grid-cols-1')
    expect(gridElement).toHaveClass('lg:grid-cols-1')
  })

  it('should apply landscape-specific columns for tablet layouts', () => {
    const { container } = render(
      <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }}>
        <div>Item</div>
      </ResponsiveGrid>
    )

    const gridElement = container.firstChild as HTMLElement
    expect(gridElement).toHaveClass('md:landscape:grid-cols-3')
    expect(gridElement).toHaveClass('md:landscape:gap-6')
  })

  it('should apply default gap (md)', () => {
    const { container } = render(
      <ResponsiveGrid>
        <div>Item</div>
      </ResponsiveGrid>
    )

    const gridElement = container.firstChild as HTMLElement
    expect(gridElement).toHaveClass('gap-6')
  })

  it('should apply small gap', () => {
    const { container } = render(
      <ResponsiveGrid gap="sm">
        <div>Item</div>
      </ResponsiveGrid>
    )

    const gridElement = container.firstChild as HTMLElement
    expect(gridElement).toHaveClass('gap-4')
    expect(gridElement).toHaveClass('md:gap-5')
    expect(gridElement).toHaveClass('lg:gap-6')
  })

  it('should apply large gap', () => {
    const { container } = render(
      <ResponsiveGrid gap="lg">
        <div>Item</div>
      </ResponsiveGrid>
    )

    const gridElement = container.firstChild as HTMLElement
    expect(gridElement).toHaveClass('gap-8')
    expect(gridElement).toHaveClass('md:gap-9')
    expect(gridElement).toHaveClass('lg:gap-10')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <ResponsiveGrid className="custom-grid bg-gray-100">
        <div>Item</div>
      </ResponsiveGrid>
    )

    const gridElement = container.firstChild as HTMLElement
    expect(gridElement).toHaveClass('custom-grid')
    expect(gridElement).toHaveClass('bg-gray-100')
  })

  it('should render as custom element', () => {
    const { container } = render(
      <ResponsiveGrid as="section">
        <div>Item</div>
      </ResponsiveGrid>
    )

    expect(container.querySelector('section')).toBeInTheDocument()
  })

  it('should apply grid display and full width', () => {
    const { container } = render(
      <ResponsiveGrid>
        <div>Item</div>
      </ResponsiveGrid>
    )

    const gridElement = container.firstChild as HTMLElement
    expect(gridElement).toHaveClass('grid')
    expect(gridElement).toHaveClass('w-full')
  })

  it('should handle partial column configuration', () => {
    const { container } = render(
      <ResponsiveGrid columns={{ desktop: 4 }}>
        <div>Item</div>
      </ResponsiveGrid>
    )

    const gridElement = container.firstChild as HTMLElement
    // Should use defaults for mobile and tablet
    expect(gridElement).toHaveClass('grid-cols-1')
    expect(gridElement).toHaveClass('md:grid-cols-2')
    expect(gridElement).toHaveClass('lg:grid-cols-4')
    expect(gridElement).toHaveClass('xl:grid-cols-4')
  })
})
