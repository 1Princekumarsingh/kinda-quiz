export interface Subject {
  id: number
  name: string
  user_id: number
  created_at: string
  updated_at: string | null
  chapter_count?: number
  question_count?: number
}

export interface SubjectCreate {
  name: string
}

export interface SubjectUpdate {
  name: string
}

export interface SubjectListResponse {
  data: Subject[]
  total: number
  message: string
}

export interface ApiError {
  detail: string | { field: string; message: string }[]
}
