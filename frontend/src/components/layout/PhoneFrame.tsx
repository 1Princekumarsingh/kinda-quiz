import type { ReactNode } from 'react'

interface PhoneFrameProps {
  children: ReactNode
  className?: string
}

export default function PhoneFrame({ children, className = '' }: PhoneFrameProps) {
  return (
    <div className={`w-full ${className}`.trim()}>
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">{children}</div>
      </div>
    </div>
  )
}
