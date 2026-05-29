import { useState } from 'react'
import { submitFlag } from '../utils/flagging'
import type { FlagPayload } from '../utils/flagging'

interface FlagModalProps {
  isOpen: boolean
  onClose: () => void
  context: Omit<FlagPayload, 'clinician_name' | 'free_text'>
}

export function FlagModal({ isOpen, onClose, context }: FlagModalProps) {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')

  if (!isOpen) return null

  async function handleSubmit() {
    if (!name.trim()) return
    setStatus('submitting')
    await submitFlag({ ...context, clinician_name: name.trim(), free_text: text.trim() || null })
    setStatus('done')
    setTimeout(() => {
      onClose()
      setName('')
      setText('')
      setStatus('idle')
    }, 1500)
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md bg-white rounded-t-2xl md:rounded-2xl p-6 shadow-xl">
        {status === 'done' ? (
          <div className="flex flex-col items-center py-4 gap-2">
            <span className="text-2xl">✓</span>
            <p className="text-gray-800 font-semibold">Thanks, flagged</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Flag an issue</h3>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Your name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Tan"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Describe the issue <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="e.g. Dose seems too high for this age group..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!name.trim() || status === 'submitting'}
              className="mt-4 w-full py-3 rounded-full text-sm font-semibold bg-red-500 text-white
                disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed
                hover:enabled:bg-red-600 transition-colors"
            >
              {status === 'submitting' ? 'Submitting…' : 'Submit flag'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
