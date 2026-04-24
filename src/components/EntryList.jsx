import EntryCard from './EntryCard'

export default function EntryList({ entries, hourlyRate, onRemove }) {
  return (
    <div className="entry-list">
      {entries.map((entry, index) => (
        <EntryCard
          entry={entry}
          hourlyRate={hourlyRate}
          key={entry.id}
          onRemove={onRemove}
          staggerIndex={index}
        />
      ))}
    </div>
  )
}
