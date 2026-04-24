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
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: '#fff', whiteSpace: 'nowrap' }}>
            {formatDateWithWeekday(entry.date)}
          </h2>
          <span className={`type-pill ${type.tone}`}>
            {getEntryTypeLabel(entry)}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 'bold' }}>{hours.toFixed(1)} ชม.</span>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {entry.note || 'ไม่มีหมายเหตุ'}
        </p>
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
