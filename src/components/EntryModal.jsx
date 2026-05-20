import { useState } from 'react'
import {
  formatDateWithWeekday,
  getEntryHours,
  getTodayKey,
  numberValue,
  selectableOtKeys,
  otTypes,
} from '../payroll'
import AppModal from './AppModal'

export default function EntryModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    date: getTodayKey(),
    type: selectableOtKeys[0],
    hours: 3,
    note: '',
  })

  const selectedType = otTypes[form.type] ?? otTypes.workday
  const hasFixedHours = typeof selectedType.hours === 'number' || form.type === 'holiday'

  function submitEntry(event) {
    event.preventDefault()

    onSubmit({
      id: crypto.randomUUID(),
      date: form.date,
      type: form.type,
      hours: hasFixedHours
        ? getEntryHours({ type: form.type, hours: form.hours })
        : Math.max(numberValue(form.hours), 0),
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
            {selectableOtKeys.map((key) => {
              const type = otTypes[key]
              return (
                <option key={key} value={key}>
                  {key === 'holiday'
                    ? `${type.label} OT1 8 ชม. + OT3 3 ชม.`
                    : `${type.label} - ${type.rate}x${type.hours}`}
                </option>
              )
            })}
          </select>
        </label>

        {hasFixedHours ? (
          <div className="auto-hours">
            <span>{form.type === 'holiday' ? 'ชั่วโมงวันหยุด' : 'ชั่วโมง OT'}</span>
            <strong>
              {form.type === 'holiday'
                ? 'OT1 8 ชม. + OT3 3 ชม.'
                : `${selectedType.hours} ชม. / วัน`}
            </strong>
          </div>
        ) : (
          <label>
            จำนวนชั่วโมง
            <input
              value={form.hours}
              onChange={(event) => setForm({ ...form, hours: event.target.value })}
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
