import { useEffect, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MatchCard from './components/MatchCard'
import { supabase } from './supabase'

function requestKey(matchId) {
  return 'ipl:' + import.meta.env.VITE_SUPABASE_URL + ':' + matchId
}

export default function App() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [message, setMessage] = useState('')
  const [live, setLive] = useState(false)
  const [busy, setBusy] = useState(false)
  const bookingLock = useRef(false)
  const refresh = useRef(null)

  useEffect(() => {
    if (!supabase) return
    let active = true
    let revision = 0
    async function loadMatches() {
      const current = ++revision
      const { data, error } = await supabase.from('matches').select('*').order('id')
      if (!active || current !== revision) return
      setLoading(false)
      setLoadError(error?.message || '')
      if (!error) setMatches(data)
    }

    refresh.current = loadMatches
    loadMatches()
    const channel = supabase.channel('ipl-match-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, loadMatches)
      .subscribe(status => {
        if (!active) return
        setLive(status === 'SUBSCRIBED')
        if (status === 'SUBSCRIBED') loadMatches()
      })
    return () => {
      active = false
      refresh.current = null
      supabase.removeChannel(channel)
    }
  }, [])

  async function book(match) {
    if (bookingLock.current) return
    bookingLock.current = true
    setBusy(true)
    setMessage('Booking one ticket…')
    try {
      const key = requestKey(match.id)
      const id = sessionStorage.getItem(key) || crypto.randomUUID()
      sessionStorage.setItem(key, id)
      const { error: insertError } = await supabase.from('bookings').insert({ id, match_id: match.id })
      // A previous attempt may have created the same request before disconnecting.
      if (insertError && insertError.code !== '23505') throw insertError

      const { error } = await supabase.from('matches')
        .update({ booking_request: id }).eq('id', match.id).select('id').single()
      if (error) throw error
      sessionStorage.removeItem(key)
      setMessage('Ticket confirmed for ' + match.teams + '. Booking ID: ' + id)
    } catch (error) {
      setMessage('Booking could not be verified: ' + error.message)
    } finally {
      await refresh.current?.()
      bookingLock.current = false
      setBusy(false)
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <section id="matches">
          <h2>Match schedule</h2>
          {!supabase ? <p className="summary">Add your Supabase URL and publishable key to .env.local, then restart Vite.</p> : <>
            <p>{live ? 'Live seat updates connected' : 'Connecting to live seat updates…'} <button onClick={() => refresh.current?.()}>Refresh</button></p>
            {loading && <p>Loading matches…</p>}
            {loadError && <p role="alert">Could not load matches: {loadError}</p>}
            {!loading && !loadError && !matches.length && <p>No matches scheduled.</p>}
            <div className="cards">
              {matches.map(match => <MatchCard key={match.id} match={match} busy={busy}
                retry={Boolean(sessionStorage.getItem(requestKey(match.id)))} onBook={book} />)}
            </div>
            {message && <p className="summary" role="status">{message}</p>}
          </>}
        </section>
      </main>
    </>
  )
}
