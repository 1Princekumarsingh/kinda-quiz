import { ReactNode, useEffect, useRef } from 'react'
import Modal from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'danger' | 'warning' | 'primary'
  isLoading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelButtonRef.current?.focus(), 0)
    }
  }, [isOpen])

  const confirmClasses = {
    danger: 'bg-error-600 text-white hover:bg-error-700',
    warning: 'bg-warning-600 text-white hover:bg-warning-700',
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" preventClose={isLoading}>
      <div className="space-y-5">
        <div className="text-sm leading-6 text-gray-600">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="touch-target min-h-[44px] rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-150 hover:scale-105 active:scale-95 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`touch-target min-h-[44px] rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100 ${confirmClasses[confirmVariant]}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
