import { useState } from 'react'
import conditionsData from '../data/conditions.json'
import { WeightInput } from './WeightInput'
import { calculateConditionDrug } from '../utils/genericDoseCalculator'

interface ConditionViewProps {
  conditionId: string
  onBack: () => void
  initialTier?: string
  initialWeight?: number
  autoCalculate?: boolean
}

type ConditionDrug = {
  drugId: string
  dose_instruction?: string | null
  dose_mg_per_kg?: number | null
  dose_mg_per_kg_per_day?: number | null
  dose_per_dose_label?: string | null
  max_dose_mg?: number | null
  frequency: string
  route: string
  clinicalNote?: string | null
  requiresClinicalDecision?: boolean
}

function dosesPerDay(frequency: string): number | null {
  const f = frequency.toUpperCase()
  if (f.includes('QDS') || f.includes('Q6') || f.includes('FOUR')) return 4
  if (f.includes('TDS') || f.includes('Q8') || f.includes('THREE')) return 3
  if (f.includes('BD') || f.includes('Q12') || f.includes('TWICE')) return 2
  if (f.includes('OD') || f.includes('ONCE') || f.includes('DAILY')) return 1
  return null
}

function derivePerDoseMgPerKg(drug: ConditionDrug): number | null {
  if (drug.dose_mg_per_kg != null) return drug.dose_mg_per_kg
  if (drug.dose_mg_per_kg_per_day != null) {
    const n = dosesPerDay(drug.frequency)
    if (n) return parseFloat((drug.dose_mg_per_kg_per_day / n).toFixed(2))
  }
  return null
}

export function ConditionView({ conditionId, onBack, initialTier, initialWeight, autoCalculate }: ConditionViewProps) {
  const condition = conditionsData.conditions.find(c => c.id === conditionId)
  const [selectedTier, setSelectedTier] = useState<string | null>(initialTier ?? null)
  const [weightKg, setWeightKg] = useState<number | null>(initialWeight ?? null)
  const [showDoses, setShowDoses] = useState(autoCalculate ?? false)

  if (!condition) return null

  const tier = condition.severityTiers.find(t => t.tier === selectedTier)

  function handleTierSelect(tierId: string) {
    setSelectedTier(tierId)
    setWeightKg(null)
    setShowDoses(false)
  }

  function handleWeightChange(kg: number | null) {
    setWeightKg(kg)
    setShowDoses(false)
  }

  return (
    <div className="space-y-4">
      {/* Back + title */}
      <div>
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-blue-600 text-sm font-medium mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2 className="text-xl font-bold text-gray-800">{condition.name}</h2>
        {condition.notes && (
          <p className="text-sm text-gray-500 mt-1 leading-snug">{condition.notes}</p>
        )}
      </div>

      {/* Severity tiers */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">Severity</p>
        <div className="space-y-2">
          {condition.severityTiers.map(t => (
            <button
              key={t.tier}
              type="button"
              onClick={() => handleTierSelect(t.tier)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                selectedTier === t.tier
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-800 hover:border-blue-300'
              }`}
            >
              <p className="font-semibold">{t.label}</p>
              <p className={`text-xs mt-0.5 leading-snug ${selectedTier === t.tier ? 'text-blue-200' : 'text-gray-400'}`}>
                {t.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Weight input — only shown after severity selected */}
      {selectedTier && (
        <div className="pt-2">
          <WeightInput onWeightChange={handleWeightChange} initialValue={initialWeight} />
          <button
            type="button"
            onClick={() => setShowDoses(true)}
            disabled={weightKg === null}
            className="mt-4 w-full py-4 rounded-xl text-lg font-bold transition-colors
              bg-blue-600 text-white
              disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed
              hover:enabled:bg-blue-700 active:enabled:bg-blue-800"
          >
            Calculate doses
          </button>
        </div>
      )}

      {/* Dose results per drug */}
      {showDoses && tier && weightKg && (
        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Doses for {tier.label} — {weightKg} kg
          </p>
          {(tier.drugs as ConditionDrug[]).filter(drug => !drug.requiresClinicalDecision).map((drug, i) => {
            const perDoseMgPerKg = derivePerDoseMgPerKg(drug)
            const result = calculateConditionDrug(
              drug.drugId,
              weightKg,
              perDoseMgPerKg,
              drug.max_dose_mg ?? null,
              drug.frequency,
              drug.route,
              drug.dose_instruction ?? null,
              drug.clinicalNote ?? null
            )
            return (
              <div key={i} className="bg-white border-2 border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-gray-800">{result.drugName}</p>
                  <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 whitespace-nowrap">{result.route}</span>
                </div>

                {result.isCalculated ? (
                  <div className="mt-2">
                    {result.isCapped && (
                      <p className="text-xs text-red-600 font-medium mb-1">
                        ⚠️ {result.calculatedMg} mg → capped at {result.cappedMg} mg
                      </p>
                    )}
                    <p className="text-3xl font-bold text-blue-800">
                      {result.cappedMg} <span className="text-base font-semibold text-blue-500">mg</span>
                    </p>
                    {result.volumeMl !== null && (
                      <p className="text-blue-600 text-base font-medium">= {result.volumeMl} mL</p>
                    )}
                    {result.formulation && (
                      <p className="text-xs text-blue-400 mt-0.5">{result.formulation}</p>
                    )}
                    {perDoseMgPerKg && (
                      <p className="text-xs text-blue-400 mt-1">
                        {drug.dose_mg_per_kg_per_day
                          ? `${drug.dose_mg_per_kg_per_day} mg/kg/day ÷ ${dosesPerDay(drug.frequency)} = ${perDoseMgPerKg} mg/kg/dose × ${weightKg} kg = ${result.calculatedMg} mg`
                          : `${perDoseMgPerKg} mg/kg × ${weightKg} kg = ${result.calculatedMg} mg`}
                        {result.isCapped ? ` → capped at ${result.cappedMg} mg` : ''}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-base font-semibold text-gray-700">{result.instruction}</p>
                )}

                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-600">
                    {result.frequency}
                  </span>
                </div>

                {result.clinicalNote && (
                  <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 leading-snug">
                    {result.clinicalNote}
                  </p>
                )}

                {result.cautions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.cautions.map((c, j) => (
                      <p key={j} className="text-xs text-red-600">⚠️ {c}</p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          <p className="text-xs text-gray-400 text-center pt-1">
            Source: {condition.source}
          </p>
        </div>
      )}
    </div>
  )
}
