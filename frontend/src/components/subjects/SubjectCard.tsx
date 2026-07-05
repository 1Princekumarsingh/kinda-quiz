import { type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/Card'
import ResponsiveMedia from '@/components/common/ResponsiveMedia'
import { Subject } from '@/types/subject'

interface SubjectCardProps {
  subject: Subject
  onEdit: (subject: Subject) => void
  onDelete: (subject: Subject) => void
}

export default function SubjectCard({ subject, onEdit, onDelete }: SubjectCardProps) {
  const navigate = useNavigate()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const progressPercent = Math.min(
    100,
    Math.round(((subject.question_count ?? 0) / Math.max(20, (subject.chapter_count ?? 0) * 5)) * 100)
  )

  const progressTone =
    progressPercent >= 70
      ? 'from-emerald-500 to-green-500'
      : progressPercent >= 35
        ? 'from-amber-500 to-orange-500'
        : 'from-rose-500 to-red-500'

  const statusLabel = progressPercent >= 70 ? 'Ready' : progressPercent >= 35 ? 'Growing' : 'Starter'

  const handleCardClick = () => {
    navigate(`/subjects/${subject.id}/chapters`)
  }

  const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onEdit(subject)
  }

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onDelete(subject)
  }

  return (
    <Card
      onClick={handleCardClick}
      hoverable
      className="group h-full border border-slate-200/80 bg-white/90 p-5 shadow-sm transition-all duration-200 lg:p-4"
    >
      <div className="flex flex-col gap-3 lg:hidden">
        <ResponsiveMedia
          src="/illustrations/subject-study.svg"
          src2x="/illustrations/subject-study.svg"
          alt={`${subject.name} illustration`}
          className="mb-1"
          width={320}
          height={180}
        />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold leading-tight text-slate-900 md:text-xl lg:text-2xl">{subject.name}</h3>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                {statusLabel}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600 lg:text-base">
              {subject.chapter_count ?? 0} {subject.chapter_count === 1 ? 'chapter' : 'chapters'} • {subject.question_count ?? 0} questions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-primary-300 hover:text-primary-600"
              aria-label="Edit subject"
              title="Edit subject"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-200 hover:text-rose-600"
              aria-label="Delete subject"
              title="Delete subject"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Study readiness</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className={`h-full rounded-full bg-gradient-to-r ${progressTone}`} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center text-sm font-medium text-slate-700">
              <svg className="mr-2 h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>{subject.chapter_count ?? 0} chapters</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center text-sm font-medium text-slate-700">
              <svg className="mr-2 h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{subject.question_count ?? 0} questions</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200/80 pt-4 sm:flex-row">
          <button
            type="button"
            onClick={handleCardClick}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            Open subject
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              navigate(`/subjects/${subject.id}/chapters`)
            }}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-primary-300 hover:text-primary-600"
          >
            View chapters
          </button>
        </div>

        <div className="flex items-center text-xs text-slate-500">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Created {formatDate(subject.created_at)}</span>
        </div>
      </div>

      <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold leading-tight text-slate-900 md:text-xl lg:text-2xl">{subject.name}</h3>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              {statusLabel}
            </span>
          </div>
          <div className="mt-2 flex gap-6 text-sm text-slate-600">
            <span>{subject.chapter_count ?? 0} chapters</span>
            <span>{subject.question_count ?? 0} questions</span>
          </div>
        </div>

        <div className="w-48 flex-shrink-0">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Readiness</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full rounded-full bg-gradient-to-r ${progressTone}`} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="ml-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-primary-300 hover:text-primary-600"
            aria-label="Edit subject"
            title="Edit subject"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-200 hover:text-rose-600"
            aria-label="Delete subject"
            title="Delete subject"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  )
}
