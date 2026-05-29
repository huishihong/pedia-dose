import { supabase } from '../lib/supabase'

export interface FlagPayload {
  clinician_name: string
  screen: 'details' | 'result'
  drug?: string | null
  condition?: string | null
  weight_kg?: number | null
  calculated_dose?: string | null
  free_text?: string | null
}

export async function submitFlag(payload: FlagPayload): Promise<void> {
  const { error } = await supabase.from('flags').insert({
    ...payload,
    timestamp: new Date().toISOString(),
  })
  if (error) console.error('Flag submission failed:', error)
}

export async function logNotFound(searchQuery: string): Promise<void> {
  const { error } = await supabase.from('not_found_logs').insert({
    search_query: searchQuery,
    timestamp: new Date().toISOString(),
  })
  if (error) console.error('Not-found log failed:', error)
}
