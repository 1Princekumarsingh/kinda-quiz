import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subjectApi } from '@/api/subjects'
import { Subject } from '@/types/subject'
import SubjectCard from '@/components/subjects/SubjectCard'
import SubjectFormModal from '@/components/subjects/SubjectFormModal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { ResponsiveGrid, PhoneFrame } from '@/components/layout'

export default function Subjects() {
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

  // Fetch subjects
  const { data: subjectsData, isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectApi.list
  })

  // Create subject mutation
  const createMutation = useMutation({
    mutationFn: (name: string) => subjectApi.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setIsCreateModalOpen(false)
    }
  })

  // Update subject mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      subjectApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setIsEditModalOpen(false)
      setSelectedSubject(null)
    }
  })

  // Delete subject mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => subjectApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setIsDeleteDialogOpen(false)
      setSelectedSubject(null)
    }
  })

  const handleCreateSubject = async (name: string) => {
    await createMutation.mutateAsync(name)
  }

  const handleEditSubject = async (name: string) => {
    if (!selectedSubject) return
    await updateMutation.mutateAsync({ id: selectedSubject.id, name })
  }

  const handleDeleteSubject = () => {
    if (!selectedSubject) return
    deleteMutation.mutate(selectedSubject.id)
  }

  const openEditModal = (subject: Subject) => {
    setSelectedSubject(subject)
    setIsEditModalOpen(true)
  }

  const openDeleteDialog = (subject: Subject) => {
    setSelectedSubject(subject)
    setIsDeleteDialogOpen(true)
  }

  if (error) {
    return (
      <PhoneFrame>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading subjects. Please try again.</p>
          </div>
        </div>
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame>
      <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
          {subjectsData && (
            <p className="text-gray-600 mt-1">
              {subjectsData.total} {subjectsData.total === 1 ? 'subject' : 'subjects'}
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
          <span>Add Subject</span>
        </button>
      </div>

      {isLoading ? (
        <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md" className="lg:items-stretch">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </ResponsiveGrid>
      ) : subjectsData?.data.length === 0 ? (
        <div className="mx-auto max-w-[768px] rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects yet</h3>
          <p className="text-gray-500 mb-6">Create your first subject to get started organizing your study materials.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Create Subject
          </button>
        </div>
      ) : (
        <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md" className="lg:items-stretch">
          {subjectsData?.data.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
            />
          ))}
        </ResponsiveGrid>
      )}

      {/* Create Subject Modal */}
      <SubjectFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubject}
        mode="create"
      />

      {/* Edit Subject Modal */}
      <SubjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedSubject(null)
        }}
        onSubmit={handleEditSubject}
        subject={selectedSubject}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedSubject(null)
        }}
        onConfirm={handleDeleteSubject}
        title="Delete Subject"
        message={
          <div>
            <p className="mb-2">
              Are you sure you want to delete <strong>{selectedSubject?.name}</strong>?
            </p>
            <p className="text-sm text-red-600 font-medium">
              This will permanently delete all associated chapters and questions.
            </p>
          </div>
        }
        confirmText="Delete Subject"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  </PhoneFrame>
  )
}
