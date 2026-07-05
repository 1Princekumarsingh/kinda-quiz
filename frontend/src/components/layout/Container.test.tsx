import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Container } from './Container'

describe('Container', () => {
  it('should render children correctly', () => {
    render(
      <Container>
        <div data-testid="child">Test Content</div>
      </Container>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should apply default size (lg)', () => {
    const { container } = render(
      <Container>
        <div>Content</div>
      </Container>
    )

    const containerElement = container.firstChild as HTMLElement
    expect(containerElement).toHaveClass('max-w-full')
    expect(containerElement).toHaveClass('lg:max-w-[1024px]')
    expect(containerElement).toHaveClass('lg:mx-auto')
  })

  it('should apply sm size', () => {
    const { container } = render(
      <Container size="sm">
        <div>Content</div>
      </Container>
    )

    const containerElement = container.firstChild as HTMLElement
    expect(containerElement).toHaveClass('max-w-full')
    expect(containerElement).toHaveClass('lg:max-w-[640px]')
  })

  it('should apply md size', () => {
    const { container } = render(
      <Container size="md">
        <div>Content</div>
      </Container>
    )

    const containerElement = container.firstChild as HTMLElement
    expect(containerElement).toHaveClass('max-w-full')
    expect(containerElement).toHaveClass('lg:max-w-[768px]')
  })

  it('should apply xl size', () => {
    const { container } = render(
      <Container size="xl">
        <div>Content</div>
      </Container>
    )

    const containerElement = container.firstChild as HTMLElement
    expect(containerElement).toHaveClass('max-w-full')
    expect(containerElement).toHaveClass('lg:max-w-[1280px]')
  })

  it('should apply full size', () => {
    const { container } = render(
      <Container size="full">
        <div>Content</div>
      </Container>
    )

    const containerElement = container.firstChild as HTMLElement
    expect(containerElement).toHaveClass('max-w-full')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <Container className="custom-class bg-blue-500">
        <div>Content</div>
      </Container>
    )

    const containerElement = container.firstChild as HTMLElement
    expect(containerElement).toHaveClass('custom-class')
    expect(containerElement).toHaveClass('bg-blue-500')
  })

  it('should render as custom element', () => {
    const { container } = render(
      <Container as="section">
        <div>Content</div>
      </Container>
    )

    expect(container.querySelector('section')).toBeInTheDocument()
  })

  it('should apply responsive padding classes', () => {
    const { container } = render(
      <Container>
        <div>Content</div>
      </Container>
    )

    const containerElement = container.firstChild as HTMLElement
    expect(containerElement).toHaveClass('px-4')
    expect(containerElement).toHaveClass('md:px-6')
    expect(containerElement).toHaveClass('lg:px-8')
  })

  it('should apply width and overflow classes', () => {
    const { container } = render(
      <Container>
        <div>Content</div>
      </Container>
    )

    const containerElement = container.firstChild as HTMLElement
    expect(containerElement).toHaveClass('w-full')
    expect(containerElement).toHaveClass('mx-auto')
    expect(containerElement).toHaveClass('overflow-x-hidden')
  })
})
