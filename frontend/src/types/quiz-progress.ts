import { QuizConfig, QuizQuestion, QuizAnswer } from '@/types/quiz'

export interface QuizProgressState {
  config: QuizConfig
  questions: QuizQuestion[]
  answers: Record<number, QuizAnswer>
  current_question_index: number
  start_time: number
  elapsed_time: number
  is_paused: boolean
  is_completed: boolean
}

export interface QuizProgress {
  id: number
  user_id: number
  chapter_id: number
  session_key: string
  config: QuizConfig
  state: QuizProgressState
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface QuizProgressListResponse {
  data: QuizProgress[]
  total: number
  message: string
}

export interface QuizProgressCreate {
  chapter_id: number
  session_key: string
  config: QuizConfig
  state: QuizProgressState
  is_completed: boolean
}

export interface QuizProgressUpdate {
  config?: Partial<QuizConfig>
  state?: Partial<QuizProgressState>
  is_completed?: boolean
}
