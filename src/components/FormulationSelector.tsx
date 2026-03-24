import type { Formulation } from '../utils/doseCalculator'

interface FormulationSelectorProps {
  formulations: Formulation[]
  selected: Formulation
  onChange: (f: Formulation) => void
}

export function FormulationSelector({ formulations, selected, onChange }: FormulationSelectorProps) {
  const oral = formulations.filter(f => f.route === 'Oral')
  const rectal = formulations.filter(f => f.route === 'Rectal')

  return (
    <div className="w-full mt-4">
      <label className="block text-sm font-medium text-gray-600 mb-2">Formulation</label>

      {oral.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Oral</p>
          <div className="flex flex-wrap gap-2">
            {oral.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => onChange(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors text-left ${
                  selected.id === f.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                {f.label}
                {f.ageNote && (
                  <span className={`block text-xs mt-0.5 ${selected.id === f.id ? 'text-blue-200' : 'text-gray-400'}`}>
                    {f.ageNote}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {rectal.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Rectal</p>
          <div className="flex flex-wrap gap-2">
            {rectal.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => onChange(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors text-left ${
                  selected.id === f.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                {f.label}
                {f.ageNote && (
                  <span className={`block text-xs mt-0.5 ${selected.id === f.id ? 'text-blue-200' : 'text-gray-400'}`}>
                    {f.ageNote}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
