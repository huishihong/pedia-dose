import { useState, useEffect } from 'react'
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
import conditionsData from './data/conditions.json'

type Screen = 'home' | 'condition' | 'drug'

// Types for drug data
type DrugFormulation = { id: string; label: string; strengthMg: number; volumeMl: number | null; route: string; ageNote?: string }
type WeightBand = { maxWeightKg: number | null; doseMg: number; frequency: string; notes: string }
type InfantDose = { ageLabel: string; doseMgPerKg: number; frequency: string }
type AgeBand = { ageLabel: string; doseMg?: number; volumeMl?: string; formulation?: string; frequency?: string; notes?: string }
type DrugEntry = {
  id: string; name: string; category?: string;
  formulations?: DrugFormulation[];
  defaultFormulation?: { label: string; strengthMg: number; volumeMl: number; route: string };
  dosePerKg?: number; maxDose?: number | null; frequency?: string;
  weightBandedDosing?: WeightBand[];
  infantDosing?: InfantDose[];
  ageBandedDosing?: AgeBand[];
  treatmentDuration?: string;
  dosingNote?: string;
  cautions?: string[];
  source?: string;
}

function deriveMaxDailyDoses(frequency: string): number | null {
  const f = frequency.toUpperCase()
  if (f.includes('OD') || f.includes('ONCE DAILY') || f.includes('SINGLE DOSE')) return 1
  if (f.includes('BD') || f.includes('TWICE')) return 2
  if (f.includes('TDS') || f.includes('THREE TIMES')) return 3
  if (f.includes('QDS') || f.includes('FOUR TIMES') || f.includes('Q6')) return 4
  if (f.includes('Q4')) return 6
  return null
}

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
  const [homeTab, setHomeTab] = useState<'conditions' | 'drugs'>('conditions')

  // Drug screen state
  const [weightKg, setWeightKg] = useState<number | null>(null)
  const [formulation, setFormulation] = useState<Formulation>(defaultParacetamolFormulation)
  const [doseResult, setDoseResult] = useState<DoseResult | null>(null)

  // DEBUG: URL param routing for Figma capture
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('debug')
    if (!p) return
    if (p === 'search') {
      setQuery('as')
    } else if (p === 'asthma') {
      setSelectedId('asthma')
      setScreen('condition')
    } else if (p === 'asthma-mild' || p === 'asthma-doses') {
      setSelectedId('asthma')
      setScreen('condition')
    } else if (p === 'paracetamol') {
      setSelectedId('paracetamol')
      setFormulation(defaultParacetamolFormulation)
      setScreen('drug')
    }
  }, [])

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
        if (drug?.ageBandedDosing) {
          setFormulation({ id: 'age-banded', label: 'Age-banded dosing', strengthMg: 0, volumeMl: null, route: 'Oral' })
        } else if (drug?.weightBandedDosing) {
          setFormulation({ id: 'weight-banded', label: 'Weight-banded dosing', strengthMg: 0, volumeMl: null, route: 'Oral' })
        } else {
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
          maxDailyDoses: drug?.frequency ? deriveMaxDailyDoses(drug.frequency) : null,
        })
      }
    }
  }

  const selectedDrug = selectedId ? drugsData.drugs.find(d => d.id === selectedId) as DrugEntry | undefined : undefined
  const isParacetamol = selectedId === 'paracetamol'
  const hasFormulations = isParacetamol && paracetamolFormulations.length > 0
  const isIVOnly = formulation.id === 'iv-only'
  const isWeightBanded = formulation.id === 'weight-banded'
  const isAgeBanded = formulation.id === 'age-banded'

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

            {query.length >= 2 ? (
              <SearchResults results={searchResults} query={query} onSelect={handleSelect} />
            ) : (
              <>
                {/* Tab toggle */}
                <div className="flex mt-4 bg-gray-100 rounded-xl p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setHomeTab('conditions')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${homeTab === 'conditions' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Conditions
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeTab('drugs')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${homeTab === 'drugs' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Drugs
                  </button>
                </div>

                {/* Alphabetical list */}
                <div className="mt-3 space-y-1">
                  {homeTab === 'conditions' &&
                    [...conditionsData.conditions]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelect({ id: c.id, name: c.name, subtitle: c.section ?? '', type: 'condition' })}
                          className="w-full text-left px-4 py-3 rounded-xl bg-white border-2 border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <p className="font-semibold text-gray-800">{c.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{c.section}</p>
                        </button>
                      ))
                  }
                  {homeTab === 'drugs' &&
                    [...drugsData.drugs]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleSelect({ id: d.id, name: d.name, subtitle: (d as DrugEntry).category ?? '', type: 'drug' })}
                          className="w-full text-left px-4 py-3 rounded-xl bg-white border-2 border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <p className="font-semibold text-gray-800">{d.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{(d as DrugEntry).category}</p>
                        </button>
                      ))
                  }
                </div>
              </>
            )}
          </div>
        )}

        {/* CONDITION FLOW */}
        {screen === 'condition' && selectedId && (() => {
          const dbg = new URLSearchParams(window.location.search).get('debug')
          return (
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm">
              <ConditionView
                conditionId={selectedId}
                onBack={handleBack}
                initialTier={dbg === 'asthma-mild' || dbg === 'asthma-doses' ? 'mild' : undefined}
                initialWeight={dbg === 'asthma-doses' ? 10 : undefined}
                autoCalculate={dbg === 'asthma-doses'}
              />
            </div>
          )
        })()}

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
            ) : isAgeBanded ? (
              <div className="mt-2 space-y-4">
                {selectedDrug?.ageBandedDosing && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dose by age</p>
                    <div className="space-y-1">
                      {selectedDrug.ageBandedDosing.map((band, i) => (
                        <div key={i} className="flex justify-between items-start text-sm px-3 py-2 rounded-lg bg-white border border-gray-100">
                          <span className="font-medium text-gray-700">{band.ageLabel}</span>
                          <span className="text-right text-gray-800 font-semibold ml-4">
                            {band.doseMg != null ? `${band.doseMg} mg` : band.volumeMl ? `${band.volumeMl} mL` : ''}
                            {band.formulation ? ` (${band.formulation})` : ''}
                            {band.frequency ? ` — ${band.frequency}` : ''}
                            {band.notes ? <span className="block text-xs text-gray-400 font-normal">{band.notes}</span> : null}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedDrug?.treatmentDuration && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Duration</p>
                    <p className="text-sm text-gray-700">{selectedDrug.treatmentDuration}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400 text-center">
                  {selectedDrug?.source ?? 'Source: KKH CE Guidelines Jan 2026'}
                </p>
              </div>
            ) : isWeightBanded ? (
              <>
                <WeightInput onWeightChange={kg => { setWeightKg(kg); setDoseResult(null) }} />
                {weightKg !== null && selectedDrug?.weightBandedDosing && (() => {
                  const bands = selectedDrug.weightBandedDosing!
                  const matched = bands.find(b => b.maxWeightKg === null || weightKg <= b.maxWeightKg)
                  return (
                    <div className="mt-6 space-y-4">
                      {matched && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Dose</p>
                          <p className="text-5xl font-bold text-blue-800 leading-none">
                            {matched.doseMg} <span className="text-2xl font-semibold text-blue-500">mg</span>
                          </p>
                          <p className="text-blue-600 text-lg mt-2 font-medium">{matched.frequency}</p>
                          <p className="text-blue-400 text-xs mt-1">{matched.notes}</p>
                          {selectedDrug.treatmentDuration && (
                            <p className="text-blue-500 text-sm mt-2">Duration: {selectedDrug.treatmentDuration}</p>
                          )}
                        </div>
                      )}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">All weight bands</p>
                        <div className="space-y-1">
                          {bands.map((band, i) => (
                            <div
                              key={i}
                              className={`flex justify-between items-center text-sm px-3 py-2 rounded-lg ${matched === band ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-600'}`}
                            >
                              <span>{band.notes}</span>
                              <span>{band.doseMg} mg {band.frequency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {selectedDrug.infantDosing && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Infant dosing (&lt;1 year)</p>
                          <div className="space-y-1">
                            {selectedDrug.infantDosing.map((inf, i) => (
                              <div key={i} className="flex justify-between items-center text-sm text-amber-800">
                                <span>{inf.ageLabel}</span>
                                <span>{inf.doseMgPerKg} mg/kg {inf.frequency}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 text-center">
                        {selectedDrug.source ?? 'Source: KKH CE Guidelines Jan 2026'}
                      </p>
                    </div>
                  )
                })()}
              </>
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

                {doseResult && selectedDrug?.dosingNote && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Dosing note</p>
                    <p className="text-sm text-amber-800">{selectedDrug.dosingNote}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <Disclaimer />
    </div>
  )
}
