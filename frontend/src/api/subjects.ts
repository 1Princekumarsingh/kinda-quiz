import axios from '@/lib/axios'
import { Subject, SubjectCreate, SubjectUpdate, SubjectListResponse } from '@/types/subject'

export const subjectApi = {
  // Get all subjects for authenticated user
  list: async (): Promise<SubjectListResponse> => {
    const response = await axios.get<SubjectListResponse>('/subjects')
    return response.data
  },

  // Get a single subject by ID
  get: async (id: number): Promise<Subject> => {
    const response = await axios.get<Subject>(`/subjects/${id}`)
    return response.data
  },

  // Create a new subject
  create: async (data: SubjectCreate): Promise<Subject> => {
    const response = await axios.post<Subject>('/subjects', data)
    return response.data
  },

  // Update a subject
  update: async (id: number, data: SubjectUpdate): Promise<Subject> => {
    const response = await axios.put<Subject>(`/subjects/${id}`, data)
    return response.data
  },

  // Delete a subject
  delete: async (id: number): Promise<void> => {
    await axios.delete(`/subjects/${id}`)
  }
}
