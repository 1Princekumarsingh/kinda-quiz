export interface Chapter {
  id: number
  name: string
  subject_id: number
  created_at: string
  updated_at: string | null
  question_count: number
  completed_count: number
  remaining_count: number
  accuracy: number
  review_count: number
  error_count: number
  almost_forgot_count: number
}

export interface ChapterCreate {
  name: string
  subject_id: number
}

export interface ChapterUpdate {
  name: string
}

export interface ChapterListResponse {
  data: Chapter[]
  total: number
  message: string
}

export interface ApiError {
  detail: string | { field: string; message: string }[]
}
