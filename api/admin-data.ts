import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }

  const password = req.query?.password as string
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!supabaseUrl || !secretKey) {
    res.status(500).json({ error: 'Server misconfigured' })
    return
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false }
  })

  const [flagsRes, notFoundRes] = await Promise.all([
    supabase.from('flags').select('*').order('timestamp', { ascending: false }),
    supabase.from('not_found_logs').select('*').order('timestamp', { ascending: false }),
  ])

  if (flagsRes.error || notFoundRes.error) {
    res.status(500).json({ error: 'Database error', details: flagsRes.error || notFoundRes.error })
    return
  }

  res.status(200).json({ flags: flagsRes.data, not_found_logs: notFoundRes.data })
}
