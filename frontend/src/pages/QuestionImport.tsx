import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { parseApi } from '@/api/parse'
import { questionsApi } from '@/api/questions'
import Button from '@/components/common/Button'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Input from '@/components/common/Input'
import ImportExplanationBlock from '@/components/import/ImportExplanationBlock'
import ImportFormatGuide from '@/components/import/ImportFormatGuide'
import { useToast } from '@/contexts/ToastContext'
import { ParsedQuestion } from '@/types/parse'
import { QuestionBase } from '@/types/question'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string
    }
  }
  message?: string
}

export default function QuestionImport() {
  const navigate = useNavigate()
  const { subjectId, chapterId } = useParams()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<'text' | 'docx'>('text')
  const [textInput, setTextInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parseResult, setParseResult] = useState<{
    total_questions: number
    valid_questions: number
    invalid_questions: number
    questions: ParsedQuestion[]
  } | null>(null)
  const [editingQuestions, setEditingQuestions] = useState<ParsedQuestion[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'valid' | 'invalid'>('all')
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 250)
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({})
  const [saveProgress, setSaveProgress] = useState<{
    show: boolean
    current: number
    total: number
    message: string
  }>({ show: false, current: 0, total: 0, message: '' })
  const [validationNotice, setValidationNotice] = useState<{ type: 'error' | 'info'; message: string } | null>(null)
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null)

  // Parse text mutation
  const parseTextMutation = useMutation({
    mutationFn: (text: string) => parseApi.parseText({ text }),
    onSuccess: (data) => {
      setParseResult(data)
      setEditingQuestions(data.questions)
      setValidationNotice(null)
      addToast({
        title: 'Questions parsed',
        message: `Found ${data.questions.length} questions ready for review.`,
        variant: 'info',
        duration: 2500,
      })
    }
  })

  // Parse DOCX mutation
  const parseDocxMutation = useMutation({
    mutationFn: (file: File) => parseApi.parseDocx(file),
    onSuccess: (data) => {
      setParseResult(data)
      setEditingQuestions(data.questions)
      setSelectedFile(null)
      setValidationNotice(null)
      addToast({
        title: 'DOCX parsed',
        message: `Found ${data.questions.length} questions ready for review.`,
        variant: 'info',
        duration: 2500,
      })
    }
  })

  // Bulk save mutation
  const bulkSaveMutation = useMutation({
    mutationFn: async (questions: QuestionBase[]) => {
      // Show progress indicator
      setSaveProgress({
        show: true,
        current: 0,
        total: questions.length,
        message: 'Validating questions...'
      })
      
      // Simulate progress for better UX
      setTimeout(() => {
        setSaveProgress(prev => ({ ...prev, message: 'Saving to database...' }))
      }, 300)
      
      return questionsApi.bulkCreate({
        chapter_id: parseInt(chapterId!),
        questions
      })
    },
    onSuccess: (data) => {
      setSaveProgress({
        show: true,
        current: data.saved_count,
        total: data.saved_count,
        message: `Successfully saved ${data.saved_count} question${data.saved_count !== 1 ? 's' : ''}!`
      })
      addToast({
        title: 'Questions saved',
        message: `${data.saved_count} question${data.saved_count !== 1 ? 's' : ''} were added to the chapter.`,
        variant: 'success',
        duration: 3000,
      })
      setTimeout(() => {
        navigate(`/subjects/${subjectId}/chapters/${chapterId}`)
      }, 2000)
    },
    onError: (error: unknown) => {
      const apiError = error as ApiErrorResponse
      setSaveProgress({ show: false, current: 0, total: 0, message: '' })
      const errorMessage = apiError.response?.data?.detail || apiError.message || 'Unknown error occurred'
      setValidationNotice({ type: 'error', message: errorMessage })
      addToast({ title: 'Save failed', message: errorMessage, variant: 'error', duration: 5000 })
    }
  })

  const handleParseText = () => {
    if (!textInput.trim()) {
      setValidationNotice({ type: 'error', message: 'Please enter some text to parse.' })
      return
    }
    setValidationNotice(null)
    parseTextMutation.mutate(textInput)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.docx')) {
        setValidationNotice({ type: 'error', message: 'Please select a DOCX file.' })
        return
      }
      setSelectedFile(file)
      setValidationNotice(null)
    }
  }

  const handleParseDocx = () => {
    if (!selectedFile) {
      setValidationNotice({ type: 'error', message: 'Please select a file before parsing.' })
      return
    }
    setValidationNotice(null)
    parseDocxMutation.mutate(selectedFile)
  }

  const handleReset = () => {
    setTextInput('')
    setSelectedFile(null)
    setParseResult(null)
    setEditingQuestions([])
    setSearchQuery('')
    setFilterMode('all')
    setValidationNotice(null)
  }

  const handleQuestionEdit = (index: number, field: string, value: string) => {
    const updated = [...editingQuestions]
    updated[index] = { ...updated[index], [field]: value }
    setEditingQuestions(updated)
  }

  const handleDeleteQuestion = (index: number) => {
    setPendingDeleteIndex(index)
  }

  const confirmDeleteQuestion = () => {
    if (pendingDeleteIndex === null) return

    const index = pendingDeleteIndex
    const deletedQuestion = editingQuestions[index]
    const updated = editingQuestions.filter((_, i) => i !== index)
    setEditingQuestions(updated)
    setPendingDeleteIndex(null)

    if (parseResult) {
      setParseResult({
        ...parseResult,
        total_questions: parseResult.total_questions - 1,
        valid_questions: deletedQuestion.is_valid ? parseResult.valid_questions - 1 : parseResult.valid_questions,
        invalid_questions: deletedQuestion.is_valid ? parseResult.invalid_questions : parseResult.invalid_questions - 1,
        questions: updated
      })
    }

    addToast({
      title: 'Question removed',
      message: `Question ${deletedQuestion?.number || index + 1} was removed from the review list.`,
      variant: 'warning',
      duration: 2500,
    })
  }

  const toggleQuestionExpanded = (questionNumber: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionNumber]: !prev[questionNumber]
    }))
  }

  const handleSaveQuestions = (saveOnlyValid: boolean) => {
    const questionsToSave = saveOnlyValid
      ? editingQuestions.filter(q => q.is_valid)
      : editingQuestions

    if (questionsToSave.length === 0) {
      setValidationNotice({ type: 'error', message: 'There are no questions available to save.' })
      return
    }

    // Client-side validation before sending
    const invalidQuestions = questionsToSave.filter(q => 
      !q.question_text.trim() ||
      !q.option_a.trim() ||
      !q.option_b.trim() ||
      !q.option_c.trim() ||
      !q.option_d.trim() ||
      !['A', 'B', 'C', 'D'].includes(q.correct_answer.toUpperCase())
    )

    if (invalidQuestions.length > 0) {
      setValidationNotice({
        type: 'error',
        message: `${invalidQuestions.length} question${invalidQuestions.length > 1 ? 's' : ''} still have validation issues. Fix them or save only valid questions.`,
      })
      return
    }

    // Check for duplicate question numbers
    const numbers = questionsToSave.map(q => q.number)
    const duplicates = numbers.filter((n, idx) => numbers.indexOf(n) !== idx)
    if (duplicates.length > 0) {
      setValidationNotice({
        type: 'error',
        message: `Duplicate question numbers detected: ${[...new Set(duplicates)].join(', ')}. Each question needs a unique number.`,
      })
      return
    }

    // Confirm if saving questions with errors
    if (!saveOnlyValid && editingQuestions.some(q => !q.is_valid)) {
      setValidationNotice({
        type: 'info',
        message: `Saving ${questionsToSave.length} questions, including ${questionsToSave.filter(q => !q.is_valid).length} items that need review.`,
      })
    }

    const formatted: QuestionBase[] = questionsToSave.map(q => ({
      question_number: q.number,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation ?? null
    }))

    setValidationNotice(null)
    bulkSaveMutation.mutate(formatted)
  }

  const filteredQuestions = useMemo(() => editingQuestions.filter(q => {
    if (filterMode === 'valid' && !q.is_valid) return false
    if (filterMode === 'invalid' && q.is_valid) return false

    if (debouncedSearchQuery) {
      const searchLower = debouncedSearchQuery.toLowerCase()
      return (
        q.question_text.toLowerCase().includes(searchLower) ||
        q.option_a.toLowerCase().includes(searchLower) ||
        q.option_b.toLowerCase().includes(searchLower) ||
        q.option_c.toLowerCase().includes(searchLower) ||
        q.option_d.toLowerCase().includes(searchLower)
      )
    }

    return true
  }), [debouncedSearchQuery, editingQuestions, filterMode])

  const isLoading = parseTextMutation.isPending || parseDocxMutation.isPending || bulkSaveMutation.isPending

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import Questions</h1>
          <p className="text-gray-600 mt-1">
            Parse questions from text or DOCX files
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          Back
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {validationNotice && (
          <div className={`rounded-t-xl border-b px-4 py-3 text-sm ${validationNotice.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-sky-200 bg-sky-50 text-sky-700'}`} role={validationNotice.type === 'error' ? 'alert' : 'status'}>
            {validationNotice.message}
          </div>
        )}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'text'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Paste Text
            </button>
            <button
              onClick={() => setActiveTab('docx')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'docx'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upload DOCX
            </button>
          </nav>
        </div>

        {/* Text Input Tab */}
        {activeTab === 'text' && (
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="question-import-text" className="block text-sm font-medium text-gray-700 mb-2">
                Paste your questions here (in standardized format)
              </label>
              <textarea
                id="question-import-text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Question 1\nWhat is the time complexity of binary search?\nA. O(n)\nB. O(log n)\nC. O(n²)\nD. O(1)\nAnswer: B\n\nQuestion 2\n...`}
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={handleReset} disabled={isLoading}>
                Clear
              </Button>
              <Button variant="primary" onClick={handleParseText} disabled={isLoading || !textInput.trim()}>
                {isLoading ? 'Parsing...' : 'Parse Questions'}
              </Button>
            </div>
          </div>
        )}

        {/* DOCX Upload Tab */}
        {activeTab === 'docx' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload DOCX file containing questions
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div className="space-y-2">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors"
                  >
                    <span>Choose file</span>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".docx"
                      onChange={handleFileSelect}
                      disabled={isLoading}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-sm text-gray-500">or drag and drop</p>
                  <p className="text-xs text-gray-500">DOCX files only (max 10MB)</p>
                </div>
                {selectedFile && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={handleReset} disabled={isLoading}>
                Clear
              </Button>
              <Button variant="primary" onClick={handleParseDocx} disabled={isLoading || !selectedFile}>
                {isLoading ? 'Parsing...' : 'Parse DOCX'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Parse Results */}
      {parseResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-900">
                {editingQuestions.length}
              </div>
              <div className="text-sm text-blue-700">Total Questions</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-900">
                {editingQuestions.filter(q => q.is_valid).length}
              </div>
              <div className="text-sm text-green-700">Valid Questions</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-900">
                {editingQuestions.filter(q => !q.is_valid).length}
              </div>
              <div className="text-sm text-red-700">Invalid Questions</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant={filterMode === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilterMode('all')}>
                All ({editingQuestions.length})
              </Button>
              <Button variant={filterMode === 'valid' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilterMode('valid')}>
                Valid ({editingQuestions.filter(q => q.is_valid).length})
              </Button>
              <Button variant={filterMode === 'invalid' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilterMode('invalid')}>
                Invalid ({editingQuestions.filter(q => !q.is_valid).length})
              </Button>
            </div>
          </div>

          {/* Questions List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {filteredQuestions.length === editingQuestions.length
                ? `${editingQuestions.length} Questions`
                : `${filteredQuestions.length} of ${editingQuestions.length} Questions`}
            </h3>
            <div className="space-y-4 max-h-[50vh] md:max-h-[60vh] overflow-y-auto pr-1">
              {filteredQuestions.map((question, index) => {
                const originalIndex = editingQuestions.findIndex((q) => q.number === question.number)
                const isExpanded = expandedQuestions[question.number] ?? false

                return (
                  <div
                    key={question.number}
                    className={`rounded-2xl border p-4 shadow-sm transition-all sm:p-5 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'
                    } ${question.is_valid ? 'border-emerald-200' : 'border-rose-200'}`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${question.is_valid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {question.number}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-slate-900">Question {question.number}</h4>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${question.is_valid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {question.is_valid ? 'Valid' : 'Needs review'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">
                            {question.question_text.trim() || 'No question text yet'}
                          </p>
                          {question.explanation && (
                            <div className="mt-3">
                              <ImportExplanationBlock explanation={question.explanation} />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start">
                        <button
                          type="button"
                          onClick={() => toggleQuestionExpanded(question.number)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-primary-300 hover:text-primary-600"
                        >
                          {isExpanded ? 'Collapse' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(originalIndex)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-4 border-t border-slate-200/80 pt-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                            Question Text
                          </label>
                          <textarea
                            value={question.question_text}
                            onChange={(e) => handleQuestionEdit(originalIndex, 'question_text', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                              Option A
                            </label>
                            <input
                              type="text"
                              value={question.option_a}
                              onChange={(e) => handleQuestionEdit(originalIndex, 'option_a', e.target.value)}
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                              Option B
                            </label>
                            <input
                              type="text"
                              value={question.option_b}
                              onChange={(e) => handleQuestionEdit(originalIndex, 'option_b', e.target.value)}
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                              Option C
                            </label>
                            <input
                              type="text"
                              value={question.option_c}
                              onChange={(e) => handleQuestionEdit(originalIndex, 'option_c', e.target.value)}
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                              Option D
                            </label>
                            <input
                              type="text"
                              value={question.option_d}
                              onChange={(e) => handleQuestionEdit(originalIndex, 'option_d', e.target.value)}
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                            Correct Answer
                          </label>
                          <select
                            value={question.correct_answer}
                            onChange={(e) => handleQuestionEdit(originalIndex, 'correct_answer', e.target.value)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>

                        {question.errors.length > 0 && (
                          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3">
                            <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">Validation issues</div>
                            <div className="mt-2 space-y-1">
                              {question.errors.map((error, i) => (
                                <div key={i} className="flex items-start text-sm text-rose-700">
                                  <svg className="mr-1 mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  <span>{error.message}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <ImportExplanationBlock explanation={question.explanation} />

                        {question.warnings.length > 0 && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                            <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Notes</div>
                            <div className="mt-2 space-y-1">
                              {question.warnings.map((warning, i) => (
                                <div key={i} className="flex items-start text-sm text-amber-700">
                                  <svg className="mr-1 mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  <span>{warning.message}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="secondary" onClick={handleReset} disabled={isLoading}>
              Parse New Questions
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" onClick={() => handleSaveQuestions(true)} disabled={isLoading || editingQuestions.filter(q => q.is_valid).length === 0}>
                {isLoading ? 'Saving...' : `Save ${editingQuestions.filter(q => q.is_valid).length} Valid`}
              </Button>
              <Button variant="primary" onClick={() => handleSaveQuestions(false)} disabled={isLoading || editingQuestions.length === 0}>
                {isLoading ? 'Saving...' : `Save All ${editingQuestions.length}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Format Guide */}
      <ImportFormatGuide />

      <ConfirmDialog
        isOpen={pendingDeleteIndex !== null}
        onClose={() => setPendingDeleteIndex(null)}
        onConfirm={confirmDeleteQuestion}
        title="Delete question"
        message={`Delete question ${editingQuestions[pendingDeleteIndex ?? 0]?.number || ''}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Progress Indicator Modal */}
      {saveProgress.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Progress Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
                {saveProgress.current === saveProgress.total && saveProgress.total > 0 ? (
                  // Success icon
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  // Loading spinner
                  <svg className="animate-spin h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </div>

              {/* Progress Message */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {saveProgress.message}
              </h3>

              {/* Progress Bar */}
              {saveProgress.total > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{saveProgress.current} / {saveProgress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${(saveProgress.current / saveProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Success message */}
              {saveProgress.current === saveProgress.total && saveProgress.total > 0 && (
                <p className="mt-4 text-sm text-gray-600">
                  Redirecting to chapter page...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
