import { ReactNode } from 'react'
import Button from './Button'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  icon?: ReactNode
}

export default function ErrorState({ title = 'Something went wrong', message, onRetry, icon }: ErrorStateProps) {
  return (
    <div className="mx-auto flex max-w-full flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center md:px-8 md:py-14 lg:mx-auto lg:max-w-[600px] lg:px-10 lg:py-16">
      {icon ? <div className="mb-4 rounded-full bg-white p-4 text-red-600 lg:p-5">{icon}</div> : null}
      <h3 className="text-lg font-semibold leading-tight text-red-700 md:text-xl lg:text-2xl">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-red-600 lg:max-w-[480px] lg:text-base">{message}</p>
      {onRetry ? (
        <div className="mt-6 lg:mt-8">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  )
}
