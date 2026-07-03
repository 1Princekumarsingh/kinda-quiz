import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chapterApi } from '@/api/chapters'
import { subjectApi } from '@/api/subjects'
import { exportApi, ExportFormat, ExportType } from '@/api/export'
import { quizProgressApi } from '@/api/quiz-progress'
import { Chapter } from '@/types/chapter'
import { QuizProgress } from '@/types/quiz-progress'
import ChapterCard from '@/components/chapters/ChapterCard'
import ChapterFormModal from '@/components/chapters/ChapterFormModal'
import QuizConfigModal, { QuizConfiguration } from '@/components/chapters/QuizConfigModal'
import ExportModal from '@/components/chapters/ExportModal'
import ConfirmDialog from '@/components/common/ConfirmDialog'

export default function Chapters() {
  const navigate = useNavigate()
  const { subjectId } = useParams<{ subjectId: string }>()
  const queryClient = useQueryClient()
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isQuizConfigOpen, setIsQuizConfigOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)

  // Fetch subject details
  const { data: subject } = useQuery({
    queryKey: ['subjects', subjectId],
    queryFn: () => subjectApi.get(Number(subjectId)),
    enabled: !!subjectId
  })

  // Fetch chapters
  const { data: chaptersData, isLoading, error } = useQuery({
    queryKey: ['chapters', subjectId],
    queryFn: () => chapterApi.list(Number(subjectId)),
    enabled: !!subjectId
  })

  const { data: progressData } = useQuery({
    queryKey: ['quizProgress'],
    queryFn: () => quizProgressApi.list(),
    enabled: !!subjectId
  })

  const progressByChapter = useMemo(() => {
    const map = new Map<number, QuizProgress>()
    progressData?.data?.forEach((progress) => {
      const existing = map.get(progress.chapter_id)
      if (!existing || new Date(progress.updated_at) > new Date(existing.updated_at)) {
        map.set(progress.chapter_id, progress)
      }
    })
    return map
  }, [progressData])

  // Create chapter mutation
  const createMutation = useMutation({
    mutationFn: (name: string) => chapterApi.create({ name, subject_id: Number(subjectId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters', subjectId] })
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setIsCreateModalOpen(false)
    }
  })

  // Update chapter mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      chapterApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters', subjectId] })
      setIsEditModalOpen(false)
      setSelectedChapter(null)
    }
  })

  // Delete chapter mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => chapterApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters', subjectId] })
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setIsDeleteDialogOpen(false)
      setSelectedChapter(null)
    }
  })

  const handleCreateChapter = async (name: string) => {
    await createMutation.mutateAsync(name)
  }

  const handleEditChapter = async (name: string) => {
    if (!selectedChapter) return
    await updateMutation.mutateAsync({ id: selectedChapter.id, name })
  }

  const handleDeleteChapter = () => {
    if (!selectedChapter) return
    deleteMutation.mutate(selectedChapter.id)
  }

  const openEditModal = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setIsEditModalOpen(true)
  }

  const openDeleteDialog = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setIsDeleteDialogOpen(true)
  }

  const handleImport = (chapter: Chapter) => {
    navigate(`/subjects/${subjectId}/chapters/${chapter.id}/import`)
  }

  const handleStartQuiz = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setIsQuizConfigOpen(true)
  }

  const handleContinueChapter = (chapter: Chapter, progress?: QuizProgress | null) => {
    if (!progress) {
      handleStartQuiz(chapter)
      return
    }

    if (!progress.state.is_completed) {
      navigate(`/quiz/${chapter.id}?session_key=${encodeURIComponent(progress.session_key)}`)
      return
    }

    handleStartQuiz(chapter)
  }

  const handleQuizConfigSubmit = (config: QuizConfiguration) => {
    if (!selectedChapter) return
    
    // Build query params from configuration
    const params = new URLSearchParams({
      mode: config.mode,
      timer_mode: config.timer_mode,
    })
    
    if (config.timer_value !== undefined) {
      params.append('timer_value', config.timer_value.toString())
    }
    
    if (config.batch_size !== undefined) {
      params.append('batch_size', config.batch_size.toString())
    }
    
    if (config.question_range) {
      params.append('range_start', config.question_range.start.toString())
      params.append('range_end', config.question_range.end.toString())
    }
    
    navigate(`/quiz/${selectedChapter.id}?${params.toString()}`)
    setIsQuizConfigOpen(false)
    setSelectedChapter(null)
  }

  const handleExport = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setIsExportModalOpen(true)
  }

  const handleExportSubmit = async (format: ExportFormat, type: ExportType) => {
    if (!selectedChapter) return

    setIsExporting(true)
    try {
      await exportApi.exportQuestions({
        chapterId: selectedChapter.id,
        format,
        type,
      })
      
      // Close modal on success
      setIsExportModalOpen(false)
      setSelectedChapter(null)
    } catch (error) {
      // Error handling - show user-friendly message
      const errorMessage = error instanceof Error ? error.message : 'Failed to export questions'
      alert(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Chapters</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading chapters. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={() => navigate('/subjects')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Subjects
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{subject?.name || 'Loading...'}</h1>
          {chaptersData && (
            <p className="text-gray-600 mt-1">
              {chaptersData.total} {chaptersData.total === 1 ? 'chapter' : 'chapters'}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Chapter</span>
        </button>
      </div>

      {/* Chapters Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : chaptersData?.data.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters yet</h3>
          <p className="text-gray-500 mb-6">Create your first chapter to start organizing questions.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Create Chapter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chaptersData?.data.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              progress={progressByChapter.get(chapter.id)}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
              onImport={handleImport}
              onStartQuiz={handleStartQuiz}
              onContinueChapter={handleContinueChapter}
              onExport={handleExport}
            />
          ))}
        </div>
      )}

      {/* Create Chapter Modal */}
      <ChapterFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateChapter}
        mode="create"
      />

      {/* Edit Chapter Modal */}
      <ChapterFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedChapter(null)
        }}
        onSubmit={handleEditChapter}
        chapter={selectedChapter}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedChapter(null)
        }}
        onConfirm={handleDeleteChapter}
        title="Delete Chapter"
        message={
          <div>
            <p className="mb-2">
              Are you sure you want to delete <strong>{selectedChapter?.name}</strong>?
            </p>
            <p className="text-sm text-red-600 font-medium">
              This will permanently delete all associated questions and quiz attempts.
            </p>
          </div>
        }
        confirmText="Delete Chapter"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={deleteMutation.isPending}
      />

      {/* Quiz Configuration Modal */}
      <QuizConfigModal
        isOpen={isQuizConfigOpen}
        onClose={() => {
          setIsQuizConfigOpen(false)
          setSelectedChapter(null)
        }}
        onStart={handleQuizConfigSubmit}
        chapterQuestionCount={selectedChapter?.question_count || 0}
        chapterId={selectedChapter?.id || 0}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false)
          setSelectedChapter(null)
        }}
        onExport={handleExportSubmit}
        chapterName={selectedChapter?.name || ''}
        isLoading={isExporting}
        questionCounts={{
          all: selectedChapter?.question_count || 0,
          review: selectedChapter?.review_count || 0,
          almostForgot: selectedChapter?.almost_forgot_count || 0,
          errors: selectedChapter?.error_count || 0,
        }}
      />
    </div>
  )
}
