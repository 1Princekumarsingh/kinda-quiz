import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { parseApi } from '@/api/parse'
import { questionsApi } from '@/api/questions'
import { ParsedQuestion } from '@/types/parse'
import { QuestionBase } from '@/types/question'

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
  const [saveProgress, setSaveProgress] = useState<{
    show: boolean
    current: number
    total: number
    message: string
  }>({ show: false, current: 0, total: 0, message: '' })

  // Parse text mutation
  const parseTextMutation = useMutation({
    mutationFn: (text: string) => parseApi.parseText({ text }),
    onSuccess: (data) => {
      setParseResult(data)
      setEditingQuestions(data.questions)
    }
  })

  // Parse DOCX mutation
  const parseDocxMutation = useMutation({
    mutationFn: (file: File) => parseApi.parseDocx(file),
    onSuccess: (data) => {
      setParseResult(data)
      setEditingQuestions(data.questions)
      setSelectedFile(null)
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
      
      // Redirect after showing success message
      setTimeout(() => {
        navigate(`/subjects/${subjectId}/chapters/${chapterId}`)
      }, 1500)
    },
    onError: (error: unknown) => {
      const apiError = error as ApiErrorResponse
      setSaveProgress({ show: false, current: 0, total: 0, message: '' })
      
      const errorMessage = apiError.response?.data?.detail || apiError.message || 'Unknown error occurred'
      alert(`Failed to save questions:\n\n${errorMessage}\n\nAll changes have been rolled back. Please fix the errors and try again.`)
    }
  })

  const handleParseText = () => {
    if (!textInput.trim()) {
      alert('Please enter some text to parse')
      return
    }
    parseTextMutation.mutate(textInput)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.docx')) {
        alert('Please select a .docx file')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleParseDocx = () => {
    if (!selectedFile) {
      alert('Please select a file first')
      return
    }
    parseDocxMutation.mutate(selectedFile)
  }

  const handleReset = () => {
    setTextInput('')
    setSelectedFile(null)
    setParseResult(null)
    setEditingQuestions([])
    setSearchQuery('')
    setFilterMode('all')
  }

  const handleQuestionEdit = (index: number, field: string, value: string) => {
    const updated = [...editingQuestions]
    updated[index] = { ...updated[index], [field]: value }
    setEditingQuestions(updated)
  }

  const handleDeleteQuestion = (index: number) => {
    const updated = editingQuestions.filter((_, i) => i !== index)
    setEditingQuestions(updated)
    
    // Update parse result counts
    if (parseResult) {
      const deletedQuestion = editingQuestions[index]
      setParseResult({
        ...parseResult,
        total_questions: parseResult.total_questions - 1,
        valid_questions: deletedQuestion.is_valid ? parseResult.valid_questions - 1 : parseResult.valid_questions,
        invalid_questions: deletedQuestion.is_valid ? parseResult.invalid_questions : parseResult.invalid_questions - 1,
        questions: updated
      })
    }
  }

  const handleSaveQuestions = (saveOnlyValid: boolean) => {
    const questionsToSave = saveOnlyValid
      ? editingQuestions.filter(q => q.is_valid)
      : editingQuestions

    if (questionsToSave.length === 0) {
      alert('No questions to save!')
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
      alert(
        `Cannot save: ${invalidQuestions.length} question(s) have validation errors.\n\n` +
        `Please ensure:\n` +
        `• Question text is not empty\n` +
        `• All options (A, B, C, D) are not empty\n` +
        `• Correct answer is A, B, C, or D\n\n` +
        `Fix the errors or save only valid questions.`
      )
      return
    }

    // Check for duplicate question numbers
    const numbers = questionsToSave.map(q => q.number)
    const duplicates = numbers.filter((n, idx) => numbers.indexOf(n) !== idx)
    if (duplicates.length > 0) {
      alert(
        `Cannot save: Duplicate question numbers detected: ${[...new Set(duplicates)].join(', ')}\n\n` +
        `Each question must have a unique number within the chapter.`
      )
      return
    }

    // Confirm if saving questions with errors
    if (!saveOnlyValid && editingQuestions.some(q => !q.is_valid)) {
      const confirmSave = window.confirm(
        `Warning: You are about to save ${questionsToSave.length} questions, including ${questionsToSave.filter(q => !q.is_valid).length} with parsing errors.\n\n` +
        `These questions may have issues. Continue anyway?`
      )
      if (!confirmSave) return
    }

    const formatted: QuestionBase[] = questionsToSave.map(q => ({
      question_number: q.number,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer
    }))

    bulkSaveMutation.mutate(formatted)
  }

  // Filter questions based on search and filter mode
  const filteredQuestions = editingQuestions.filter(q => {
    // Apply filter mode
    if (filterMode === 'valid' && !q.is_valid) return false
    if (filterMode === 'invalid' && q.is_valid) return false
    
    // Apply search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      return (
        q.question_text.toLowerCase().includes(searchLower) ||
        q.option_a.toLowerCase().includes(searchLower) ||
        q.option_b.toLowerCase().includes(searchLower) ||
        q.option_c.toLowerCase().includes(searchLower) ||
        q.option_d.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })

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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste your questions here (in standardized format)
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Question 1\nWhat is the time complexity of binary search?\nA. O(n)\nB. O(log n)\nC. O(n²)\nD. O(1)\nAnswer: B\n\nQuestion 2\n...`}
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                onClick={handleParseText}
                disabled={isLoading || !textInput.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Parsing...' : 'Parse Questions'}
              </button>
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
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                onClick={handleParseDocx}
                disabled={isLoading || !selectedFile}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Parsing...' : 'Parse DOCX'}
              </button>
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterMode === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({editingQuestions.length})
              </button>
              <button
                onClick={() => setFilterMode('valid')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterMode === 'valid'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Valid ({editingQuestions.filter(q => q.is_valid).length})
              </button>
              <button
                onClick={() => setFilterMode('invalid')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterMode === 'invalid'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Invalid ({editingQuestions.filter(q => !q.is_valid).length})
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {filteredQuestions.length === editingQuestions.length
                ? `${editingQuestions.length} Questions`
                : `${filteredQuestions.length} of ${editingQuestions.length} Questions`}
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredQuestions.map((question) => {
                const originalIndex = editingQuestions.findIndex(q => q.number === question.number)
                return (
                  <div
                    key={originalIndex}
                    className={`border rounded-lg p-4 ${
                      question.is_valid
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-gray-900">
                        Question {question.number}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            question.is_valid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {question.is_valid ? 'Valid' : 'Invalid'}
                        </span>
                        <button
                          onClick={() => handleDeleteQuestion(originalIndex)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete question"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Question Text
                      </label>
                      <textarea
                        value={question.question_text}
                        onChange={(e) => handleQuestionEdit(originalIndex, 'question_text', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                        rows={2}
                      />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Option A
                        </label>
                        <input
                          type="text"
                          value={question.option_a}
                          onChange={(e) => handleQuestionEdit(originalIndex, 'option_a', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Option B
                        </label>
                        <input
                          type="text"
                          value={question.option_b}
                          onChange={(e) => handleQuestionEdit(originalIndex, 'option_b', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Option C
                        </label>
                        <input
                          type="text"
                          value={question.option_c}
                          onChange={(e) => handleQuestionEdit(originalIndex, 'option_c', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Option D
                        </label>
                        <input
                          type="text"
                          value={question.option_d}
                          onChange={(e) => handleQuestionEdit(originalIndex, 'option_d', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Correct Answer
                      </label>
                      <select
                        value={question.correct_answer}
                        onChange={(e) => handleQuestionEdit(originalIndex, 'correct_answer', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 font-semibold"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>

                    {/* Errors */}
                    {question.errors.length > 0 && (
                      <div className="space-y-1">
                        {question.errors.map((error, i) => (
                          <div key={i} className="flex items-start text-sm text-red-700">
                            <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error.message}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Warnings */}
                    {question.warnings.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {question.warnings.map((warning, i) => (
                          <div key={i} className="flex items-start text-sm text-yellow-700">
                            <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{warning.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Parse New Questions
            </button>
            <div className="space-x-3">
              <button
                onClick={() => handleSaveQuestions(true)}
                disabled={isLoading || editingQuestions.filter(q => q.is_valid).length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : `Save ${editingQuestions.filter(q => q.is_valid).length} Valid`}
              </button>
              <button
                onClick={() => handleSaveQuestions(false)}
                disabled={isLoading || editingQuestions.length === 0}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : `Save All ${editingQuestions.length}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Format Guide */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Standardized Format Guide</h3>
        <div className="bg-white rounded p-4 font-mono text-sm text-gray-900 space-y-2">
          <div>Question 1</div>
          <div>What is the time complexity of binary search?</div>
          <div>A. O(n)</div>
          <div>B. O(log n)</div>
          <div>C. O(n²)</div>
          <div>D. O(1)</div>
          <div>Answer: B</div>
          <div className="pt-2">&nbsp;</div>
          <div>Question 2</div>
          <div>...</div>
        </div>
        <ul className="mt-4 space-y-1 text-sm text-blue-800">
          <li>• Each question must have a number (Question 1, Question 2, etc.)</li>
          <li>• Four options labeled A, B, C, D</li>
          <li>• One correct answer (Answer: A, B, C, or D)</li>
          <li>• Separate questions with blank lines</li>
        </ul>
      </div>

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
