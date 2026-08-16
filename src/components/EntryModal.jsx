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

export default function EntryModal({ onClose, onSubmit, onRemove, initialDate, initialEntry }) {
  const [form, setForm] = useState({
    date: initialEntry?.date ?? initialDate ?? getTodayKey(),
    type: initialEntry?.type ?? selectableOtKeys[0],
    hours: initialEntry?.hours ?? 3,
    note: initialEntry?.note ?? '',
  })

  const isEditMode = Boolean(initialEntry)
  const selectedType = otTypes[form.type] ?? otTypes.workday
  const hasFixedHours = typeof selectedType.hours === 'number' || form.type === 'holiday'

  function submitEntry(event) {
    event.preventDefault()

    onSubmit({
      id: initialEntry?.id ?? crypto.randomUUID(),
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
      title={isEditMode ? 'แก้ไขรายการ OT' : 'เพิ่มรายการ OT'}
    >
      <form className="entry-form" onSubmit={submitEntry}>
        <label>
          วันที่
          <input
            value={form.date}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
            type="date"
            disabled={isEditMode}
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

        <div style={{ display: 'grid', gridTemplateColumns: isEditMode && onRemove ? '1fr 1fr' : '1fr', gap: '12px', marginTop: '16px', width: '100%' }}>
          {isEditMode && onRemove && (
            <button
              type="button"
              onClick={() => {
                onRemove(initialEntry.id)
                onClose()
              }}
              style={{
                padding: '14px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              ลบรายการ
            </button>
          )}
          <button className="primary-button" type="submit" style={{ marginTop: 0 }}>
            {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}
          </button>
        </div>
      </form>
    </AppModal>
  )
}
