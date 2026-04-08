import { useState } from 'react'
import './index.css'
import { SearchBar } from './components/SearchBar'
import { SearchResults } from './components/SearchResults'
import { ConditionView } from './components/ConditionView'
import { WeightInput } from './components/WeightInput'
import { FormulationSelector } from './components/FormulationSelector'
import { DoseResultCard } from './components/DoseResult'
import { search } from './utils/search'
import type { SearchResult } from './utils/search'
import { calculateParacetamol } from './utils/doseCalculator'
import { calculateGenericDose } from './utils/genericDoseCalculator'
import type { DoseResult, Formulation } from './utils/doseCalculator'
import drugsData from './data/drugs.json'

type Screen = 'home' | 'condition' | 'drug'

// Types for drug data
type DrugFormulation = { id: string; label: string; strengthMg: number; volumeMl: number | null; route: string; ageNote?: string }
type DrugEntry = { id: string; name: string; category?: string; formulations?: DrugFormulation[]; defaultFormulation?: { label: string; strengthMg: number; volumeMl: number; route: string }; dosePerKg?: number; maxDose?: number | null; frequency?: string }

function getParacetamolFormulations(): Formulation[] {
  const p = drugsData.drugs.find(d => d.id === 'paracetamol') as DrugEntry | undefined
  return (p?.formulations ?? []) as Formulation[]
}

const paracetamolFormulations = getParacetamolFormulations()
const defaultParacetamolFormulation = paracetamolFormulations.find(f => f.id === 'paracetamol-250-oral')!

function Disclaimer() {
  return (
    <footer className="sticky bottom-0 bg-amber-50 border-t-2 border-amber-200 px-5 py-3">
      <p className="text-amber-800 text-xs text-center leading-snug">
        <strong>PediaDose is a calculation aid only.</strong> Always verify doses against current formulary guidelines and apply clinical judgment.
      </p>
    </footer>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Drug screen state
  const [weightKg, setWeightKg] = useState<number | null>(null)
  const [formulation, setFormulation] = useState<Formulation>(defaultParacetamolFormulation)
  const [doseResult, setDoseResult] = useState<DoseResult | null>(null)

  const searchResults = search(query)

  function handleSelect(result: SearchResult) {
    setSelectedId(result.id)
    setQuery('')
    setWeightKg(null)
    setDoseResult(null)

    if (result.type === 'condition') {
      setScreen('condition')
    } else {
      // Set up drug formulations if paracetamol, else use default
      if (result.id === 'paracetamol') {
        setFormulation(defaultParacetamolFormulation)
      } else {
        const drug = drugsData.drugs.find(d => d.id === result.id) as DrugEntry | undefined
        const def = drug?.defaultFormulation
        if (def) {
          setFormulation({
            id: `${result.id}-default`,
            label: def.label,
            strengthMg: def.strengthMg,
            volumeMl: def.volumeMl,
            route: def.route,
          })
        } else {
          setFormulation({ id: 'iv-only', label: 'IV / Hospital only', strengthMg: 0, volumeMl: null, route: 'IV' })
        }
      }
      setScreen('drug')
    }
  }

  function handleBack() {
    setScreen('home')
    setSelectedId(null)
    setQuery('')
    setWeightKg(null)
    setDoseResult(null)
  }

  function handleCalculate() {
    if (weightKg === null || selectedId === null) return
    if (selectedId === 'paracetamol') {
      setDoseResult(calculateParacetamol(weightKg, formulation))
    } else {
      const drug = drugsData.drugs.find(d => d.id === selectedId) as DrugEntry | undefined
      const result = calculateGenericDose(selectedId, weightKg)
      if (result) {
        // Map GenericDoseResult → DoseResult shape
        setDoseResult({
          weightKg,
          dosePerKg: result.dosePerKg,
          calculatedDoseMg: result.calculatedMg,
          cappedDoseMg: result.cappedMg,
          volumeMl: result.volumeMl,
          solidCount: null,
          solidUnit: null,
          isCapped: result.isCapped,
          formulation: result.formulation ?? formulation.label,
          route: result.route,
          frequency: result.frequency,
          maxDailyDoses: (drug as any)?.maxDailyDoses ?? 0,
        })
      }
    }
  }

  const selectedDrug = selectedId ? drugsData.drugs.find(d => d.id === selectedId) as DrugEntry | undefined : undefined
  const isParacetamol = selectedId === 'paracetamol'
  const hasFormulations = isParacetamol && paracetamolFormulations.length > 0
  const isIVOnly = formulation.id === 'iv-only'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      <header className="px-5 pt-8 pb-4 bg-gray-50">
        <h1 className="text-3xl font-bold text-blue-800 tracking-tight">PediaDose</h1>
        <p className="text-gray-400 text-sm mt-0.5">Paediatric drug dose calculator</p>
      </header>

      <main className="flex-1 px-5 pb-8">

        {/* HOME / SEARCH */}
        {screen === 'home' && (
          <div>
            <SearchBar value={query} onChange={setQuery} onClear={() => setQuery('')} />
            {query.length < 2 && (
              <p className="text-sm text-gray-400 mt-4 text-center">
                Search by condition (e.g. "asthma") or drug (e.g. "paracetamol")
              </p>
            )}
            <SearchResults results={searchResults} query={query} onSelect={handleSelect} />
          </div>
        )}

        {/* CONDITION FLOW */}
        {screen === 'condition' && selectedId && (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm">
            <ConditionView conditionId={selectedId} onBack={handleBack} />
          </div>
        )}

        {/* DRUG FLOW */}
        {screen === 'drug' && selectedDrug && (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm">
            <button type="button" onClick={handleBack} className="flex items-center gap-1 text-blue-600 text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-1">{selectedDrug.name}</h2>
            {selectedDrug.category && (
              <p className="text-sm text-gray-400 mb-4">{selectedDrug.category}</p>
            )}

            {isIVOnly ? (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl px-4 py-3">
                <p className="text-amber-800 text-sm font-medium">
                  This drug is administered intravenously (IV) or in a hospital setting only.
                  Search by condition for dosing guidance.
                </p>
              </div>
            ) : (
              <>
                <WeightInput onWeightChange={kg => { setWeightKg(kg); setDoseResult(null) }} />

                {hasFormulations && (
                  <FormulationSelector
                    formulations={paracetamolFormulations}
                    selected={formulation}
                    onChange={f => { setFormulation(f); setDoseResult(null) }}
                  />
                )}

                {!hasFormulations && formulation.label && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-600 mb-1">Formulation</p>
                    <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      {formulation.label}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCalculate}
                  disabled={weightKg === null}
                  className="mt-4 w-full py-4 rounded-xl text-lg font-bold transition-colors
                    bg-blue-600 text-white
                    disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed
                    hover:enabled:bg-blue-700 active:enabled:bg-blue-800"
                >
                  Calculate dose
                </button>

                {doseResult && <DoseResultCard result={doseResult} />}
              </>
            )}
          </div>
        )}
      </main>

      <Disclaimer />
    </div>
  )
}
