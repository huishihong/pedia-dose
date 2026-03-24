import { useState } from 'react'

interface WeightInputProps {
  onWeightChange: (weightKg: number | null) => void
}

export function WeightInput({ onWeightChange }: WeightInputProps) {
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg')
  const [value, setValue] = useState('')

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

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-600 mb-2">
        Patient weight
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          placeholder={unit === 'kg' ? 'e.g. 15' : 'e.g. 33'}
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          min="0"
          step="0.1"
          className="flex-1 text-2xl font-semibold border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-800 placeholder-gray-300"
        />
        <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => handleUnitToggle('kg')}
            className={`px-4 py-3 text-base font-semibold transition-colors ${
              unit === 'kg'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            kg
          </button>
          <button
            type="button"
            onClick={() => handleUnitToggle('lbs')}
            className={`px-4 py-3 text-base font-semibold transition-colors ${
              unit === 'lbs'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            lbs
          </button>
        </div>
      </div>
    </div>
  )
}
