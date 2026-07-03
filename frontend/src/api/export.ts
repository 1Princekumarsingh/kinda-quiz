import axiosInstance from '@/lib/axios'
import axios from 'axios'

export type ExportFormat = 'csv' | 'json' | 'docx'
export type ExportType = 'all' | 'review' | 'almost_forgot' | 'errors'

interface ExportOptions {
  chapterId: number
  format: ExportFormat
  type: ExportType
}

const readErrorDetail = async (data: unknown): Promise<string | undefined> => {
  if (!data) return undefined

  if (data instanceof Blob) {
    const text = await data.text()
    if (!text) return undefined

    try {
      const parsed = JSON.parse(text)
      return typeof parsed.detail === 'string' ? parsed.detail : undefined
    } catch {
      return text
    }
  }

  if (typeof data === 'object' && 'detail' in data) {
    const detail = (data as { detail?: unknown }).detail
    return typeof detail === 'string' ? detail : undefined
  }

  return undefined
}

/**
 * Export questions from a chapter
 * Downloads the file directly to user's browser
 */
export const exportQuestions = async ({ chapterId, format, type }: ExportOptions): Promise<void> => {
  try {
    const response = await axiosInstance.get(
      `/export/${chapterId}`,
      {
        params: { format, type },
        responseType: 'blob', // Important for file download
      }
    )

    // Create blob from response
    const contentType = response.headers['content-type'] as string | undefined
    const blob = new Blob([response.data], {
      type: contentType || 'application/octet-stream',
    })

    // Extract filename from Content-Disposition header or create default
    const contentDisposition = response.headers['content-disposition'] as string | undefined
    let filename = `chapter_${chapterId}_${type}_export.${format}`
    
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '')
      }
    }

    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const detail = await readErrorDetail(error.response?.data)
      if (error.response?.status === 404) {
        throw new Error(detail || 'Chapter not found')
      }
      if (error.response?.status === 400) {
        throw new Error(detail || 'Invalid export parameters')
      }
      throw new Error(detail || 'Failed to export questions')
    }
    throw error
  }
}

export const exportApi = {
  exportQuestions,
}
