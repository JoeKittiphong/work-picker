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
      <div>
        <span className={`type-pill ${type.tone}`}>
          {getEntryTypeLabel(entry)}
        </span>
        <h2>{formatDateWithWeekday(entry.date)}</h2>
        <p>{entry.note || 'ไม่มีหมายเหตุ'}</p>
      </div>
      <div className="entry-money">
        <strong>{formatMoney(amount)}</strong>
        <span>{hours.toFixed(1)} ชม.</span>
        <button type="button" onClick={() => onRemove(entry.id)}>
          ลบ
        </button>
      </div>
    </article>
  )
}
