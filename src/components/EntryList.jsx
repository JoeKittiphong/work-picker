import { memo, useRef } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import EntryCard from './EntryCard'

function EntryList({ entries, hourlyRate, onRemove }) {
  const listRef = useRef(null)

  const virtualizer = useWindowVirtualizer({
    count: entries.length,
    estimateSize: () => 84, // Estimate based on EntryCard height + 8px gap
    overscan: 5,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  })

  return (
    <div ref={listRef} className="entry-list" style={{ display: 'block', padding: 0 }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const entry = entries[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${
                  virtualRow.start - virtualizer.options.scrollMargin
                }px)`,
                paddingBottom: '8px', // Simulate grid gap
              }}
            >
              <EntryCard
                entry={entry}
                hourlyRate={hourlyRate}
                onRemove={onRemove}
                staggerIndex={0}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(EntryList)
