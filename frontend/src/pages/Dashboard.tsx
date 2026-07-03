import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { statisticsApi } from '@/api/statistics'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => statisticsApi.getDashboard()
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.username}!</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Continue Chapter Shortcut */}
          {stats?.last_chapter_id && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 className="font-semibold text-primary-900 text-lg">Continue Practicing</h3>
                <p className="text-primary-700 text-sm mt-1">
                  Resume your last active session in: <span className="font-semibold">{stats.last_chapter_name}</span>
                </p>
              </div>
              <Link
                to={`/quiz/${stats.last_chapter_id}`}
                className="mt-4 md:mt-0 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm shadow-sm"
              >
                Continue Chapter
              </Link>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Overall Accuracy</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats ? `${stats.overall_accuracy.toFixed(1)}%` : '-%'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Total Questions</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.total_questions ?? 0}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Completed Questions</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.completed_questions ?? 0}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-600">Review Questions</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.review_questions ?? 0}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-red-500 border-l-4">
              <div className="text-sm font-medium text-red-600">Errors</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.errors ?? 0}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
