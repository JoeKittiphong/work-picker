import { memo, useMemo, useState } from 'react'
import {
  formatDisplayMoney,
  formatDateWithWeekday,
  getEntryAmount,
  getEntryHours,
  getEntryTypeLabel,
  getHourlyRate,
  isEntryWithinRange,
  filterEntriesByDateRange,
  otTypes,
  getTodayKey,
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

function formatShortDateLabel(dateKey) {
  return new Intl.DateTimeFormat('th-TH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${dateKey}T00:00:00`))
}

function toLocalDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

function getDateRangeKeys(startDate, endDate) {
  if (!startDate || !endDate) return []

  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return []

  const [first, last] = start <= end ? [start, end] : [end, start]
  const days = []
  const cursor = new Date(first)

  while (cursor <= last) {
    days.push(toLocalDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

function getRangeSections(rangeDays) {
  return rangeDays.reduce((sections, dateKey) => {
    const monthKey = dateKey.slice(0, 7)
    const currentSection = sections[sections.length - 1]

    if (!currentSection || currentSection.monthKey !== monthKey) {
      sections.push({
        monthKey,
        days: [dateKey],
      })
      return sections
    }

    currentSection.days.push(dateKey)
    return sections
  }, [])
}

function chunkArray(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

function getMonthDays(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const leadingEmptyDays = firstDay.getDay()
  const days = []

  for (let index = 0; index < leadingEmptyDays; index += 1) {
    days.push(null)
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(`${monthKey}-${String(day).padStart(2, '0')}`)
  }

  const remainder = days.length % 7
  if (remainder !== 0) {
    const paddingNeeded = 7 - remainder
    for (let index = 0; index < paddingNeeded; index += 1) {
      days.push(null)
    }
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

function isDateBoundary(dateKey, boundaryDate) {
  return Boolean(boundaryDate) && dateKey === boundaryDate
}

function CalendarModal({ entries, isPrivacyMode, onClose, settings }) {
  const hourlyRate = getHourlyRate(settings)
  const showRangeView = Boolean(settings.periodStart && settings.periodEnd)
  const rangeDays = useMemo(
    () => getDateRangeKeys(settings.periodStart, settings.periodEnd),
    [settings.periodEnd, settings.periodStart],
  )
  const rangeSections = useMemo(() => getRangeSections(rangeDays), [rangeDays])

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
  const periodEntries = filterEntriesByDateRange(entries, settings.periodStart, settings.periodEnd)
  const visibleEntries = showRangeView ? periodEntries : monthEntries
  const selectedDate =
    requestedSelectedDate && entriesByDate[requestedSelectedDate]
      ? requestedSelectedDate
      : (showRangeView ? rangeDays[0] : monthEntries[0]?.date) ?? ''

  const selectedEntries = selectedDate ? entriesByDate[selectedDate] ?? [] : []
  const periodTotalAmount = periodEntries.reduce(
    (sum, entry) => sum + getEntryAmount(entry, hourlyRate),
    0,
  )
  const periodOt15Hours = periodEntries.reduce((sum, entry) => {
    if (entry.type !== 'holiday') {
      return sum + getEntryHours(entry)
    }
    return sum
  }, 0)
  const periodMorningDays = periodEntries.filter((entry) => entry.type === 'morning').length
  const periodHolidayDays = periodEntries.filter((entry) => entry.type === 'holiday').length

  const entriesByDateAndType = visibleEntries.reduce((acc, entry) => {
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

  const weekdayLabels = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

  return (
    <AppModal onClose={onClose} title="ปฏิทิน OT">
      <div className="calendar-shell">
        {showRangeView ? (
          <>
            <div className="calendar-toolbar">
              <strong>
                {formatShortDateLabel(settings.periodStart)} - {formatShortDateLabel(settings.periodEnd)}
              </strong>
            </div>

            {rangeSections.map((section) => {
              const monthDays = getMonthDays(section.monthKey)
              const weeks = chunkArray(monthDays, 7)
              const visibleWeeks = weeks.filter((week) =>
                week.some((dateKey) => dateKey && section.days.includes(dateKey))
              )
              const flatVisibleDays = visibleWeeks.flat()

              return (
                <section className="calendar-range-section" key={section.monthKey}>
                  <h3 className="calendar-range-title">{getMonthLabel(section.monthKey)}</h3>
                  <div className="calendar-range-weekdays">
                    {weekdayLabels.map((label) => (
                      <div className="calendar-weekday" key={`${section.monthKey}-${label}`}>
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="calendar-grid calendar-range-grid">
                    {flatVisibleDays.map((dateKey, index) => {
                      if (!dateKey || !section.days.includes(dateKey)) {
                        return <div className="calendar-day empty" key={`${section.monthKey}-empty-${index}`} />
                      }

                      const dayEntries = entriesByDate[dateKey] ?? []
                      const dayTypeEntries = Object.values(entriesByDateAndType[dateKey] ?? {})
                      const isSelected = selectedDate === dateKey
                      const hasEntries = dayEntries.length > 0
                      const dayTone = hasEntries ? getDayTone(dayTypeEntries) : 'neutral'
                      const isInSettingsRange = isEntryWithinRange(
                        { date: dateKey },
                        settings.periodStart,
                        settings.periodEnd,
                      )
                      const isRangeStart = isDateBoundary(dateKey, settings.periodStart)
                      const isRangeEnd = isDateBoundary(dateKey, settings.periodEnd)
                      const isToday = dateKey === getTodayKey()

                      return (
                        <button
                          key={dateKey}
                          type="button"
                          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${hasEntries ? 'has-entries' : ''} ${dayTone !== 'neutral' ? `type-${dayTone}` : ''} ${isInSettingsRange ? 'in-settings-range' : ''} ${isRangeStart ? 'range-start' : ''} ${isRangeEnd ? 'range-end' : ''}`}
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
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </>
        ) : (
          <>
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

              {getMonthDays(monthKey).map((dateKey, index) => {
                if (!dateKey) {
                  return <div className="calendar-day empty" key={`empty-${index}`} />
                }

                const dayEntries = entriesByDate[dateKey] ?? []
                const dayTypeEntries = Object.values(entriesByDateAndType[dateKey] ?? {})
                const isSelected = selectedDate === dateKey
                const hasEntries = dayEntries.length > 0
                const dayTone = hasEntries ? getDayTone(dayTypeEntries) : 'neutral'
                const isInSettingsRange = isEntryWithinRange(
                  { date: dateKey },
                  settings.periodStart,
                  settings.periodEnd,
                )
                const isRangeStart = isDateBoundary(dateKey, settings.periodStart)
                const isRangeEnd = isDateBoundary(dateKey, settings.periodEnd)
                const isToday = dateKey === getTodayKey()

                return (
                  <button
                    key={dateKey}
                    type="button"
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${hasEntries ? 'has-entries' : ''} ${dayTone !== 'neutral' ? `type-${dayTone}` : ''} ${isInSettingsRange ? 'in-settings-range' : ''} ${isRangeStart ? 'range-start' : ''} ${isRangeEnd ? 'range-end' : ''}`}
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
          </>
        )}

        <div className="calendar-summary">
          <div>
            <span>OT 1.5</span>
            <strong>{periodOt15Hours.toFixed(1)} ชม.</strong>
          </div>
          <div>
            <span>OT Morning</span>
            <strong>{periodMorningDays} วัน</strong>
          </div>
          <div>
            <span>OT วันหยุด</span>
            <strong>{periodHolidayDays} วัน</strong>
          </div>
          <div>
            <span>มูลค่า OT</span>
            <strong>{formatDisplayMoney(periodTotalAmount, isPrivacyMode)}</strong>
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
                    <div className="calendar-entry-side">
                      {formatDisplayMoney(amount, isPrivacyMode)}
                    </div>
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
