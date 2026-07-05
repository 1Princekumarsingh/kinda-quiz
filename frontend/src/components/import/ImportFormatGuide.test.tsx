import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ImportFormatGuide from './ImportFormatGuide'

describe('ImportFormatGuide', () => {
  it('shows both the basic and enhanced import formats', () => {
    render(<ImportFormatGuide />)

    expect(screen.getByText('Basic Format (Existing)')).toBeInTheDocument()
    expect(screen.getByText('Enhanced Format with Explanations')).toBeInTheDocument()
    expect(screen.getByText(/explanations are completely optional/i)).toBeInTheDocument()
  })
})
