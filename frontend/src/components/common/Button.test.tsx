import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('applies tablet-friendly touch-target sizing', () => {
    render(<Button>Continue</Button>)

    const button = screen.getByRole('button', { name: /continue/i })
    expect(button).toHaveClass('md:min-h-[44px]')
    expect(button).toHaveClass('md:px-4')
  })
})
