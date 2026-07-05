import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useQuizState } from '../useQuizState'
import type { QuizConfig, QuizQuestion, QuizState, QuizAnswer } from '@/types/quiz'

const questions: QuizQuestion[] = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  question_number: index + 1,
  question_text: `Question ${index + 1}`,
  option_a: 'A',
  option_b: 'B',
  option_c: 'C',
  option_d: 'D',
  correct_answer: 'A'
}))

const config: QuizConfig = {
  chapter_id: 5,
  mode: 'practice',
  timer_mode: 'unlimited',
  timer_value: 60,
  batch_size: 5,
  question_range: { start: 1, end: 5 }
}

function buildSavedState(): QuizState {
  const answers = new Map<number, QuizAnswer>()
  answers.set(1, { question_id: 1, selected_answer: 'A', time_spent: 10, is_bookmarked: false, is_visited: true })
  answers.set(2, { question_id: 2, selected_answer: 'C', time_spent: 20, is_bookmarked: true, is_visited: true })

  return {
    config: {
      ...config,
      mode: 'exam',
      timer_mode: 'whole_test',
      timer_value: 120
    },
    questions,
    answers,
    current_question_index: 3,
    start_time: 1700000000000,
    elapsed_time: 900,
    is_paused: true,
    is_completed: false
  }
}

describe('useQuizState resume restoration', () => {
  it('restores the saved question index, answers, config, and timer state', () => {
    const savedState = buildSavedState()

    const { result } = renderHook(() => useQuizState(config, questions, savedState))

    expect(result.current.state.current_question_index).toBe(3)
    expect(result.current.state.config.mode).toBe('exam')
    expect(result.current.state.config.timer_mode).toBe('whole_test')
    expect(result.current.state.config.timer_value).toBe(120)
    expect(result.current.state.answers.size).toBeGreaterThanOrEqual(2)
    expect(result.current.state.answers.get(2)?.is_bookmarked).toBe(true)
    expect(result.current.state.start_time).toBe(1700000000000)
    expect(result.current.state.elapsed_time).toBe(900)
    expect(result.current.state.is_paused).toBe(true)
    expect(result.current.state.is_completed).toBe(false)
  })

  it('prefers fresh API questions over stale saved question records', () => {
    const staleState = buildSavedState()
    staleState.questions = questions.map((question) => ({
      ...question,
      explanation: null
    }))

    const freshQuestions = questions.map((question, index) => ({
      ...question,
      explanation: `Explanation for question ${index + 1}`
    }))

    const { result } = renderHook(() => useQuizState(config, freshQuestions, staleState))

    expect(result.current.state.questions[0].explanation).toBe('Explanation for question 1')
    expect(result.current.state.questions[1].explanation).toBe('Explanation for question 2')
  })
})
