export interface QuestionBase {
  question_number: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
}

export interface QuestionCreate extends QuestionBase {
  chapter_id: number
}

export interface QuestionBulkCreate {
  chapter_id: number
  questions: QuestionBase[]
}

export interface QuestionUpdate {
  question_text?: string
  option_a?: string
  option_b?: string
  option_c?: string
  option_d?: string
  correct_answer?: string
}

export interface QuestionResponse extends QuestionBase {
  id: number
  chapter_id: number
  status: 'NEW' | 'MASTERED' | 'REVIEW' | 'ALMOST_FORGOT' | 'ERROR'
  times_attempted: number
  times_correct: number
  times_wrong: number
  created_at: string
  updated_at: string | null
}

export interface QuestionListResponse {
  data: QuestionResponse[]
  total: number
  page: number
  page_size: number
  message: string
}

export interface BulkSaveResponse {
  saved_count: number
  failed_count: number
  questions: QuestionResponse[]
  message: string
}

export type QuestionStatus = 'NEW' | 'MASTERED' | 'REVIEW' | 'ALMOST_FORGOT' | 'ERROR'

export interface QuestionStatusUpdate {
  status: QuestionStatus
}

export interface StatusUpdateResponse {
  question_id: number
  status: string
  message: string
}

export interface QuestionBulkStatusUpdate {
  updates: Array<{
    question_id: number
    status: QuestionStatus
  }>
}

export interface BulkStatusUpdateResponse {
  updated_count: number
  failed_count: number
  updates: StatusUpdateResponse[]
  message: string
}
