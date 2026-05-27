import { memo } from 'react'
import { isEntryWithinRange } from '../payroll'
import EntryCard from './EntryCard'

function EntryList({ entries, hourlyRate, isPrivacyMode, onRemove, periodEnd, periodStart }) {
  return (
    <div className="entry-list">
      {entries.map((entry, index) => (
        <EntryCard
          entry={entry}
          hourlyRate={hourlyRate}
          isPrivacyMode={isPrivacyMode}
          key={entry.id}
          onRemove={onRemove}
          staggerIndex={index}
          isWithinRange={isEntryWithinRange(entry, periodStart, periodEnd)}
        />
      ))}
    </div>
  )
}

export default memo(EntryList)
