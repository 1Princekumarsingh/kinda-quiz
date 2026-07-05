import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ReviewExplanation from './ReviewExplanation'

describe('ReviewExplanation', () => {
  it('renders explanation content when explanation text exists', () => {
    render(<ReviewExplanation explanation="Binary search halves the search space each time." />)

    expect(screen.getByText('Explanation')).toBeInTheDocument()
    expect(screen.getByText('Binary search halves the search space each time.')).toBeInTheDocument()
  })

  it('renders nothing when no explanation exists', () => {
    const { container } = render(<ReviewExplanation explanation={null} />)

    expect(screen.queryByText('Explanation')).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
  })
})
