export default function MatchCard({ match, selected, onSelect }) {
  return (
    <article className={selected ? 'card selected' : 'card'}>
      <p className="date">{match.date} · {match.time}</p>
      <h3>{match.teams}</h3>
      <p>{match.city}</p>
      <p className="price">From <strong>₹{match.price.toLocaleString('en-IN')}</strong></p>
      <button type="button" aria-pressed={selected} onClick={() => onSelect(match.id)}>
        {selected ? 'Selected ✓' : 'Select match'}
      </button>
    </article>
  )
}
