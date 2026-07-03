export interface QuizQuestion {
  id: number
  question_number: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation?: string
}

export type QuizMode = 'practice' | 'exam'

export type TimerMode = 'unlimited' | 'per_question' | 'whole_test'

export interface QuizConfig {
  chapter_id: number
  mode: QuizMode
  timer_mode: TimerMode
  timer_value?: number // seconds per question or minutes for whole test
  question_range?: {
    start: number
    end: number
  }
  batch_size?: number
}

export type ConfidenceLevel = 'mastered' | 'review' | 'almost_forgot' | null

export interface QuizAnswer {
  question_id: number
  selected_answer: string | null
  time_spent: number // seconds
  is_bookmarked: boolean
  is_visited: boolean
  confidence_level?: ConfidenceLevel
}

export interface QuizState {
  config: QuizConfig
  questions: QuizQuestion[]
  answers: Map<number, QuizAnswer>
  current_question_index: number
  start_time: number
  elapsed_time: number
  is_paused: boolean
  is_completed: boolean
}

export interface QuizSession {
  id: string
  chapter_id: number
  config: QuizConfig
  state: QuizState
  created_at: string
  updated_at: string
}

export interface QuestionPaletteItem {
  question_number: number
  question_index: number
  status: 'unanswered' | 'answered' | 'marked' | 'not_visited'
  is_current: boolean
}
