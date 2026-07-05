import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import QuestionImport from './QuestionImport'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const mockParseText = vi.fn()
const mockAddToast = vi.fn()

vi.mock('@/api/parse', () => ({
  parseApi: {
    parseText: (...args: unknown[]) => mockParseText(...args),
    parseDocx: vi.fn(),
  },
}))

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}))

describe('QuestionImport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockParseText.mockResolvedValue({
      total_questions: 2,
      valid_questions: 2,
      invalid_questions: 0,
      questions: [
        {
          id: 1,
          number: 1,
          question_text: 'What is the capital of France?',
          option_a: 'Berlin',
          option_b: 'Madrid',
          option_c: 'Paris',
          option_d: 'Rome',
          correct_answer: 'C',
          explanation: null,
          is_valid: true,
          errors: [],
          warnings: [],
        },
        {
          id: 2,
          number: 2,
          question_text: 'What is binary search?',
          option_a: 'Linear search',
          option_b: 'Divide-and-conquer search',
          option_c: 'Brute-force search',
          option_d: 'Hash-based search',
          correct_answer: 'B',
          explanation: 'Binary search halves the search space with each comparison.',
          is_valid: true,
          errors: [],
          warnings: [],
        },
      ],
    })
  })

  it('does not render an explanation section for questions without explanations', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/subjects/1/chapters/2/import']}>
          <Routes>
            <Route path="/subjects/:subjectId/chapters/:chapterId/import" element={<QuestionImport />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await user.type(screen.getByLabelText(/paste your questions here/i), 'Question 1\nWhat is the capital of France?\nA. Berlin\nB. Madrid\nC. Paris\nD. Rome\nAnswer: C')
    await user.click(screen.getByRole('button', { name: /parse questions/i }))

    await waitFor(() => expect(mockParseText).toHaveBeenCalled())

    const questionCard = screen.getByText('What is the capital of France?').closest('[class*="rounded-2xl"]')

    expect(await screen.findByText('Question 1')).toBeInTheDocument()
    expect(questionCard).not.toHaveTextContent('Explanation')
  })

  it('shows the explanation preview for enhanced questions and keeps the basic format guide visible', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/subjects/1/chapters/2/import']}>
          <Routes>
            <Route path="/subjects/:subjectId/chapters/:chapterId/import" element={<QuestionImport />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await user.type(screen.getByLabelText(/paste your questions here/i), 'Question 1\nWhat is the capital of France?\nA. Berlin\nB. Madrid\nC. Paris\nD. Rome\nAnswer: C')
    await user.click(screen.getByRole('button', { name: /parse questions/i }))

    await waitFor(() => expect(mockParseText).toHaveBeenCalled())

    expect(await screen.findByText('Binary search halves the search space with each comparison.')).toBeInTheDocument()
    expect(screen.getByText('Enhanced Format with Explanations')).toBeInTheDocument()
    expect(screen.getByText('Basic Format (Existing)')).toBeInTheDocument()
  })
})
