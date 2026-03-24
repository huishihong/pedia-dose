import { useState } from 'react'
import './index.css'
import { WeightInput } from './components/WeightInput'
import { DoseResultCard } from './components/DoseResult'
import { FormulationSelector } from './components/FormulationSelector'
import { calculateParacetamol } from './utils/doseCalculator'
import type { DoseResult, Formulation } from './utils/doseCalculator'
import drugsData from './data/drugs.json'

const paracetamol = drugsData.drugs.find(d => d.id === 'paracetamol')!
const formulations = paracetamol.formulations as Formulation[]
const defaultFormulation = formulations.find(f => f.id === 'paracetamol-250-oral')!

function App() {
  const [weightKg, setWeightKg] = useState<number | null>(null)
  const [formulation, setFormulation] = useState<Formulation>(defaultFormulation)
  const [result, setResult] = useState<DoseResult | null>(null)

  function handleCalculate() {
    if (weightKg === null) return
    setResult(calculateParacetamol(weightKg, formulation))
  }

  function handleWeightChange(kg: number | null) {
    setWeightKg(kg)
    setResult(null)
  }

  function handleFormulationChange(f: Formulation) {
    setFormulation(f)
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-blue-800 tracking-tight">PediaDose</h1>
        <p className="text-gray-400 text-sm mt-0.5">Paediatric drug dose calculator</p>
      </header>

      <main className="flex-1 px-5 pb-8">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Paracetamol</h2>

          <WeightInput onWeightChange={handleWeightChange} />

          <FormulationSelector
            formulations={formulations}
            selected={formulation}
            onChange={handleFormulationChange}
          />

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

          {result && <DoseResultCard result={result} />}
        </div>
      </main>

      <footer className="sticky bottom-0 bg-amber-50 border-t-2 border-amber-200 px-5 py-3">
        <p className="text-amber-800 text-xs text-center leading-snug">
          <strong>PediaDose is a calculation aid only.</strong> Always verify doses against current formulary guidelines and apply clinical judgment.
        </p>
      </footer>
    </div>
  )
}

export default App
