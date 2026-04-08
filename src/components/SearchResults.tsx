import type { SearchResult } from '../utils/search'

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  onSelect: (result: SearchResult) => void
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
    <div className="mt-3 space-y-4">
      {conditions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Conditions</p>
          <div className="space-y-1">
            {conditions.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r)}
                className="w-full text-left px-4 py-3 rounded-xl bg-white border-2 border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <p className="font-semibold text-gray-800">{r.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {drugs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Drugs</p>
          <div className="space-y-1">
            {drugs.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r)}
                className="w-full text-left px-4 py-3 rounded-xl bg-white border-2 border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <p className="font-semibold text-gray-800">{r.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
