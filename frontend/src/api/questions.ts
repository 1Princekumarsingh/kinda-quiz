import api from '@/lib/axios'
import {
  QuestionBulkCreate,
  QuestionUpdate,
  QuestionResponse,
  QuestionListResponse,
  BulkSaveResponse,
  QuestionStatusUpdate,
  StatusUpdateResponse,
  QuestionBulkStatusUpdate,
  BulkStatusUpdateResponse
} from '@/types/question'

export const questionsApi = {
  // Bulk create questions
  bulkCreate: async (data: QuestionBulkCreate): Promise<BulkSaveResponse> => {
    const response = await api.post('/questions/bulk', data)
    return response.data
  },

  // Get questions for a chapter
  list: async (params: {
    chapter_id: number
    page?: number
    page_size?: number
    search?: string
    range_start?: number
    range_end?: number
  }): Promise<QuestionListResponse> => {
    const response = await api.get('/questions', { params })
    return response.data
  },

  // Get single question
  get: async (questionId: number): Promise<QuestionResponse> => {
    const response = await api.get(`/questions/${questionId}`)
    return response.data
  },

  // Update question
  update: async (questionId: number, data: QuestionUpdate): Promise<QuestionResponse> => {
    const response = await api.put(`/questions/${questionId}`, data)
    return response.data
  },

  // Delete question
  delete: async (questionId: number): Promise<void> => {
    await api.delete(`/questions/${questionId}`)
  },

  // Update question status
  updateStatus: async (questionId: number, data: QuestionStatusUpdate): Promise<StatusUpdateResponse> => {
    const response = await api.patch(`/questions/${questionId}/status`, data)
    return response.data
  },

  // Bulk update question statuses
  bulkUpdateStatus: async (data: QuestionBulkStatusUpdate): Promise<BulkStatusUpdateResponse> => {
    const response = await api.patch('/questions/status/bulk', data)
    return response.data
  }
}
