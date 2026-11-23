import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MatchCard from './components/MatchCard'
import { matches } from './matches'

export default function App() {
  const [selectedId, setSelectedId] = useState(null)
  const selectedMatch = matches.find(match => match.id === selectedId)

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <section id="matches">
          <h2>Match schedule</h2>
          <div className="cards">
            {matches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                selected={match.id === selectedId}
                onSelect={setSelectedId}
              />
            ))}
          </div>
          <p className="summary" role="status">
            {selectedMatch ? 'Selected match: ' + selectedMatch.teams : 'Select a match to see your choice here.'}
          </p>
        </section>
      </main>
    </>
  )
}
