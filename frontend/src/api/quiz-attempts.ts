import api from '@/lib/axios'

export interface QuizAttemptCreate {
  chapter_id: number
  mode: string
  time_taken: number
  correct: number
  wrong: number
  accuracy: number
  // Optional extended metadata
  config?: {
    timer_mode?: string
    timer_value?: number
    question_range_start?: number
    question_range_end?: number
    batch_size?: number
  }
  unanswered_questions?: number
  responses?: Array<{
    question_id: number
    user_answer?: string | null
    correct_answer: string
    is_correct: boolean
    time_spent: number
    confidence?: string | null
  }>
}

export interface QuizAttempt {
  id: number
  user_id: number
  chapter_id: number
  quiz_date: string
  mode: string
  time_taken: number
  correct: number
  wrong: number
  accuracy: number
  chapter_name?: string
}

export interface QuizAttemptListResponse {
  data: QuizAttempt[]
  total: number
  message: string
}

export const quizAttemptsApi = {
  create: async (data: QuizAttemptCreate): Promise<QuizAttempt> => {
    const response = await api.post('/quiz-attempts', data)
    return response.data
  },
  list: async (): Promise<QuizAttemptListResponse> => {
    const response = await api.get('/quiz-attempts')
    return response.data
  }
}
