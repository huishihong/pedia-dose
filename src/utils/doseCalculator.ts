export interface Formulation {
  id: string
  label: string
  strengthMg: number
  volumeMl: number | null // null = solid (tablet or suppository)
  route: string
  ageNote?: string
}

export interface DoseResult {
  weightKg: number
  dosePerKg: number
  calculatedDoseMg: number
  cappedDoseMg: number
  volumeMl: number | null       // liquid formulations only
  solidCount: number | null     // tablet / suppository count
  solidUnit: string | null      // "tablet" or "suppository"
  isCapped: boolean
  formulation: string
  route: string
  frequency: string
  maxDailyDoses: number | null
}

export function calculateParacetamol(weightKg: number, formulation: Formulation): DoseResult {
  const dosePerKg = 15 // mg/kg
  const maxDose = 1000 // mg

  const calculatedDoseMg = Math.round(weightKg * dosePerKg)
  const cappedDoseMg = Math.min(calculatedDoseMg, maxDose)

  let volumeMl: number | null = null
  let solidCount: number | null = null
  const solidUnit: string | null = formulation.volumeMl === null
    ? (formulation.route === 'Rectal' ? 'suppository' : 'tablet')
    : null

  if (formulation.volumeMl !== null) {
    volumeMl = parseFloat(((cappedDoseMg / formulation.strengthMg) * formulation.volumeMl).toFixed(1))
  } else {
    solidCount = parseFloat((cappedDoseMg / formulation.strengthMg).toFixed(1))
  }

  return {
    weightKg,
    dosePerKg,
    calculatedDoseMg,
    cappedDoseMg,
    volumeMl,
    solidCount,
    solidUnit,
    isCapped: calculatedDoseMg > maxDose,
    formulation: formulation.label,
    route: formulation.route,
    frequency: 'Q4–6H PRN',
    maxDailyDoses: 4,
  }
}
