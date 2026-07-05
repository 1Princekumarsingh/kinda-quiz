import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PracticeFeedbackExplanation from './PracticeFeedbackExplanation'

describe('PracticeFeedbackExplanation', () => {
  it('renders the explanation when feedback is visible and explanation text exists', () => {
    render(<PracticeFeedbackExplanation visible={true} explanation="Binary search halves the search space each step." />)

    expect(screen.getByText('Explanation')).toBeInTheDocument()
    expect(screen.getByText('Binary search halves the search space each step.')).toBeInTheDocument()
  })

  it('does not render anything when there is no explanation to show', () => {
    const { container } = render(<PracticeFeedbackExplanation visible={true} explanation={null} />)

    expect(screen.queryByText('Explanation')).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
  })
})
