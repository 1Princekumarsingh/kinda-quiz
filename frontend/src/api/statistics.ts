import api from '@/lib/axios'

export interface DashboardStats {
  overall_accuracy: number
  total_questions: number
  completed_questions: number
  review_questions: number
  errors: number
  last_chapter_id?: number
  last_subject_id?: number
  last_chapter_name?: string
}

export interface ChapterStats {
  accuracy: number
  completed_questions: number
  remaining_questions: number
  review_count: number
  error_count: number
  almost_forgot_count: number
}

export const statisticsApi = {
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await api.get('/statistics/dashboard')
    return response.data
  },
  getChapter: async (chapterId: number): Promise<ChapterStats> => {
    const response = await api.get(`/statistics/chapters/${chapterId}`)
    return response.data
  }
}
