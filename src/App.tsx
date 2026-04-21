import { useState, useEffect } from 'react'
import './index.css'
import logoUrl from './assets/logo.svg'
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
  minAge?: string;
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

function ChevronRight() {
  return (
    <svg className="w-4 h-4 text-gray-300 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function Disclaimer() {
  return (
    <footer className="sticky bottom-0 bg-amber-50 border-t border-amber-200 px-4 py-3">
      <p className="text-amber-800 text-xs text-center leading-snug">
        <strong>Calculation aid only.</strong> Always verify doses against current formulary guidelines and apply clinical judgment.
      </p>
    </footer>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [homeTab, setHomeTab] = useState<'conditions' | 'drugs'>('drugs')

  const [weightKg, setWeightKg] = useState<number | null>(null)
  const [formulation, setFormulation] = useState<Formulation>(defaultParacetamolFormulation)
  const [doseResult, setDoseResult] = useState<DoseResult | null>(null)

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
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col max-w-lg md:max-w-2xl mx-auto">
      <header className="sticky top-0 z-50 bg-white shadow-sm px-4 py-4 flex flex-col items-center">
        <button type="button" onClick={handleBack} className="flex flex-col items-center">
          <img src={logoUrl} alt="PediaDose" className="h-10" />
          <p className="text-gray-400 text-xs mt-1 tracking-wide">Paediatric drug dosing tool</p>
        </button>
      </header>

      <main className="flex-1 px-4 pb-8">

        {/* HOME / SEARCH */}
        {screen === 'home' && (
          <div>
            <div className="mt-4">
              <SearchBar value={query} onChange={setQuery} onClear={() => setQuery('')} />
            </div>

            {query.length >= 2 ? (
              <SearchResults results={searchResults} query={query} onSelect={handleSelect} />
            ) : (
              <>
                {/* Tab toggle */}
                <div className="flex mt-4 bg-gray-200 rounded-full p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setHomeTab('drugs')}
                    className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${homeTab === 'drugs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Drugs
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeTab('conditions')}
                    className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${homeTab === 'conditions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Conditions
                  </button>
                </div>

                {/* Alphabetical list — grouped MFP-style on mobile, grid on desktop */}
                <div className="mt-3">
                  {homeTab === 'conditions' && (() => {
                    const items = [...conditionsData.conditions].sort((a, b) => a.name.localeCompare(b.name))
                    return (
                      <>
                        <div className="rounded-2xl overflow-hidden bg-white shadow-sm md:hidden">
                          {items.map((c, i) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelect({ id: c.id, name: c.name, subtitle: c.section ?? '', type: 'condition' })}
                              className={`w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors ${i < items.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{c.section}</p>
                              </div>
                              <ChevronRight />
                            </button>
                          ))}
                        </div>
                        <div className="hidden md:grid grid-cols-2 gap-2">
                          {items.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelect({ id: c.id, name: c.name, subtitle: c.section ?? '', type: 'condition' })}
                              className="w-full text-left px-4 py-4 rounded-2xl bg-white shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-between"
                            >
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{c.section}</p>
                              </div>
                              <ChevronRight />
                            </button>
                          ))}
                        </div>
                      </>
                    )
                  })()}
                  {homeTab === 'drugs' && (() => {
                    const items = [...drugsData.drugs].sort((a, b) => a.name.localeCompare(b.name))
                    return (
                      <>
                        <div className="rounded-2xl overflow-hidden bg-white shadow-sm md:hidden">
                          {items.map((d, i) => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => handleSelect({ id: d.id, name: d.name, subtitle: (d as DrugEntry).category ?? '', type: 'drug' })}
                              className={`w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors ${i < items.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{d.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{(d as DrugEntry).category}</p>
                              </div>
                              <ChevronRight />
                            </button>
                          ))}
                        </div>
                        <div className="hidden md:grid grid-cols-2 gap-2">
                          {items.map(d => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => handleSelect({ id: d.id, name: d.name, subtitle: (d as DrugEntry).category ?? '', type: 'drug' })}
                              className="w-full text-left px-4 py-4 rounded-2xl bg-white shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-between"
                            >
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{d.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{(d as DrugEntry).category}</p>
                              </div>
                              <ChevronRight />
                            </button>
                          ))}
                        </div>
                      </>
                    )
                  })()}
                </div>
              </>
            )}
          </div>
        )}

        {/* CONDITION FLOW */}
        {screen === 'condition' && selectedId && (() => {
          const dbg = new URLSearchParams(window.location.search).get('debug')
          return (
            <div className="mt-4 bg-white rounded-2xl p-6 shadow-sm">
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
          <div className="mt-4 bg-white rounded-2xl p-6 shadow-sm">
            <button type="button" onClick={handleBack} className="flex items-center gap-1 text-blue-600 text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedDrug.name}</h2>
            {selectedDrug.category && (
              <p className="text-sm text-gray-400">{selectedDrug.category}</p>
            )}
            {(() => {
              const age = selectedDrug.minAge
              const showBadge = age && age !== 'Any age' && age !== 'neonate'
              return showBadge ? (
                <span className="inline-flex items-center text-xs font-semibold bg-blue-50 text-blue-700 rounded-full px-3 py-1 mt-2">
                  Min. age: {age}
                </span>
              ) : null
            })()}
            <div className="mb-4" />

            {isIVOnly ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <p className="text-amber-800 text-sm font-medium">
                  This drug is administered intravenously (IV) or in a hospital setting only.
                  Search by condition for dosing guidance.
                </p>
              </div>
            ) : isAgeBanded ? (
              <div className="mt-2 space-y-4">
                {selectedDrug?.ageBandedDosing && (
                  <div className="bg-gray-50 rounded-2xl overflow-hidden">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-2">Dose by age</p>
                    <div>
                      {selectedDrug.ageBandedDosing.map((band, i) => (
                        <div key={i} className={`flex justify-between items-start px-4 py-3 text-sm ${i < selectedDrug.ageBandedDosing!.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          <span className="font-medium text-gray-700 flex-shrink-0">{band.ageLabel}</span>
                          {(() => {
                            const hasValue = band.doseMg != null || band.volumeMl != null
                            if (hasValue) {
                              return (
                                <span className="text-right text-gray-900 font-semibold ml-4">
                                  {band.doseMg != null ? `${band.doseMg} mg` : `${band.volumeMl} mL`}
                                  {band.formulation ? ` (${band.formulation})` : ''}
                                  {band.frequency ? ` — ${band.frequency}` : ''}
                                  {band.notes && <span className="block text-xs text-gray-400 font-normal mt-0.5">{band.notes}</span>}
                                </span>
                              )
                            }
                            return (
                              <span className="text-right ml-4">
                                <span className="font-semibold text-gray-900">{band.notes ?? ''}</span>
                                {band.frequency && <span className="block text-xs text-gray-500 font-normal mt-0.5">{band.frequency}</span>}
                              </span>
                            )
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedDrug?.treatmentDuration && (
                  <div className="flex justify-between items-center bg-gray-50 rounded-2xl px-4 py-3">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedDrug.treatmentDuration}</p>
                  </div>
                )}
                {selectedDrug?.dosingNote && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Dosing note</p>
                    <p className="text-sm text-amber-800">{selectedDrug.dosingNote}</p>
                  </div>
                )}
                {selectedDrug?.cautions && selectedDrug.cautions.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                    <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">Cautions</p>
                    <ul className="space-y-1">
                      {selectedDrug.cautions.map((c, i) => (
                        <li key={i} className="text-sm text-red-700">{c}</li>
                      ))}
                    </ul>
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
                    <div className="mt-6 space-y-3">
                      {matched && (
                        <div className="bg-blue-600 rounded-2xl p-6 text-white">
                          <p className="text-xs font-semibold uppercase tracking-wider text-blue-200 mb-1">Dose</p>
                          <p className="text-6xl font-bold leading-none">
                            {matched.doseMg} <span className="text-3xl font-semibold text-blue-200">mg</span>
                          </p>
                          <p className="text-blue-200 text-base mt-2 font-medium">{matched.frequency}</p>
                          <p className="text-blue-300 text-xs mt-1">{matched.notes}</p>
                          {selectedDrug.treatmentDuration && (
                            <p className="text-blue-200 text-sm mt-2">Duration: {selectedDrug.treatmentDuration}</p>
                          )}
                        </div>
                      )}
                      <div className="bg-gray-50 rounded-2xl overflow-hidden">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-2">All weight bands</p>
                        <div>
                          {bands.map((band, i) => (
                            <div
                              key={i}
                              className={`flex justify-between items-center px-4 py-3 text-sm ${matched === band ? 'bg-blue-50 text-blue-800 font-semibold' : 'text-gray-600'} ${i < bands.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                              <span>{band.notes}</span>
                              <span>{band.doseMg} mg {band.frequency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {selectedDrug.infantDosing && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
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
                    <p className="text-sm font-medium text-gray-500 mb-1">Formulation</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2">
                      {formulation.label}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCalculate}
                  disabled={weightKg === null}
                  className="mt-4 w-full py-4 rounded-full text-base font-bold transition-colors
                    bg-blue-600 text-white
                    disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed
                    hover:enabled:bg-blue-700 active:enabled:bg-blue-800"
                >
                  Calculate dose
                </button>

                {selectedDrug?.dosingNote && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Dosing note</p>
                    <p className="text-sm text-amber-800">{selectedDrug.dosingNote}</p>
                  </div>
                )}

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
