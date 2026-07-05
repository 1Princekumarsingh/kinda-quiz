import { type MouseEvent } from 'react'
import Card from '@/components/common/Card'
import { Chapter } from '@/types/chapter'
import { QuizProgress } from '@/types/quiz-progress'

interface ChapterCardProps {
  chapter: Chapter
  progress?: QuizProgress | null
  onEdit: (chapter: Chapter) => void
  onDelete: (chapter: Chapter) => void
  onImport: (chapter: Chapter) => void
  onStartQuiz: (chapter: Chapter) => void
  onContinueChapter: (chapter: Chapter, progress?: QuizProgress | null) => void
  onExport: (chapter: Chapter) => void
}

export default function ChapterCard({ chapter, progress, onEdit, onDelete, onImport, onStartQuiz, onContinueChapter, onExport }: ChapterCardProps) {
  const hasProgress = Boolean(progress && !progress.state.is_completed)
  const nextQuestion = progress ? Math.min(progress.state.current_question_index + 1, chapter.question_count) : 0
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const progressPercent = chapter.question_count > 0 ? Math.round((chapter.completed_count / chapter.question_count) * 100) : 0
  const accuracyPercent = Number.isFinite(chapter.accuracy) ? chapter.accuracy : 0
  const accuracyTone = accuracyPercent >= 80 ? 'text-emerald-600' : accuracyPercent >= 60 ? 'text-amber-600' : 'text-rose-600'

  const statusConfig =
    chapter.error_count > 0
      ? { label: 'NEEDS REVIEW', classes: 'border-orange-200 bg-orange-50 text-orange-700' }
      : chapter.review_count > 0
        ? { label: 'REVIEW', classes: 'border-sky-200 bg-sky-50 text-sky-700' }
        : chapter.almost_forgot_count > 0
          ? { label: 'ALMOST FORGOT', classes: 'border-amber-200 bg-amber-50 text-amber-700' }
          : chapter.completed_count >= chapter.question_count && chapter.question_count > 0
            ? { label: 'MASTERED', classes: 'border-emerald-200 bg-emerald-50 text-emerald-700' }
            : { label: 'NEW', classes: 'border-slate-200 bg-slate-100 text-slate-700' }

  const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onEdit(chapter)
  }

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onDelete(chapter)
  }

  const handleExport = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onExport(chapter)
  }

  return (
    <Card
      hoverable
      className="group h-full border border-slate-200/80 bg-white/90 p-3 shadow-sm transition-all duration-200 sm:p-4 md:p-4 lg:p-6 xl:p-8"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold leading-tight text-slate-900 md:text-xl lg:text-2xl">{chapter.name}</h3>
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusConfig.classes}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600 lg:text-base">
              {chapter.question_count} questions • {chapter.completed_count} completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            {chapter.question_count > 0 && (
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-emerald-200 hover:text-emerald-600"
                aria-label="Export questions"
                title="Export questions"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-primary-300 hover:text-primary-600"
              aria-label="Edit chapter"
              title="Edit chapter"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-200 hover:text-rose-600"
              aria-label="Delete chapter"
              title="Delete chapter"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-1 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Progress</span>
              <span className="font-semibold text-slate-900">{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Accuracy</span>
              <span className={`font-semibold ${accuracyTone}`}>{accuracyPercent.toFixed(1)}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full rounded-full ${accuracyPercent >= 80 ? 'bg-emerald-500' : accuracyPercent >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(accuracyPercent, 100)}%` }} />
            </div>
          </div>
        </div>

        {(chapter.review_count > 0 || chapter.error_count > 0 || chapter.almost_forgot_count > 0) && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Needs attention</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {chapter.review_count > 0 && (
                <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">Review {chapter.review_count}</span>
              )}
              {chapter.almost_forgot_count > 0 && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">Almost forgot {chapter.almost_forgot_count}</span>
              )}
              {chapter.error_count > 0 && (
                <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">Errors {chapter.error_count}</span>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-slate-200/80 pt-4 sm:flex-row">
          {hasProgress && chapter.question_count > 0 && (
            <button
              type="button"
              onClick={() => onContinueChapter(chapter, progress)}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
            >
              Continue from {nextQuestion}
            </button>
          )}
          {chapter.question_count > 0 && (
            <button
              type="button"
              onClick={() => onStartQuiz(chapter)}
              className={`inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 ${hasProgress ? 'flex-1' : 'w-full'}`}
            >
              Start quiz
            </button>
          )}
          <button
            type="button"
            onClick={() => onImport(chapter)}
            className={`inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 ${chapter.question_count > 0 ? 'flex-1' : 'w-full'}`}
          >
            Import questions
          </button>
        </div>

        <div className="flex items-center text-xs text-slate-500">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Created {formatDate(chapter.created_at)}</span>
        </div>
      </div>

      <div className="hidden flex-col gap-3 md:flex lg:hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold leading-tight text-slate-900">{chapter.name}</h3>
              <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusConfig.classes}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              {chapter.question_count} questions • {chapter.completed_count} completed
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-primary-300 hover:text-primary-600"
              aria-label="Edit chapter"
              title="Edit chapter"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-200 hover:text-rose-600"
              aria-label="Delete chapter"
              title="Delete chapter"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="flex gap-1">
          {hasProgress && chapter.question_count > 0 && (
            <button
              type="button"
              onClick={() => onContinueChapter(chapter, progress)}
              className="flex-1 rounded-lg bg-violet-600 px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
              title="Continue quiz"
            >
              Continue
            </button>
          )}
          {chapter.question_count > 0 && (
            <button
              type="button"
              onClick={() => onStartQuiz(chapter)}
              className="flex-1 rounded-lg bg-emerald-600 px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
              title="Start quiz"
            >
              Start
            </button>
          )}
          <button
            type="button"
            onClick={() => onImport(chapter)}
            className="flex-1 rounded-lg bg-primary-600 px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
            title="Import questions"
          >
            Import
          </button>
          {chapter.question_count > 0 && (
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-emerald-200 hover:text-emerald-600"
              aria-label="Export questions"
              title="Export questions"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-col lg:gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="truncate text-2xl font-bold leading-tight text-slate-900 xl:text-3xl">{chapter.name}</h3>
              <span className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${statusConfig.classes}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-6 text-base text-slate-600">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{chapter.question_count} questions</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{chapter.completed_count} completed</span>
              </div>
              {(chapter.review_count > 0 || chapter.error_count > 0 || chapter.almost_forgot_count > 0) && (
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-medium text-orange-600">
                    {chapter.error_count + chapter.review_count + chapter.almost_forgot_count} need attention
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-shrink-0 items-center gap-2">
            {chapter.question_count > 0 && (
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-sm"
                aria-label="Export questions"
                title="Export questions"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 hover:shadow-sm"
              aria-label="Edit chapter"
              title="Edit chapter"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm"
              aria-label="Delete chapter"
              title="Delete chapter"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-slate-100/50 p-5">
            <div className="flex items-center justify-between text-base">
              <span className="font-medium text-slate-700">Progress</span>
              <span className="text-xl font-bold text-slate-900">{progressPercent}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-sm" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-slate-100/50 p-5">
            <div className="flex items-center justify-between text-base">
              <span className="font-medium text-slate-700">Accuracy</span>
              <span className={`text-xl font-bold ${accuracyTone}`}>{accuracyPercent.toFixed(1)}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full rounded-full shadow-sm ${accuracyPercent >= 80 ? 'bg-emerald-500' : accuracyPercent >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(accuracyPercent, 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-200/80 pt-5">
          {hasProgress && chapter.question_count > 0 && (
            <button
              type="button"
              onClick={() => onContinueChapter(chapter, progress)}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-violet-300 bg-violet-50 px-5 py-3 text-sm font-bold text-violet-700 transition-all hover:bg-violet-100 hover:shadow-md"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Continue from Q{nextQuestion}
            </button>
          )}
          {chapter.question_count > 0 && (
            <button
              type="button"
              onClick={() => onStartQuiz(chapter)}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-md ${hasProgress ? 'flex-1' : 'flex-[2]'}`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Quiz
            </button>
          )}
          <button
            type="button"
            onClick={() => onImport(chapter)}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-primary-700 hover:shadow-md ${chapter.question_count > 0 ? 'flex-1' : 'flex-[2]'}`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import Questions
          </button>
        </div>
      </div>
    </Card>
  )
}
