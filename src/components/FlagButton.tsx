import { useState } from 'react'
import { FlagModal } from './FlagModal'
import type { FlagPayload } from '../utils/flagging'

interface FlagButtonProps {
  context: Omit<FlagPayload, 'clinician_name' | 'free_text'>
}

export function FlagButton({ context }: FlagButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Flag an issue"
        className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 21V4.5L5 4l6 2 6-2 1 .5V15.5l-1 .5-6-2-6 2-1-.5V21H4z" />
        </svg>
        <span>Flag</span>
      </button>
      <FlagModal isOpen={open} onClose={() => setOpen(false)} context={context} />
    </>
  )
}
