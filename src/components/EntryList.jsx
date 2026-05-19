import { memo } from 'react'
import EntryCard from './EntryCard'

function EntryList({ entries, hourlyRate, onRemove }) {
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

export default memo(EntryList)
