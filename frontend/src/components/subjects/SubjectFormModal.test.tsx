import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SubjectFormModal from './SubjectFormModal'

describe('SubjectFormModal', () => {
  it('uses a desktop-friendly form width for readability', () => {
    render(
      <SubjectFormModal
        isOpen={true}
        onClose={() => {}}
        onSubmit={vi.fn()}
        mode="create"
      />
    )

    const form = screen.getByRole('button', { name: /create subject/i }).closest('form')
    expect(form).toHaveClass('lg:max-w-[600px]')
    expect(form).toHaveClass('lg:mx-auto')
  })
})
