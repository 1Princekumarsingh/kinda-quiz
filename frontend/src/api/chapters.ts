import axios from '@/lib/axios'
import { Chapter, ChapterCreate, ChapterUpdate, ChapterListResponse } from '@/types/chapter'

export const chapterApi = {
  // Get all chapters for a subject
  list: async (subjectId: number): Promise<ChapterListResponse> => {
    const response = await axios.get<ChapterListResponse>('/chapters', {
      params: { subject_id: subjectId }
    })
    return response.data
  },

  // Get a single chapter by ID
  get: async (id: number): Promise<Chapter> => {
    const response = await axios.get<Chapter>(`/chapters/${id}`)
    return response.data
  },

  // Create a new chapter
  create: async (data: ChapterCreate): Promise<Chapter> => {
    const response = await axios.post<Chapter>('/chapters', data)
    return response.data
  },

  // Update a chapter
  update: async (id: number, data: ChapterUpdate): Promise<Chapter> => {
    const response = await axios.put<Chapter>(`/chapters/${id}`, data)
    return response.data
  },

  // Delete a chapter
  delete: async (id: number): Promise<void> => {
    await axios.delete(`/chapters/${id}`)
  }
}
