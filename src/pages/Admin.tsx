import { useState } from 'react'

interface FlagRow {
  id: string
  clinician_name: string
  screen: string
  drug: string | null
  condition: string | null
  weight_kg: number | null
  calculated_dose: string | null
  free_text: string | null
  timestamp: string
}

interface NotFoundRow {
  id: string
  search_query: string
  timestamp: string
}

function formatTs(ts: string) {
  return new Date(ts).toLocaleString('en-SG', { dateStyle: 'short', timeStyle: 'short' })
}

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export function AdminPage() {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'ready'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [flags, setFlags] = useState<FlagRow[]>([])
  const [notFound, setNotFound] = useState<NotFoundRow[]>([])
  const [tab, setTab] = useState<'flags' | 'not_found'>('flags')
  const [filterName, setFilterName] = useState('')
  const [filterDrug, setFilterDrug] = useState('')
  const [filterScreen, setFilterScreen] = useState('')

  async function handleLogin() {
    setStatus('loading')
    try {
      const res = await fetch(`/api/admin-data?password=${encodeURIComponent(password)}`)
      if (res.status === 401) { setStatus('error'); setErrorMsg('Wrong password'); return }
      if (!res.ok) { setStatus('error'); setErrorMsg('Server error'); return }
      const data = await res.json()
      setFlags(data.flags)
      setNotFound(data.not_found_logs)
      setStatus('ready')
    } catch {
      setStatus('error')
      setErrorMsg('Could not reach server')
    }
  }

  const filteredFlags = flags.filter(f =>
    (!filterName || f.clinician_name.toLowerCase().includes(filterName.toLowerCase())) &&
    (!filterDrug || (f.drug ?? f.condition ?? '').toLowerCase().includes(filterDrug.toLowerCase())) &&
    (!filterScreen || f.screen === filterScreen)
  )

  if (status !== 'ready') {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm w-full max-w-sm">
          <h1 className="text-lg font-bold text-gray-900 mb-1">PediaDose Admin</h1>
          <p className="text-sm text-gray-400 mb-6">Flag dashboard — restricted access</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Admin password"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            autoFocus
          />
          {status === 'error' && <p className="text-red-500 text-xs mb-3">{errorMsg}</p>}
          <button
            type="button"
            onClick={handleLogin}
            disabled={!password || status === 'loading'}
            className="w-full py-2.5 rounded-full text-sm font-semibold bg-blue-600 text-white
              disabled:bg-gray-100 disabled:text-gray-300 hover:enabled:bg-blue-700 transition-colors"
          >
            {status === 'loading' ? 'Loading…' : 'Sign in'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <header className="sticky top-0 z-50 bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900">PediaDose Admin</h1>
          <p className="text-xs text-gray-400">{flags.length} flags · {notFound.length} not-found events</p>
        </div>
        <button
          type="button"
          onClick={() => { setStatus('idle'); setPassword('') }}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Tabs */}
        <div className="flex bg-gray-200 rounded-full p-1 gap-1 w-fit">
          <button
            type="button"
            onClick={() => setTab('flags')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'flags' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Flags ({flags.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('not_found')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'not_found' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Not found ({notFound.length})
          </button>
        </div>

        {tab === 'flags' && (
          <>
            {/* Filters + export */}
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="text"
                value={filterName}
                onChange={e => setFilterName(e.target.value)}
                placeholder="Filter by clinician…"
                className="border border-gray-200 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
              />
              <input
                type="text"
                value={filterDrug}
                onChange={e => setFilterDrug(e.target.value)}
                placeholder="Filter by drug / condition…"
                className="border border-gray-200 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
              />
              <select
                value={filterScreen}
                onChange={e => setFilterScreen(e.target.value)}
                className="border border-gray-200 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">All screens</option>
                <option value="details">Details</option>
                <option value="result">Result</option>
              </select>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadJSON(filteredFlags, 'pediadose-flags.json')}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 hover:border-gray-400 transition-colors"
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => downloadCSV(filteredFlags as unknown as Record<string, unknown>[], 'pediadose-flags.csv')}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 hover:border-gray-400 transition-colors"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* Flags table */}
            {filteredFlags.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">No flags yet</div>
            ) : (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Time', 'Clinician', 'Screen', 'Drug / Condition', 'Weight', 'Dose', 'Note'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredFlags.map(f => (
                        <tr key={f.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatTs(f.timestamp)}</td>
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{f.clinician_name}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.screen === 'result' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                              {f.screen}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{f.drug ?? f.condition ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{f.weight_kg != null ? `${f.weight_kg} kg` : '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{f.calculated_dose ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs">{f.free_text || <span className="text-gray-300 italic">none</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'not_found' && (
          <>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => downloadJSON(notFound, 'pediadose-not-found.json')}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 hover:border-gray-400 transition-colors"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => downloadCSV(notFound as unknown as Record<string, unknown>[], 'pediadose-not-found.csv')}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 hover:border-gray-400 transition-colors"
              >
                Export CSV
              </button>
            </div>
            {notFound.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">No not-found events yet</div>
            ) : (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Time', 'Search query'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {notFound.map(n => (
                      <tr key={n.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatTs(n.timestamp)}</td>
                        <td className="px-4 py-3 text-gray-800 font-medium">"{n.search_query}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
