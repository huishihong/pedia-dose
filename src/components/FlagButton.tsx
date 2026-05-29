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
        className="flex items-center gap-1.5 bg-white border border-red-200 rounded-full px-3 py-1 text-xs font-semibold text-[#EA3323] hover:bg-red-50 hover:border-red-300 transition-colors flex-shrink-0 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="#EA3323">
          <path d="M191.87-71.87v-776.26h656.26l-86.7 209.8 86.7 209.57H282.87v356.89h-91Zm91-447.65h428.85l-48.96-118.81 48.96-118.8H282.87v237.61Zm0 0v-237.61 237.61Z"/>
        </svg>
        <span>Flag</span>
      </button>
      <FlagModal isOpen={open} onClose={() => setOpen(false)} context={context} />
    </>
  )
}
