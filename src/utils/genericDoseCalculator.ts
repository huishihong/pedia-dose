import drugsData from '../data/drugs.json'

export interface DefaultFormulation {
  label: string
  strengthMg: number
  volumeMl: number
  route: string
}

export interface GenericDoseResult {
  drugName: string
  weightKg: number
  dosePerKg: number
  calculatedMg: number
  cappedMg: number
  isCapped: boolean
  maxDose: number | null
  volumeMl: number | null
  formulation: string | null
  route: string
  frequency: string
  cautions: string[]
  clinicalNote?: string
}

type DrugEntry = {
  id: string
  name: string
  dosePerKg?: number
  maxDose?: number | null
  frequency?: string
  routes?: Array<{ route: string }>
  defaultFormulation?: DefaultFormulation
  cautions?: string[]
  hospitalOnly?: boolean
}

function roundMg(mg: number): number {
  if (mg < 1) return parseFloat(mg.toFixed(2))
  if (mg < 10) return parseFloat(mg.toFixed(1))
  return Math.round(mg)
}

export function calculateGenericDose(
  drugId: string,
  weightKg: number,
  overrideDosePerKg?: number,
  overrideMaxDose?: number,
  overrideFrequency?: string,
  clinicalNote?: string
): GenericDoseResult | null {
  const drug = (drugsData.drugs as DrugEntry[]).find(d => d.id === drugId)
  if (!drug) return null

  const dosePerKg = overrideDosePerKg ?? drug.dosePerKg
  if (dosePerKg == null) return null

  const maxDose = overrideMaxDose ?? (drug.maxDose ?? null)
  const calculatedMg = roundMg(weightKg * dosePerKg)
  const cappedMg = maxDose !== null ? Math.min(calculatedMg, maxDose) : calculatedMg
  const isCapped = maxDose !== null && calculatedMg > maxDose

  const formulation = drug.defaultFormulation ?? null
  let volumeMl: number | null = null
  if (formulation && formulation.volumeMl > 0) {
    volumeMl = parseFloat(((cappedMg / formulation.strengthMg) * formulation.volumeMl).toFixed(1))
  }

  const primaryRoute = drug.defaultFormulation?.route
    ?? drug.routes?.[0]?.route
    ?? 'Oral'

  return {
    drugName: drug.name,
    weightKg,
    dosePerKg,
    calculatedMg,
    cappedMg,
    isCapped,
    maxDose,
    volumeMl,
    formulation: formulation?.label ?? null,
    route: primaryRoute,
    frequency: overrideFrequency ?? drug.frequency ?? '',
    cautions: drug.cautions ?? [],
    clinicalNote,
  }
}

// Calculate dose for a drug entry from conditions.json
export function calculateConditionDrug(
  drugId: string,
  weightKg: number,
  doseMgPerKg: number | null,
  maxDoseMg: number | null,
  frequency: string,
  route: string,
  doseInstruction: string | null,
  clinicalNote?: string | null
): {
  drugName: string
  isCalculated: boolean
  calculatedMg: number | null
  cappedMg: number | null
  isCapped: boolean
  volumeMl: number | null
  formulation: string | null
  instruction: string
  frequency: string
  route: string
  clinicalNote: string | null
  cautions: string[]
} {
  const drug = (drugsData.drugs as DrugEntry[]).find(d =>
    d.id === drugId ||
    d.id === drugId.replace('-mdi', '').replace('-nebulised', '').replace('-neb', '').replace('-iv', '').replace('-rectal', '').replace('-buccal', '')
  )

  const drugName = drug?.name ?? drugId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  // Non-weight-based: just show the instruction
  if (doseMgPerKg === null || doseMgPerKg === undefined) {
    return {
      drugName,
      isCalculated: false,
      calculatedMg: null,
      cappedMg: null,
      isCapped: false,
      volumeMl: null,
      formulation: null,
      instruction: doseInstruction ?? 'See clinical guidelines',
      frequency,
      route,
      clinicalNote: clinicalNote ?? null,
      cautions: drug?.cautions ?? [],
    }
  }

  const calculatedMg = roundMg(weightKg * doseMgPerKg)
  const cappedMg = maxDoseMg !== null ? Math.min(calculatedMg, maxDoseMg) : calculatedMg
  const isCapped = maxDoseMg !== null && calculatedMg > maxDoseMg

  const formulation = drug?.defaultFormulation ?? null
  let volumeMl: number | null = null
  if (formulation && formulation.volumeMl > 0) {
    volumeMl = parseFloat(((cappedMg / formulation.strengthMg) * formulation.volumeMl).toFixed(1))
  }

  return {
    drugName,
    isCalculated: true,
    calculatedMg,
    cappedMg,
    isCapped,
    volumeMl,
    formulation: formulation?.label ?? null,
    instruction: doseInstruction ?? `${cappedMg} mg`,
    frequency,
    route,
    clinicalNote: clinicalNote ?? null,
    cautions: drug?.cautions ?? [],
  }
}
