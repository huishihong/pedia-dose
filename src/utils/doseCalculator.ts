export interface DoseResult {
  weightKg: number
  dosePerKg: number
  calculatedDoseMg: number
  cappedDoseMg: number
  volumeMl: number
  isCapped: boolean
  frequency: string
  formulation: string
  route: string
  maxDailyDoses: number
}

export function calculateParacetamol(weightKg: number): DoseResult {
  const dosePerKg = 15 // mg/kg
  const maxDose = 1000 // mg
  const formulationStrength = 250 // mg per 5 mL
  const formulationVolume = 5 // mL

  const calculatedDoseMg = Math.round(weightKg * dosePerKg)
  const cappedDoseMg = Math.min(calculatedDoseMg, maxDose)
  const volumeMl = parseFloat(((cappedDoseMg / formulationStrength) * formulationVolume).toFixed(1))

  return {
    weightKg,
    dosePerKg,
    calculatedDoseMg,
    cappedDoseMg,
    volumeMl,
    isCapped: calculatedDoseMg > maxDose,
    frequency: 'Q4–6H PRN',
    formulation: '250 mg/5 mL suspension',
    route: 'Oral or rectal',
    maxDailyDoses: 4,
  }
}
