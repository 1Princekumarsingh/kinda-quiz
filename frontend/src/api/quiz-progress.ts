import api from '@/lib/axios'
import {
  QuizProgress,
  QuizProgressListResponse,
  QuizProgressCreate,
  QuizProgressUpdate
} from '@/types/quiz-progress'

export const quizProgressApi = {
  create: async (data: QuizProgressCreate): Promise<QuizProgress> => {
    const response = await api.post('/quiz-progress', data)
    return response.data
  },

  list: async (chapter_id?: number): Promise<QuizProgressListResponse> => {
    const params = chapter_id ? { chapter_id } : undefined
    const response = await api.get('/quiz-progress', { params })
    return response.data
  },

  get: async (session_key: string): Promise<QuizProgress> => {
    const response = await api.get(`/quiz-progress/${session_key}`)
    return response.data
  },

  update: async (session_key: string, data: QuizProgressUpdate): Promise<QuizProgress> => {
    const response = await api.patch(`/quiz-progress/${session_key}`, data)
    return response.data
  },

  delete: async (session_key: string): Promise<void> => {
    await api.delete(`/quiz-progress/${session_key}`)
  }
}
