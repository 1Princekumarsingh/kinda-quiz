interface ImportExplanationBlockProps {
  explanation: string | null | undefined
}

export default function ImportExplanationBlock({ explanation }: ImportExplanationBlockProps) {
  if (!explanation) {
    return null
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-700">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 3a1 1 0 011-1h.5a1 1 0 011 1v4a1 1 0 01-1 1h-.5a1 1 0 01-1-1v-4z" clipRule="evenodd" />
        </svg>
        <span>Explanation</span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-violet-800">{explanation}</p>
    </div>
  )
}
