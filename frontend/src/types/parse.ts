export interface ValidationError {
  type: string
  message: string
  line: number | null
}

export interface ParsedQuestion {
  number: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  is_valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

export interface ParseResponse {
  total_questions: number
  valid_questions: number
  invalid_questions: number
  questions: ParsedQuestion[]
}

export interface ParseTextRequest {
  text: string
}
