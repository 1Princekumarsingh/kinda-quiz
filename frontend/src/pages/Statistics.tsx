import { useQuery } from '@tanstack/react-query'
import { statisticsApi } from '@/api/statistics'

export default function Statistics() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => statisticsApi.getDashboard()
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading statistics. Please try again.</p>
      </div>
    )
  }

  // Calculate total study time estimation or use 0 as placeholder
  // V1 does not have lifetime study duration database recording yet
  const studyHours = 0
  const studyMinutes = 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600">Total Study Time</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{studyHours}h {studyMinutes}m</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600">Questions Solved</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats?.completed_questions ?? 0}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600">Overall Accuracy</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats ? `${stats.overall_accuracy.toFixed(1)}%` : '-%'}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <span className="text-sm text-gray-500 block">Total Questions</span>
            <span className="text-2xl font-bold text-gray-900">{stats?.total_questions ?? 0}</span>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <span className="text-sm text-green-700 block">Completed</span>
            <span className="text-2xl font-bold text-green-950">{stats?.completed_questions ?? 0}</span>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <span className="text-sm text-blue-700 block">In Review</span>
            <span className="text-2xl font-bold text-blue-950">{stats?.review_questions ?? 0}</span>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <span className="text-sm text-red-700 block">Errors</span>
            <span className="text-2xl font-bold text-red-950">{stats?.errors ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
