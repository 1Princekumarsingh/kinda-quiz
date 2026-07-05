import { ReactNode } from 'react'
import Button from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center md:px-8 md:py-14 lg:max-w-[600px] lg:px-10 lg:py-16">
      {icon ? <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-600 lg:p-5">{icon}</div> : null}
      <h3 className="text-lg font-semibold leading-tight text-gray-900 md:text-xl lg:text-2xl">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm leading-6 text-gray-600 lg:max-w-[480px] lg:text-base">{description}</p> : null}
      {action ? (
        <div className="mt-6 lg:mt-8">
          <Button variant="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
