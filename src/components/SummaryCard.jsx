export default function SummaryCard({ label, value, staggerIndex = 0 }) {
  return (
    <article
      className="summary-card"
      style={{ '--stagger-i': staggerIndex }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}
