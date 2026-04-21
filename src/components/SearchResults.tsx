import type { SearchResult } from '../utils/search'

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  onSelect: (result: SearchResult) => void
}

function ChevronRight() {
  return (
    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function SearchResults({ results, query, onSelect }: SearchResultsProps) {
  const conditions = results.filter(r => r.type === 'condition')
  const drugs = results.filter(r => r.type === 'drug')

  if (query.length >= 2 && results.length === 0) {
    return (
      <div className="mt-4 text-center py-8 text-gray-400">
        <p className="text-base">Not found in PediaDose.</p>
        <p className="text-sm mt-1">Refer to KKH CE Guidelines directly.</p>
      </div>
    )
  }

  if (results.length === 0) return null

  return (
    <div className="mt-3 space-y-3">
      {conditions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">Conditions</p>
          <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
            {conditions.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r)}
                className={`w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors ${i < conditions.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.subtitle}</p>
                </div>
                <ChevronRight />
              </button>
            ))}
          </div>
        </div>
      )}

      {drugs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">Drugs</p>
          <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
            {drugs.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r)}
                className={`w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors ${i < drugs.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.subtitle}</p>
                </div>
                <ChevronRight />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
