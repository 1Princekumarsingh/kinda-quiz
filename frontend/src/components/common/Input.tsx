import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  success?: boolean
  maxLength?: number
  currentLength?: number
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, success = false, className = '', maxLength, currentLength, ...props }, ref) => {
    const showCounter = typeof maxLength === 'number' && maxLength > 0
    const counterValue = typeof currentLength === 'number' ? currentLength : (props.value?.toString().length ?? 0)
    const isNearLimit = showCounter && counterValue / maxLength >= 0.9
    const isAtLimit = showCounter && counterValue >= maxLength
    const describedByIds = [error ? `${props.id}-error` : undefined, helperText ? `${props.id}-helper` : undefined].filter(Boolean).join(' ')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="mb-1 block text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="ml-1 text-rose-500">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`w-full rounded-xl border px-3 py-3 text-base transition-all duration-150 focus:outline-none focus:scale-[1.01] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 md:min-h-[44px] md:px-4 md:py-3 ${
              error ? 'border-rose-500 bg-rose-50' : success ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-white'
            } ${props.disabled ? 'cursor-not-allowed bg-slate-100' : 'bg-white'} ${className}`}
            aria-invalid={Boolean(error)}
            aria-describedby={describedByIds || undefined}
            {...props}
          />
          {success && !error && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" aria-hidden="true">
              ✓
            </span>
          )}
        </div>
        {error && (
          <p id={`${props.id}-error`} role="alert" aria-live="polite" className="mt-1 flex items-center gap-1 text-sm font-medium text-rose-600">
            <span aria-hidden="true">⚠</span>
            <span>{error}</span>
          </p>
        )}
        {helperText && !error && (
          <p id={`${props.id}-helper`} className="mt-1 text-sm text-slate-500">{helperText}</p>
        )}
        {showCounter && (
          <p className={`mt-1 text-sm ${isAtLimit ? 'text-rose-600' : isNearLimit ? 'text-amber-600' : 'text-slate-500'}`}>
            {counterValue}/{maxLength}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
