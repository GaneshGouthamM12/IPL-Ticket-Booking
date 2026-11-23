export default function MatchCard({ match, busy, retry, onBook }) {
  const soldOut = match.available_seats === 0
  return (
    <article className="card">
      <p className="date">{match.date} · {match.time}</p>
      <h3>{match.teams}</h3>
      <p>{match.city}</p>
      <p className="price">₹{match.price.toLocaleString('en-IN')} per ticket</p>
      <p>Available seats: <strong>{match.available_seats}</strong></p>
      <button disabled={busy || (soldOut && !retry)} onClick={() => onBook(match)}>
        {retry ? 'Retry booking' : soldOut ? 'Sold out' : 'Book 1 ticket'}
      </button>
    </article>
  )
}
