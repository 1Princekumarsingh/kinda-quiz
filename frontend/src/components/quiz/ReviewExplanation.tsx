interface ReviewExplanationProps {
  explanation: string | null | undefined
}

export default function ReviewExplanation({ explanation }: ReviewExplanationProps) {
  if (!explanation) {
    return null
  }

  return (
    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 3a1 1 0 011-1h.5a1 1 0 011 1v4a1 1 0 01-1 1h-.5a1 1 0 01-1-1v-4z" clipRule="evenodd" />
        </svg>
        <span>Explanation</span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-blue-900">{explanation}</p>
    </div>
  )
}
