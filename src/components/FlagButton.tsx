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
        className="flex items-center gap-1 text-xs text-gray-300 hover:text-red-400 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V4m0 0l7-1 4 2 7-1v13l-7 1-4-2-7 1V4z" />
        </svg>
        <span>Flag</span>
      </button>
      <FlagModal isOpen={open} onClose={() => setOpen(false)} context={context} />
    </>
  )
}
