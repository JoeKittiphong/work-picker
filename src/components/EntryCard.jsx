import {
  formatDateWithWeekday,
  formatMoney,
  getEntryAmount,
  getEntryHours,
  getEntryTypeLabel,
  otTypes,
} from '../payroll'

export default function EntryCard({ entry, hourlyRate, onRemove, staggerIndex = 0 }) {
  const type = otTypes[entry.type] ?? otTypes.workday
  const amount = getEntryAmount(entry, hourlyRate)
  const hours = getEntryHours(entry)

  return (
    <article
      className="entry-card"
      style={{ '--stagger-i': staggerIndex }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: '#fff', whiteSpace: 'nowrap' }}>
          {formatDateWithWeekday(entry.date)}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={`type-pill ${type.tone}`}>
            {getEntryTypeLabel(entry)}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 'bold', flexShrink: 0 }}>{hours.toFixed(1)} ชม.</span>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {entry.note || ''}
          </p>
        </div>
      </div>
      <div className="entry-money" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        <strong style={{ fontSize: '16px', color: '#fff' }}>{formatMoney(amount)}</strong>
        <button type="button" onClick={() => onRemove(entry.id)} style={{ alignSelf: 'flex-end', marginTop: 'auto' }}>
          ลบ
        </button>
      </div>
    </article>
  )
}
