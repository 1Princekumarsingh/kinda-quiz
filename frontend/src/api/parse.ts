import axios from '@/lib/axios'
import { ParseResponse, ParseTextRequest } from '@/types/parse'

export const parseApi = {
  // Parse questions from text
  parseText: async (data: ParseTextRequest): Promise<ParseResponse> => {
    const response = await axios.post<ParseResponse>('/parse/text', data)
    return response.data
  },

  // Parse questions from DOCX file
  parseDocx: async (file: File): Promise<ParseResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axios.post<ParseResponse>('/parse/docx', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}
