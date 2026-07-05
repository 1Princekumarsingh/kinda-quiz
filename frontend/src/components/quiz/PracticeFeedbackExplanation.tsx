interface PracticeFeedbackExplanationProps {
  visible: boolean
  explanation: string | null | undefined
}

export default function PracticeFeedbackExplanation({ visible, explanation }: PracticeFeedbackExplanationProps) {
  if (!visible || !explanation) {
    return null
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-violet-200 bg-violet-50/70">
      <div className="flex items-center gap-2 bg-violet-100/80 px-4 py-3 text-sm font-semibold text-violet-800">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 3a1 1 0 011-1h.5a1 1 0 011 1v4a1 1 0 01-1 1h-.5a1 1 0 01-1-1v-4z" clipRule="evenodd" />
        </svg>
        <span>Explanation</span>
      </div>
      <div className="p-4 text-sm leading-6 text-violet-900 whitespace-pre-wrap">
        {explanation}
      </div>
    </div>
  )
}
