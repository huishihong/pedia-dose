import { useState } from 'react'

interface WeightInputProps {
  onWeightChange: (weightKg: number | null) => void
  initialValue?: number
  onEnter?: () => void
}

export function WeightInput({ onWeightChange, initialValue, onEnter }: WeightInputProps) {
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg')
  const [value, setValue] = useState(initialValue != null ? String(initialValue) : '')

  function handleValueChange(raw: string) {
    setValue(raw)
    const num = parseFloat(raw)
    if (!raw || isNaN(num) || num <= 0) {
      onWeightChange(null)
      return
    }
    const kg = unit === 'lbs' ? num / 2.2046 : num
    onWeightChange(parseFloat(kg.toFixed(2)))
  }

  function handleUnitToggle(newUnit: 'kg' | 'lbs') {
    if (newUnit === unit) return
    setUnit(newUnit)
    const num = parseFloat(value)
    if (!value || isNaN(num)) return
    const converted = newUnit === 'lbs' ? num * 2.2046 : num / 2.2046
    const rounded = parseFloat(converted.toFixed(1)).toString()
    setValue(rounded)
    const kg = newUnit === 'lbs' ? parseFloat(rounded) / 2.2046 : parseFloat(rounded)
    onWeightChange(parseFloat(kg.toFixed(2)))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onEnter?.()
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-500 mb-2">
        Patient weight
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          placeholder={unit === 'kg' ? 'e.g. 15' : 'e.g. 33'}
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          min="0"
          step="0.1"
          className="flex-1 min-w-0 text-base font-semibold bg-white border border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 placeholder-gray-400 placeholder:text-sm placeholder:font-semibold transition-all"
        />
        <div className="flex bg-gray-200 rounded-full p-1 gap-1">
          <button
            type="button"
            onClick={() => handleUnitToggle('kg')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              unit === 'kg'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            kg
          </button>
          <button
            type="button"
            onClick={() => handleUnitToggle('lbs')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              unit === 'lbs'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            lbs
          </button>
        </div>
      </div>
    </div>
  )
}
