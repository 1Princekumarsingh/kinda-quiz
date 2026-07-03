import { useState } from 'react'
import Modal from '@/components/common/Modal'
import { ExportFormat, ExportType } from '@/api/export'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: ExportFormat, type: ExportType) => void
  chapterName: string
  isLoading?: boolean
  questionCounts: {
    all: number
    review: number
    almostForgot: number
    errors: number
  }
}

export default function ExportModal({
  isOpen,
  onClose,
  onExport,
  chapterName,
  isLoading = false,
  questionCounts,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
  const [selectedType, setSelectedType] = useState<ExportType>('all')

  const handleExport = () => {
    onExport(selectedFormat, selectedType)
  }

  const formatOptions: Array<{ value: ExportFormat; label: string; description: string }> = [
    {
      value: 'csv',
      label: 'CSV',
      description: 'Spreadsheet format, easy to analyze in Excel or Google Sheets',
    },
    {
      value: 'json',
      label: 'JSON',
      description: 'Complete data with statistics for programmatic use or backup',
    },
    {
      value: 'docx',
      label: 'DOCX',
      description: 'Formatted Word document, ready for printing or review',
    },
  ]

  const typeOptions: Array<{ value: ExportType; label: string; count: number; disabled: boolean }> = [
    {
      value: 'all',
      label: 'Entire Chapter',
      count: questionCounts.all,
      disabled: questionCounts.all === 0,
    },
    {
      value: 'review',
      label: 'Review Questions',
      count: questionCounts.review,
      disabled: questionCounts.review === 0,
    },
    {
      value: 'almost_forgot',
      label: 'Almost Forgot',
      count: questionCounts.almostForgot,
      disabled: questionCounts.almostForgot === 0,
    },
    {
      value: 'errors',
      label: 'Error Questions',
      count: questionCounts.errors,
      disabled: questionCounts.errors === 0,
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Export Questions - ${chapterName}`} maxWidth="lg">
      <div className="space-y-6">
        {/* Export Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Questions to Export
          </label>
          <div className="space-y-2">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => !option.disabled && setSelectedType(option.value)}
                disabled={option.disabled}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  option.disabled
                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                    : selectedType === option.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        option.disabled
                          ? 'border-gray-300'
                          : selectedType === option.value
                          ? 'border-primary-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedType === option.value && !option.disabled && (
                        <div className="w-3 h-3 rounded-full bg-primary-600" />
                      )}
                    </div>
                    <span
                      className={`font-medium ${
                        option.disabled
                          ? 'text-gray-400'
                          : selectedType === option.value
                          ? 'text-primary-900'
                          : 'text-gray-900'
                      }`}
                    >
                      {option.label}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      option.disabled
                        ? 'text-gray-400'
                        : selectedType === option.value
                        ? 'text-primary-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {option.count} {option.count === 1 ? 'question' : 'questions'}
                  </span>
                </div>
              </button>
            ))}
          </div>
          {questionCounts.all === 0 && (
            <p className="mt-3 text-sm text-red-600">
              This chapter has no questions. Import questions first to enable export.
            </p>
          )}
        </div>

        {/* Export Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Export Format</label>
          <div className="space-y-2">
            {formatOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedFormat(option.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedFormat === option.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                      selectedFormat === option.value ? 'border-primary-600' : 'border-gray-300'
                    }`}
                  >
                    {selectedFormat === option.value && (
                      <div className="w-3 h-3 rounded-full bg-primary-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`font-medium ${
                        selectedFormat === option.value ? 'text-primary-900' : 'text-gray-900'
                      }`}
                    >
                      {option.label}
                    </div>
                    <div
                      className={`text-sm mt-1 ${
                        selectedFormat === option.value ? 'text-primary-700' : 'text-gray-600'
                      }`}
                    >
                      {option.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isLoading || questionCounts.all === 0 || typeOptions.find(o => o.value === selectedType)?.disabled}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
