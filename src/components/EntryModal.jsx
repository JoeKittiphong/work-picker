import { useState } from 'react'
import {
  formatDateWithWeekday,
  getTodayKey,
  numberValue,
  otTypes,
} from '../payroll'
import AppModal from './AppModal'

export default function EntryModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    date: getTodayKey(),
    type: 'workday',
    hours: 3,
    note: '',
  })

  function submitEntry(event) {
    event.preventDefault()

    onSubmit({
      id: crypto.randomUUID(),
      date: form.date,
      type: form.type,
      hours: Math.max(numberValue(form.hours), 0),
      note: form.note.trim(),
    })
  }

  return (
    <AppModal
      dateHint={formatDateWithWeekday(form.date)}
      onClose={onClose}
      title="เพิ่มรายการ OT"
    >
      <form className="entry-form" onSubmit={submitEntry}>
        <label>
          วันที่
          <input
            value={form.date}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
            type="date"
          />
        </label>

        <label>
          ประเภท OT
          <select
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value })}
          >
            {Object.entries(otTypes).map(([key, type]) => (
              <option key={key} value={key}>
                {key === 'morning'
                  ? `${type.label} 13 ชม.`
                  : key === 'holiday'
                  ? `${type.label} OT1 8 ชม. + OT3 3 ชม.`
                  : `${type.label} x${type.rate}`}
              </option>
            ))}
          </select>
        </label>

        {form.type === 'holiday' || form.type === 'morning' ? (
          <div className="auto-hours">
            <span>
              {form.type === 'morning' ? 'ชั่วโมง OT morning' : 'ชั่วโมงวันหยุด'}
            </span>
            <strong>
              {form.type === 'morning' ? '13 ชม.' : 'OT1 8 ชม. + OT3 3 ชม.'}
            </strong>
          </div>
        ) : (
          <label>
            จำนวนชั่วโมง
            <input
              value={form.hours}
              onChange={(event) =>
                setForm({ ...form, hours: event.target.value })
              }
              inputMode="decimal"
              min="0"
              step="0.5"
              type="number"
            />
          </label>
        )}

        <label>
          หมายเหตุ
          <input
            value={form.note}
            onChange={(event) => setForm({ ...form, note: event.target.value })}
            placeholder="เช่น กะดึก งานด่วน"
            type="text"
          />
        </label>

        <button className="primary-button" type="submit">
          เพิ่มรายการ
        </button>
      </form>
    </AppModal>
  )
}
