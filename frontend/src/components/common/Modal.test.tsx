import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Modal from './Modal'

describe('Modal', () => {
  it('uses tablet and desktop sizing classes for centered dialogs', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Content</div>
      </Modal>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('md:inset-auto')
    expect(dialog).toHaveClass('md:w-[90%]')
    expect(dialog).toHaveClass('md:max-h-[90vh]')
    expect(dialog).toHaveClass('lg:w-auto')
    expect(dialog).toHaveClass('lg:max-w-[600px]')
  })
})
