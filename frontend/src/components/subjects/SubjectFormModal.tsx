import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import Input from '@/components/common/Input'
import { Subject } from '@/types/subject'

interface ApiValidationError {
  msg?: string
  message?: string
}

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string | ApiValidationError[]
    }
  }
}

interface SubjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
  subject?: Subject | null
  mode: 'create' | 'edit'
}

export default function SubjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  subject,
  mode
}: SubjectFormModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(subject?.name || '')
      setError('')
      setIsSubmitting(false)
    }
  }, [isOpen, subject])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedName = name.trim()
    
    if (!trimmedName) {
      setError('Subject name is required')
      return
    }

    if (trimmedName.length > 200) {
      setError('Subject name must be 200 characters or less')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit(trimmedName)
      onClose()
    } catch (err: unknown) {
      const apiError = err as ApiErrorResponse
      const detail = apiError.response?.data?.detail
      if (detail) {
        if (typeof detail === 'string') {
          setError(detail)
        } else if (Array.isArray(detail)) {
          setError(detail.map((e) => e.msg || e.message).join(', '))
        }
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Subject' : 'Edit Subject'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 lg:mx-auto lg:max-w-[600px]">
        <div className="grid gap-4 lg:grid-cols-1">
          <Input
            label="Subject Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Data Structures & Algorithms"
            error={error}
            required
            autoFocus
            disabled={isSubmitting}
            maxLength={200}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 md:gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Subject' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
