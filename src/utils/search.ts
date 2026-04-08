import drugsData from '../data/drugs.json'
import conditionsData from '../data/conditions.json'

export interface SearchResult {
  type: 'condition' | 'drug'
  id: string
  name: string
  subtitle: string
}

export function search(query: string): SearchResult[] {
  const q = query.toLowerCase().trim()
  if (q.length < 2) return []

  const conditions: SearchResult[] = conditionsData.conditions
    .filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.aliases?.some(a => a.toLowerCase().includes(q))
    )
    .map(c => ({
      type: 'condition' as const,
      id: c.id,
      name: c.name,
      subtitle: c.section,
    }))

  const drugs: SearchResult[] = (drugsData.drugs as Array<{
    id: string; name: string; aliases?: string[]; category?: string
  }>)
    .filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.aliases?.some(a => a.toLowerCase().includes(q))
    )
    .map(d => ({
      type: 'drug' as const,
      id: d.id,
      name: d.name,
      subtitle: d.category ?? '',
    }))

  return [...conditions, ...drugs]
}
