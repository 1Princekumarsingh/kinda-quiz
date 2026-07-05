import { useQuery } from '@tanstack/react-query'
import { quizAttemptsApi } from '@/api/quiz-attempts'
import { PhoneFrame } from '@/components/layout'
import { Container } from '@/components/layout/Container'

const sortOptions = [
  { key: 'quiz_date', label: 'Date' },
  { key: 'chapter_name', label: 'Chapter' },
  { key: 'accuracy', label: 'Accuracy' },
] as const

export default function History() {
  const { data, isLoading } = useQuery({
    queryKey: ['quiz-attempts'],
    queryFn: () => quizAttemptsApi.list()
  })

  const formatTime = (seconds: number): string => {
    if (seconds < 0) return '00:00'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Container size="xl" className="py-1">
      <PhoneFrame>
        <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">Attempt History</h1>
          <p className="text-sm text-gray-600 lg:text-base">Review your recent quiz sessions and outcomes.</p>
        </header>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : !data || data.total === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No quiz attempts yet. Start practicing to see your history here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block" data-testid="history-desktop-table">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent sessions</h2>
                <p className="text-sm text-gray-500">Sorted by your most recent activity</p>
              </div>
              <div className="flex items-center gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    aria-label={`Sort by ${option.label}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Chapter
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Mode
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Time Taken
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Correct / Wrong
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Accuracy
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data.data.map((attempt) => (
                    <tr key={attempt.id} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(attempt.quiz_date)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {attempt.chapter_name || `Chapter ${attempt.chapter_id}`}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm capitalize text-gray-500">
                        {attempt.mode}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatTime(attempt.time_taken)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <span className="font-semibold text-green-600">{attempt.correct}</span>
                        {' / '}
                        <span className="font-semibold text-red-600">{attempt.wrong}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                        {attempt.accuracy.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 lg:hidden">
            {data.data.map((attempt) => (
              <div key={attempt.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{attempt.chapter_name || `Chapter ${attempt.chapter_id}`}</div>
                    <div className="mt-1 text-sm text-gray-500">{formatDate(attempt.quiz_date)}</div>
                  </div>
                  <div className="rounded-full bg-gray-50 px-3 py-1 text-sm font-medium text-gray-700 capitalize">
                    {attempt.mode}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <span>{formatTime(attempt.time_taken)}</span>
                  <span>{attempt.correct} / {attempt.wrong}</span>
                </div>
                <div className="mt-3 text-sm font-semibold text-gray-900">Accuracy {attempt.accuracy.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
      </PhoneFrame>
    </Container>
  )
}
