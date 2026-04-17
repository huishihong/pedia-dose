import type { DoseResult } from '../utils/doseCalculator'

interface DoseResultProps {
  result: DoseResult
}

export function DoseResultCard({ result }: DoseResultProps) {
  const isLiquid = result.volumeMl !== null

  return (
    <div className="w-full mt-5 space-y-3">
      {result.isCapped && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <span className="text-red-500 text-lg leading-none mt-0.5">⚠️</span>
          <p className="text-red-700 text-sm font-medium leading-snug">
            Weight-based dose ({result.calculatedDoseMg} mg) exceeds maximum.
            Dose capped at <strong>{result.cappedDoseMg} mg</strong>.
          </p>
        </div>
      )}

      {/* Main dose card — solid blue */}
      <div className="bg-blue-600 rounded-2xl p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-200 mb-1">Dose</p>
        <p className="text-6xl font-bold leading-none">
          {result.cappedDoseMg} <span className="text-3xl font-semibold text-blue-200">mg</span>
        </p>

        {isLiquid ? (
          <>
            <p className="text-blue-100 text-xl mt-2 font-semibold">= {result.volumeMl} mL</p>
            <p className="text-blue-300 text-sm mt-0.5">{result.formulation}</p>
          </>
        ) : result.solidCount !== null ? (
          <>
            <p className="text-blue-100 text-xl mt-2 font-semibold">
              = {result.solidCount} {result.solidUnit}{result.solidCount !== 1 ? 's' : ''}
            </p>
            <p className="text-blue-300 text-sm mt-0.5">{result.formulation}</p>
          </>
        ) : (
          <p className="text-blue-300 text-sm mt-2">{result.formulation}</p>
        )}

        <p className="text-blue-300 text-xs mt-3">
          {result.dosePerKg} mg/kg × {result.weightKg} kg = {result.calculatedDoseMg} mg
          {result.isCapped ? ` → capped at ${result.cappedDoseMg} mg` : ''}
        </p>
      </div>

      {/* Info rows */}
      <div className="bg-gray-50 rounded-2xl overflow-hidden">
        <div className="divide-y divide-gray-100">
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-gray-500">Frequency</span>
            <span className="text-sm font-semibold text-gray-900">{result.frequency}</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-gray-500">Route</span>
            <span className="text-sm font-semibold text-gray-900">{result.route}</span>
          </div>
          {result.maxDailyDoses !== null && (
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-gray-500">Max daily</span>
              <span className="text-sm font-semibold text-gray-900">{result.maxDailyDoses} doses</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center pt-1">
        Source: KKH CE Guidelines Jan 2026; NHG Pharmacy Calculator Jul 2024; PaedsENGAGE Feb 2025
      </p>
    </div>
  )
}
