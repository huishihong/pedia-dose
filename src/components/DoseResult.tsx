import type { DoseResult } from '../utils/doseCalculator'

interface DoseResultProps {
  result: DoseResult
}

export function DoseResultCard({ result }: DoseResultProps) {
  return (
    <div className="w-full mt-6 space-y-4">
      {result.isCapped && (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-red-500 text-xl leading-none mt-0.5">⚠️</span>
          <p className="text-red-700 text-sm font-medium leading-snug">
            Weight-based dose ({result.calculatedDoseMg} mg) exceeds maximum.
            Dose capped at <strong>1000 mg</strong>.
          </p>
        </div>
      )}

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
          Dose
        </p>
        <p className="text-5xl font-bold text-blue-800 leading-none">
          {result.cappedDoseMg} <span className="text-2xl font-semibold text-blue-500">mg</span>
        </p>
        <p className="text-blue-600 text-lg mt-2 font-medium">
          = {result.volumeMl} mL
        </p>
        <p className="text-blue-500 text-sm mt-0.5">
          {result.formulation}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Frequency</p>
          <p className="text-lg font-bold text-gray-800">{result.frequency}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Max daily</p>
          <p className="text-lg font-bold text-gray-800">{result.maxDailyDoses} doses</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 col-span-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Route</p>
          <p className="text-lg font-bold text-gray-800">{result.route}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        {result.dosePerKg} mg/kg × {result.weightKg} kg = {result.calculatedDoseMg} mg
        {result.isCapped ? ' → capped at 1000 mg' : ''}
        {' '}· Source: KKH CE Guidelines Jan 2026; NHG Pharmacy Calculator Jul 2024
      </p>
    </div>
  )
}
