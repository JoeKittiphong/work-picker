import { memo, useMemo, useState } from 'react'
import {
  formatMoney,
  formatDateWithWeekday,
  getEntryAmount,
  getEntryHours,
  getEntryTypeLabel,
  getHourlyRate,
  otTypes,
} from '../payroll'
import AppModal from './AppModal'

function getMonthKeyFromDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function toMonthKey(value) {
  return value.slice(0, 7)
}

function getMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  return new Intl.DateTimeFormat('th-TH', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

function getMonthDays(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7
  const days = []

  for (let index = 0; index < leadingEmptyDays; index += 1) {
    days.push(null)
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(`${monthKey}-${String(day).padStart(2, '0')}`)
  }

  return days
}

function getCalendarEntryMeta(entry) {
  const hours = getEntryHours(entry)

  if (entry.type === 'morning') {
    return { label: 'M', display: 'M:13', hours: 13, tone: 'yellow' }
  }

  if (entry.type === 'holiday') {
    return { label: 'H', display: 'H', hours, tone: 'red' }
  }

  return {
    label: 'N',
    display: `N:${hours.toFixed(1).replace('.0', '')}`,
    hours,
    tone: 'neutral',
  }
}

function getDayTone(dayTypeEntries) {
  if (dayTypeEntries.some((item) => item.label === 'H')) {
    return 'holiday'
  }

  if (dayTypeEntries.some((item) => item.label === 'M')) {
    return 'morning'
  }

  return 'neutral'
}

function CalendarModal({ entries, onClose, settings }) {
  const hourlyRate = getHourlyRate(settings)

  const monthKeys = useMemo(() => {
    return Array.from(new Set(entries.map((entry) => toMonthKey(entry.date)))).sort(
      (left, right) => right.localeCompare(left),
    )
  }, [entries])

  const [requestedMonthKey, setRequestedMonthKey] = useState(
    () => monthKeys[0] ?? getMonthKeyFromDate(new Date()),
  )
  const [requestedSelectedDate, setRequestedSelectedDate] = useState('')

  const entriesByDate = useMemo(() => {
    return entries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = []
      }

      acc[entry.date].push(entry)
      return acc
    }, {})
  }, [entries])

  const monthKey = monthKeys.includes(requestedMonthKey)
    ? requestedMonthKey
    : monthKeys[0] ?? getMonthKeyFromDate(new Date())

  const monthEntries = entries.filter((entry) => toMonthKey(entry.date) === monthKey)
  const selectedDate =
    requestedSelectedDate && entriesByDate[requestedSelectedDate]
      ? requestedSelectedDate
      : monthEntries[0]?.date ?? ''

  const selectedEntries = selectedDate ? entriesByDate[selectedDate] ?? [] : []
  const days = getMonthDays(monthKey)
  const monthTotalHours = monthEntries.reduce((sum, entry) => sum + getEntryHours(entry), 0)
  const monthTotalAmount = monthEntries.reduce(
    (sum, entry) => sum + getEntryAmount(entry, hourlyRate),
    0,
  )

  const entriesByDateAndType = monthEntries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = {}
    }

    const typeMeta = getCalendarEntryMeta(entry)
    if (!acc[entry.date][typeMeta.label]) {
      acc[entry.date][typeMeta.label] = {
        ...typeMeta,
        hours: 0,
      }
    }

    acc[entry.date][typeMeta.label].hours += typeMeta.hours
    return acc
  }, {})

  const weekdayLabels = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']

  return (
    <AppModal onClose={onClose} title="ปฏิทิน OT">
      <div className="calendar-shell">
        <div className="calendar-toolbar">
          <button
            type="button"
            className="calendar-nav"
            onClick={() => {
              const [year, month] = monthKey.split('-').map(Number)
              setRequestedMonthKey(getMonthKeyFromDate(new Date(year, month - 2, 1)))
            }}
          >
            ก่อนหน้า
          </button>
          <strong>{getMonthLabel(monthKey)}</strong>
          <button
            type="button"
            className="calendar-nav"
            onClick={() => {
              const [year, month] = monthKey.split('-').map(Number)
              setRequestedMonthKey(getMonthKeyFromDate(new Date(year, month, 1)))
            }}
          >
            ถัดไป
          </button>
        </div>

        {monthKeys.length > 1 && (
          <div className="calendar-month-list">
            {monthKeys.map((key) => (
              <button
                key={key}
                type="button"
                className={key === monthKey ? 'active' : ''}
                onClick={() => setRequestedMonthKey(key)}
              >
                {getMonthLabel(key)}
              </button>
            ))}
          </div>
        )}

        <div className="calendar-grid">
          {weekdayLabels.map((label) => (
            <div className="calendar-weekday" key={label}>
              {label}
            </div>
          ))}

          {days.map((dateKey, index) => {
            if (!dateKey) {
              return <div className="calendar-day empty" key={`empty-${index}`} />
            }

            const dayEntries = entriesByDate[dateKey] ?? []
            const dayTypeEntries = Object.values(entriesByDateAndType[dateKey] ?? {})
            const isSelected = selectedDate === dateKey
            const hasEntries = dayEntries.length > 0
            const dayTone = hasEntries ? getDayTone(dayTypeEntries) : 'neutral'

            return (
              <button
                key={dateKey}
                type="button"
                className={`calendar-day ${isSelected ? 'selected' : ''} ${hasEntries ? 'has-entries' : ''} ${dayTone !== 'neutral' ? `type-${dayTone}` : ''}`}
                onClick={() => setRequestedSelectedDate(dateKey)}
              >
                <span className="calendar-day-number">{Number(dateKey.slice(-2))}</span>
                {hasEntries ? (
                  <div className="calendar-day-chips">
                    {dayTypeEntries.map((item) => (
                      <span className={`calendar-chip ${item.tone}`} key={`${dateKey}-${item.label}`}>
                        {item.display}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="calendar-day-empty-text">-</span>
                )}
              </button>
            )
          })}
        </div>

        <div className="calendar-summary">
          <div>
            <span>รวมทั้งเดือน</span>
            <strong>{monthTotalHours.toFixed(1)} ชม.</strong>
          </div>
          <div>
            <span>มูลค่า OT</span>
            <strong>{formatMoney(monthTotalAmount)}</strong>
          </div>
        </div>

        <div className="calendar-detail">
          <h3>
            {selectedDate ? formatDateWithWeekday(selectedDate) : 'เลือกวันเพื่อดูรายละเอียด'}
          </h3>
          {selectedEntries.length === 0 ? (
            <p className="calendar-empty">วันนี้ยังไม่มีรายการ OT</p>
          ) : (
            <div className="calendar-entry-list">
              {selectedEntries.map((entry) => {
                const type = otTypes[entry.type] ?? otTypes.workday
                const hours = getEntryHours(entry)
                const amount = getEntryAmount(entry, hourlyRate)

                return (
                  <div className="calendar-entry" key={entry.id}>
                    <div className="calendar-entry-main">
                      <span className={`type-pill ${type.tone}`}>{getEntryTypeLabel(entry)}</span>
                      <strong>{hours.toFixed(1)} ชม.</strong>
                    </div>
                    <div className="calendar-entry-side">{formatMoney(amount)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppModal>
  )
}

export default memo(CalendarModal)
