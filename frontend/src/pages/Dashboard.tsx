import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { statisticsApi } from '@/api/statistics'
import { Link } from 'react-router-dom'
import { PhoneFrame } from '@/components/layout'
import { Container } from '@/components/layout/Container'
import StatCard from '@/components/dashboard/StatCard'

export default function Dashboard() {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => statisticsApi.getDashboard()
  })

  const completionRate = stats && stats.total_questions > 0
    ? Math.round((stats.completed_questions / stats.total_questions) * 100)
    : 0

  const accuracyAccent = stats && stats.overall_accuracy >= 80 ? 'success' : stats && stats.overall_accuracy >= 60 ? 'warning' : 'error'

  return (
    <Container size="xl" className="py-1">
      <PhoneFrame>
        <div className="space-y-6 animate-fade-in">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.username}!</p>
        </header>

        {isLoading ? (
          <div className="flex animate-fade-in justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {stats?.last_chapter_id && (
              <section className="flex flex-col items-start justify-between rounded-2xl border border-primary-200 bg-primary-50 p-6 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-primary-900">Continue Practicing</h2>
                  <p className="mt-1 text-sm text-primary-700">
                    Resume your last active session in <span className="font-semibold">{stats.last_chapter_name}</span>
                  </p>
                </div>
                <Link
                  to={`/quiz/${stats.last_chapter_id}`}
                  className="mt-4 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 md:mt-0"
                >
                  Continue Chapter
                </Link>
              </section>
            )}

            <section aria-label="Dashboard statistics" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Overall Accuracy"
                value={stats ? Number(stats.overall_accuracy.toFixed(1)) : 0}
                suffix="%"
                subtitle="Your mastery trend across completed questions"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                accent={accuracyAccent}
                progress={stats?.overall_accuracy ?? 0}
                progressLabel="Accuracy"
                trend={{ direction: stats && stats.overall_accuracy >= 70 ? 'up' : 'steady', label: 'Consistent performance' }}
                tooltip="Overall accuracy based on completed questions"
                precision={1}
              />

              <StatCard
                title="Total Questions"
                value={stats?.total_questions ?? 0}
                subtitle="Questions available in your library"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586L17 6.414A1 1 0 0117.586 7H19a2 2 0 012 2v10a2 2 0 01-2 2z" /></svg>}
                accent="info"
                progress={Math.min(100, ((stats?.total_questions ?? 0) / Math.max(1, stats?.total_questions ?? 1)) * 100)}
                progressLabel="Library coverage"
                trend={{ direction: 'steady', label: 'Tracked in your study set' }}
                tooltip="Total questions across your chapters"
              />

              <StatCard
                title="Completed"
                value={stats?.completed_questions ?? 0}
                subtitle="Questions you have already worked through"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                accent="success"
                progress={completionRate}
                progressLabel="Completion"
                trend={{ direction: completionRate >= 50 ? 'up' : 'steady', label: 'Progress toward mastery' }}
                tooltip="Completed questions compared with the total"
              />

              <StatCard
                title="Review / Errors"
                value={`${stats?.review_questions ?? 0} / ${stats?.errors ?? 0}`}
                subtitle="Questions needing attention"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.7 18.5A2.5 2.5 0 018.2 17h7.6a2.5 2.5 0 012.5 2.5v.5H5.7v-.5zM8 5h8l1 2H7l1-2z" /></svg>}
                accent="warning"
                progress={stats && stats.total_questions > 0 ? Math.min(100, (((stats.review_questions + stats.errors) / stats.total_questions) * 100)) : 0}
                progressLabel="Needs review"
                trend={{ direction: 'down', label: 'Focus on weak spots' }}
                tooltip="Review and error counts"
              />
            </section>
          </>
        )}
        </div>
      </PhoneFrame>
    </Container>
  )
}
