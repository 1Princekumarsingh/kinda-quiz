import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ImportExplanationBlock from './ImportExplanationBlock'

describe('ImportExplanationBlock', () => {
  it('renders the explanation content when explanation text exists', () => {
    render(<ImportExplanationBlock explanation="Binary search halves the search space each time." />)

    expect(screen.getByText('Explanation')).toBeInTheDocument()
    expect(screen.getByText('Binary search halves the search space each time.')).toBeInTheDocument()
  })

  it('renders nothing when no explanation exists', () => {
    const { container } = render(<ImportExplanationBlock explanation={null} />)

    expect(screen.queryByText('Explanation')).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
  })
})
