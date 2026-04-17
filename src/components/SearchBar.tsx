interface SearchBarProps {
  value: string
  onChange: (q: string) => void
  onClear: () => void
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </div>
      <input
        type="text"
        inputMode="text"
        autoComplete="off"
        placeholder="Search drug or condition…"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-11 pr-10 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 bg-gray-50 text-gray-800 placeholder-gray-400 placeholder:text-sm"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
